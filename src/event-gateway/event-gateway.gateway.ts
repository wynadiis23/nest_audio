import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StreamStatusService } from '../stream-status/stream-status.service';
import { RedisCacheService } from '../redis-cache/redis-cache.service';
import {
  Injectable,
  InternalServerErrorException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AllExceptionsSocketFilter } from '../common/exception';
import { WsJwtAuthGuard } from './guard/ws-jwt.guard';
import { WSAuthMiddleware } from './middleware';
import { WSAuthType } from './type';
import { UpdatePlaylistEvent } from '../playlist/events';
import { EventGatewayConfigService } from './event-gateway-config/event-gateway-config.service';

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
export class EventGatewayGateway {
  constructor(
    private readonly streamStatusService: StreamStatusService,
    private readonly eventGatewayConfigService: EventGatewayConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @WebSocketServer()
  server: Server;

  // @UseFilters(AllExceptionsSocketFilter)
  // afterInit(client: Socket) {
  //   client.use(SocketAuthMiddleware(this.streamStatusConfigService) as any); // because types are broken
  // }

  afterInit(server: Server) {
    const middleware = WSAuthMiddleware(this.eventGatewayConfigService);
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

  async sendStreamStatusUpdate() {
    // send status update to listener
    const streamStatus = await this.streamStatusService.getStreamStatus();
    this.server.emit('stream-status-update', streamStatus);
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
