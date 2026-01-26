import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersRepository } from '../users/users.repository';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersRepo = app.get(UsersRepository);


    const adminData = {
        name:"@dmin",
        username:"@dmin12345",
        email:"@dmin1@example.com",
        password:"@dmin@12345"
    }

    const exists = await usersRepo.findByEmail(adminData.email);
    if (exists) {
        console.log('✅ Admin already exists');
        process.exit(0);
    }

    await usersRepo.createAdmin(adminData.username,adminData.name,adminData.email, adminData.password);
    console.log('🎉 Admin created successfully');
    process.exit(0);
}

bootstrap();
