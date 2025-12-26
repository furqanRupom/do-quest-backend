import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get()
  @HttpCode(HttpStatus.OK)
  getHello() {
    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: 'Do quest server is running successfully',
      docs: '/api/v1/docs'
    }
  }
}
