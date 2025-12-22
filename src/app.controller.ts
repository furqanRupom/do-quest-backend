import { Body, Controller, Get,Param,Post,Req } from '@nestjs/common';
import { AppService } from './app.service';
import type {Request} from "express"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request:Request): string {
    return this.appService.getHello();
  }

  @Get('/hello/:id')
  getNice(@Req() request: Request, @Param() params:{id:string}): string {
    return `Id Numb is ${params.id}`
  }

  @Get('/health')
  getHealth(): string {
    return 'OK';
  }

  @Get('/version')
  getVersion(): string {
    return '1.0.0';
  }
  
}
