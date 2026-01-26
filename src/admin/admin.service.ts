import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { BaseQueryDto } from '../common/dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository
    ) { }

    async countTotals(): Promise<{ users: number; submissions: number; tasks: number }> {
        const [users, submissions, tasks] = await Promise.all([
            this.adminRepository.countTotalUsers(),
            this.adminRepository.countTotalSubmissions(),
            this.adminRepository.countTotalTasks()
        ]);
        return { users, submissions, tasks };
    }

    async getAllUsers(query:BaseQueryDto): Promise<any> {
        return this.adminRepository.getAllUsers(query);
    }

    async getAllSubmissions(query:BaseQueryDto): Promise<any> {
        return this.adminRepository.getAllSubmissions(query);
    }

    async getAllTasks(query:BaseQueryDto): Promise<any> {
        return this.adminRepository.getAllTasks(query);
    }
}
