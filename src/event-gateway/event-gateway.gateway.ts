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
import {
  SUBS_UPDATE_STREAM_STATUS,
  SUBS_UPDATE_USER_STATUS,
  UPDATE_PLAYLIST_EVENT_CONST,
  UPDATE_STREAM_STATUS_EVENT_CONST,
} from './const';
import { UpdateStreamStatusDtoEvent } from '../stream-status/events/dto';
import { NestGateway } from '@nestjs/websockets/interfaces/nest-gateway.interface';

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
export class EventGatewayGateway implements NestGateway {
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
    console.log(`${EventGatewayGateway.name} initializing`);
    server.use(middleware);
  }

  // subscribe incoming message of user status
  @SubscribeMessage(SUBS_UPDATE_USER_STATUS)
  async handleUserStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ) {
    const authUser = client.handshake.auth.user as WSAuthType;

    await this.redisCacheService.set(
      `ws_user_${authUser.username}`,
      {
        id: client.id,
        username: authUser.username,
      },
      360,
    );
  }

  // subscribe incoming message from web socket client
  @SubscribeMessage(SUBS_UPDATE_STREAM_STATUS)
  async handleMessageStreamStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    message: any,
  ): Promise<void> {
    // set user in redis
    const authUser = client.handshake.auth.user as WSAuthType;
    // do we really need to set user every user send a message?
    await this.redisCacheService.set(
      `ws_user_${authUser.username}`,
      {
        id: client.id,
        username: authUser.username,
      },
      360,
    );

    // get auth user from client
    message.userId = authUser.sub;

    await this.streamStatusService.updateStreamStatus(message);
    await this.streamStatusService.getStreamStatus();
  }

  async handleConnection(client: Socket) {
    const connectedUser = client.handshake.auth.user as WSAuthType;
    console.log('client connect', client.id, connectedUser.username);

    await this.redisCacheService.set(
      `ws_user_${connectedUser.username}`,
      {
        id: client.id,
        username: connectedUser.username,
      },
      360,
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

  @OnEvent(UPDATE_STREAM_STATUS_EVENT_CONST)
  async sendStreamStatusUpdate(payload: UpdateStreamStatusDtoEvent) {
    // send status update to listener
    this.server.emit(UPDATE_STREAM_STATUS_EVENT_CONST, payload);
  }

  @OnEvent(UPDATE_PLAYLIST_EVENT_CONST)
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

      this.server.to(clientIds).emit(UPDATE_PLAYLIST_EVENT_CONST, {
        playlistId: payload.id,
        status: payload.action,
      });
    } else {
      this.server.emit(UPDATE_PLAYLIST_EVENT_CONST, {
        playlistId: payload.id,
        status: payload.action,
      });
    }
  }
}
