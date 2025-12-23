import { Body, Controller, Get, HttpCode, HttpStatus,  Res } from '@nestjs/common';
import type { Response } from "express"

@Controller()
export class AppController {
  constructor() { }

  @Get()
  @HttpCode(HttpStatus.OK)
  getHello(@Res() res: Response): void {
    res.status(HttpStatus.OK).json({ statusCode: 200, success: true, message: "Do quest server is running successfully" });
  }
}
