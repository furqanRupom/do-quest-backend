import { Injectable } from '@nestjs/common';
import { UserDto } from './dto';

@Injectable()
export class AppService {
 getHello(): string {
  return "hello people"
 }
 createUser(data:UserDto):UserDto {
    return {
        name:data.name,
        email:data.email,
        password:`argon2idversion=4abc=10nice=10${data.password}`
    }
 }
}
