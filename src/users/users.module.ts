import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/users.schema';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';

@Module({
  imports: [MongooseModule.forFeature([{name:User.name,schema:UserSchema}])],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController]
})
export class UsersModule {}
