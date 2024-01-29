import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'event-stream' })
@Injectable()
export class StreamStatusGateway {
  @WebSocketServer()
  server: Server;

  // afterInit(client: Socket) {
  //   Logger.log('afterInit', client.connected);
  // }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: any,
  ): void {
    // this.server.emit('message', { data: 'some-data' });
    // client.emit('message', 'masuk');
    this.sendStreamStatusUpdate();
    client.emit('message', 'successfully transmitted');

    // process data to redis
  }

  sendStreamStatusUpdate() {
    this.server.emit('stream-status-update', { data: { status: 'playing' } });
  }
}
