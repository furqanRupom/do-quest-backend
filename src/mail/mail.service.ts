import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) { }

    async sendEmail(params: {
        subject: string;
        template: string;
        recipeintEmail: string;
        context: ISendMailOptions['context'];
    }) {
        try {
            if (!params.recipeintEmail) {
                throw new Error(
                    `No recipients found for sending email with subject: ${params.subject}`,
                );
            }

            const sendMailParams = {
                to: params.recipeintEmail,
                from: this.configService.get<string>('mail.user'),
                subject: params.subject,
                template: params.template,
                context: params.context,
            };
            const response = await this.mailerService.sendMail(sendMailParams);
            this.logger.log(
                `Email sent successfully to recipients with the following parameters : ${JSON.stringify(
                    sendMailParams,
                )}`,
                response,
            );
        } catch (error) {
            this.logger.error(
                `Error while sending mail with the following parameters : ${JSON.stringify(
                    params,
                )}`,
                 new HttpException('Failed to send email', HttpStatus.INTERNAL_SERVER_ERROR),
            );
        }
    }
}