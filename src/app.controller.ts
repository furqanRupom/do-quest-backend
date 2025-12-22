import { Body, Controller, Get,Param,Post,Req } from '@nestjs/common';
import { AppService } from './app.service';
import type {Request} from "express"
import { UserDto } from './dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Req() request:Request): string {
    console.log(request.params)
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
  @Post('/create-user')
  createUser(@Body() userDto: UserDto):UserDto {
     const data =  this.appService.createUser(userDto)
     return data
  }
}
