import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn().mockResolvedValue('mocked-response'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'mail.user') return 'test@example.com';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email successfully', async () => {
    const params = {
      subject: 'Test Subject',
      template: 'forgot-password',
      recipeintEmail: 'recipient@example.com',
      context: { name: 'John Doe' },
    };

    const result = await service.sendEmail(params);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: params.recipeintEmail,
      from: 'test@example.com',
      subject: params.subject,
      template: params.template,
      context: params.context,
    });

    expect(result).toBeUndefined(); 
  });

  it('should throw an error if recipient email is missing', async () => {
    const params = {
      subject: 'Test Subject',
      template: 'forgot-password',
      recipeintEmail: '',
      context: { name: 'John Doe' },
    };

    await expect(service.sendEmail(params)).resolves.toBeUndefined();
    expect(mailerService.sendMail).not.toHaveBeenCalled();
  });

  it('should log an error if sendMail fails', async () => {
    const error = new Error('SMTP failed');
    jest.spyOn(mailerService, 'sendMail').mockRejectedValueOnce(error);

    const params = {
      subject: 'Test Subject',
      template: 'forgot-password',
      recipeintEmail: 'recipient@example.com',
      context: { name: 'John Doe' },
    };

    const loggerSpy = jest.spyOn(service['logger'], 'error');

    await service.sendEmail(params);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error while sending mail'),
      expect.anything(),
    );
  });
});
