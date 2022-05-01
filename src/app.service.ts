import { Injectable } from '@nestjs/common';
import { ReplaySubject } from 'rxjs';
import { Message } from './Type/Message';

@Injectable()
export class AppService {
  public channels: {
    [channel: string]: {
      messages$: ReplaySubject<MessageEvent<Message>>;
      connections: number;
    };
  } = {};
  // public messages$ = new ReplaySubject<MessageEvent<Message>>(10);

  onNewConnection = (channel: string): void => {
    if (!this.channels[channel]) {
      this.channels[channel] = {
        messages$: new ReplaySubject<MessageEvent<Message>>(10),
        connections: 0,
      };
    }
    const messageEvent = {
      type: 'count',
      data: {
        sender: 'system',
        text: (++this.channels[channel].connections).toString(),
      },
    } as MessageEvent<Message>;
    this.channels[channel].messages$.next(messageEvent);
  };

  onCloseConnection = (channel: string): void => {
    const messageEvent = {
      type: 'count',
      data: {
        sender: 'system',
        text: (--this.channels[channel].connections).toString(),
      },
    } as MessageEvent<Message>;
    if (this.channels[channel].connections === 0) {
      this.channels[channel].messages$.complete();
    } else {
      this.channels[channel].messages$.next(messageEvent);
    }
  };

  onNewMessage = (channel: string, message: Message): void => {
    const messageEvent = {
      type: 'message',
      data: message,
    } as MessageEvent<Message>;
    this.channels[channel].messages$.next(messageEvent);
  };

  ping = (): void => {
    const d = new Date();
    const message: Message = { sender: 'system', text: d.toString() };
    const pingEvent = { type: 'ping', data: message } as MessageEvent<Message>;
    Object.keys(this.channels).forEach((channel) => {
      this.channels[channel].messages$.next(pingEvent);
    });
  };
}
