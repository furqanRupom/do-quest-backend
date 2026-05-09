import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import config from './config/config';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { TasksModule } from './tasks/tasks.module';
import { WalletModule } from './wallet/wallet.module';
import { SubmissionModule } from './submission/submission.module';
import { StripeModule } from './stripe/stripe.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      envFilePath: ['.env'],
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodbUri'),
      }),
    }),

    UsersModule,
    AuthModule,
    MailModule,
    TasksModule,
    WalletModule,
    AdminModule,
    SubmissionModule,
    StripeModule,
    PaymentModule
  ],

  controllers: [AppController],

  providers: [],
})
export class AppModule {}
