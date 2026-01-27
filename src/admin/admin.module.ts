import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';

@Module({
    imports: [AdminModule],
    controllers: [AdminController],
    providers: [AdminService,AdminRepository],
    exports: [],
})
export class AdminModule {}
