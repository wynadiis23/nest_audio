import {
  Injectable,
  InternalServerErrorException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StreamStatusService } from './stream-status.service';
import { WsJwtAuthGuard } from './guard/ws-jwt.guard';
import { StreamStatusConfigService } from './stream-status-config/stream-status-config.service';
import { AllExceptionsSocketFilter } from '../common/exception';
import { WSAuthMiddleware } from './middleware';
import { WSAuthType } from './type';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UpdatePlaylistEvent } from '../playlist/events';

@UsePipes(new ValidationPipe())
@UseFilters(new AllExceptionsSocketFilter())
@WebSocketGateway({
  namespace: 'event-stream',
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtAuthGuard)
@Injectable()
export class StreamStatusGateway implements OnGatewayDisconnect {
  constructor(
    private readonly streamStatusService: StreamStatusService,
    private readonly streamStatusConfigService: StreamStatusConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseFilters(AllExceptionsSocketFilter)
  // afterInit(client: Socket) {
  //   client.use(SocketAuthMiddleware(this.streamStatusConfigService) as any); // because types are broken
  // }

  afterInit(server: Server) {
    const middleware = WSAuthMiddleware(this.streamStatusConfigService);
    server.use(middleware);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    message: { id: string; name: string; status: string; trackName: string },
  ): Promise<void> {
    await this.streamStatusService.updateStreamStatus(message);
    // send event to listener
    await this.sendStreamStatusUpdate();

    // return back response to sender
    client.emit('message', 'successfully transmitted');
  }

  async sendStreamStatusUpdate() {
    // send status update to listener
    const streamStatus = await this.streamStatusService.getStreamStatus();
    this.server.emit('stream-status-update', streamStatus);
  }

  async handleConnection(client: Socket) {
    const connectedUser = client.handshake.auth.payload as WSAuthType;
    console.log('client connect', client.id, connectedUser.username);

    await this.redisCacheService.set(
      `ws_user_${client.id}`,
      {
        id: client.id,
        username: connectedUser.username,
      },
      0,
    );
  }

  async handleDisconnect(client: Socket) {
    try {
      console.log(client.id, ' was disconnected');
      await this.redisCacheService.unset(`ws_user_${client.id}`);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  @OnEvent('update-playlist')
  async sendUpdatePlaylist(payload: UpdatePlaylistEvent) {
    if (payload.users.length) {
      // send to specific user
      // fetch all client id for username
      const connections: { id: string; username: string }[] =
        await this.redisCacheService.getWebSocketConnections('ws_user');

      const clients = connections.filter((connection) =>
        payload.users.includes(connection.username),
      );
      const clientIds = clients.map((client) => client.id);

      this.server.to(clientIds).emit('update-playlist', {
        playlistId: payload.id,
        status: payload.action,
      });
    } else {
      this.server.emit('update-playlist', {
        playlistId: payload.id,
        status: payload.action,
      });
    }
  }
}
