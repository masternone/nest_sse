import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { AppService } from './app.service';
import { map, Observable } from 'rxjs';
import { Message } from './Type/Message';
import { Request, Response } from 'express';

@Controller()
export class AppController {
  intervalId: ReturnType<typeof setInterval>;

  constructor(private readonly appService: AppService) {
    this.intervalId = setInterval(() => {
      this.appService.ping();
    }, 1000 * 30);
  }

  @Get('message/test')
  test(): { message: string } {
    return { message: 'Test message' };
  }

  @Post('message/new/:channel')
  newMessage(
    @Param('channel') channel: string,
    @Body('sender') sender: string,
    @Body('message') text: string,
  ): void {
    this.appService.onNewMessage(channel, { sender, text });
  }

  @Sse('message/sse/:channel')
  sse(
    @Req() request: Request,
    @Res() response: Response,
    @Param('channel') channel: string,
  ): Observable<MessageEvent<Message>> {
    // request.on('close', () => {
    //   console.log('stream closed request on');
    //   this.appService.onCloseConnection(channel);
    // });
    // response.socket.on('close', () => {
    //   console.log('stream closed response on');
    //   this.appService.onCloseConnection(channel);
    // });
    this.appService.onNewConnection(channel);
    return this.appService.channels[channel].messages$.pipe(
      map((message) => message),
    );
  }
}
