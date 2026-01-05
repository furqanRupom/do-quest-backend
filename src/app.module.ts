import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';
import { AdminRepository } from './admin/admin.repository';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { TasksRepository } from './tasks/tasks.repository';
import { TasksModule } from './tasks/tasks.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [ConfigModule.forRoot({
    load:[config],
    envFilePath:['.env'],
    isGlobal: true,
  }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory:  (config:ConfigService) => {
        return {
          uri: config.get<string>('mongodbUri'),
        };
      },
    }),
    UsersModule,
    AuthModule,
    MailModule,
    TasksModule,
    WalletModule
  ],
  controllers: [AppController, AdminController, TasksController],
  providers: [AdminService, AdminRepository, TasksService, TasksRepository],
})
export class AppModule {}
