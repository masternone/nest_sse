import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Message } from './Type/Message';
import { createMock } from '@golevelup/ts-jest';
import { Request, Response } from 'express';

const mockRequestObject = () => {
  return createMock<Request>({
    on: jest.fn().mockReturnThis(),
  });
};
const mockResponseObject = () => {
  return createMock<Response>({
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
  });
};

describe('AppController', () => {
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appService = app.get<AppService>(AppService);
    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    beforeEach(async () => {
      appService.channels = {};
    });

    it('should store a test message', () => {
      const channel = 'test';
      const message = {
        type: 'message',
        data: { sender: 'sender1', text: 'message1' },
      } as MessageEvent<Message>;
      appService.onNewConnection(channel);
      expect(appService.channels[channel].connections).toEqual(1);
      appController.newMessage(channel, message.data.sender, message.data.text);
      appService.channels[channel].messages$.subscribe((data) => {
        if (data.type === 'message') {
          expect(data).toEqual(message);
        }
        appService.onCloseConnection(channel);
        expect(appService.channels[channel].connections).toEqual(0);
      });
    });
    it('should return a test message', () => {
      const request = mockRequestObject();
      const response = mockResponseObject();
      const channel = 'test';
      const message = {
        type: 'message',
        data: { sender: 'sender1', text: 'message1' },
      } as MessageEvent<Message>;
      appService.onNewConnection(channel);
      expect(appService.channels[channel].connections).toEqual(1);
      appController.newMessage(channel, message.data.sender, message.data.text);
      appController.sse(request, response, channel).subscribe((data) => {
        if (data.type === 'message') {
          expect(data).toEqual(message);
        }
        appService.onCloseConnection(channel);
        expect(appService.channels[channel].connections).toEqual(0);
      });
    });
  });
});
