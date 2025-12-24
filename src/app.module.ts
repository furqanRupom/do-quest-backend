import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
    load:[() => config],
    envFilePath:['.env'],
    isGlobal: true,
  }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:  (config:ConfigService) => ({
        uri: config.get<string>('mongodbUri'),
      }),
    }),
    UsersModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
