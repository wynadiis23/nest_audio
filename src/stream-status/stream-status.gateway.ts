import { Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StreamStatusService } from './stream-status.service';

@WebSocketGateway({ namespace: 'event-stream' })
@Injectable()
export class StreamStatusGateway {
  constructor(private readonly streamStatusService: StreamStatusService) {}

  @WebSocketServer()
  server: Server;

  // afterInit(client: Socket) {
  //   Logger.log('afterInit', client.connected);
  // }

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
}
