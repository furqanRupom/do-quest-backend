import { Injectable } from '@nestjs/common';
import { AdminRepository } from './admin.repository';
import { BaseQueryDto } from '../common/dto';
import { TaskStatus } from '../tasks/enums/tasks.enum';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  async countTotals(): Promise<{
    users: number;
    submissions: number;
    tasks: number;
  }> {
    const [users, submissions, tasks] = await Promise.all([
      this.adminRepository.countTotalUsers(),
      this.adminRepository.countTotalSubmissions(),
      this.adminRepository.countTotalTasks(),
    ]);
    return { users, submissions, tasks };
  }

  async getAllUsers(query: BaseQueryDto): Promise<any> {
    return this.adminRepository.getAllUsers(query);
  }

  async getAllSubmissions(query: BaseQueryDto): Promise<any> {
    return this.adminRepository.getAllSubmissions(query);
  }

  async getAllTasks(query: BaseQueryDto): Promise<any> {
    return this.adminRepository.getAllTasks(query);
  }
  async getTasksBountiesBarData():Promise<any>{
    return this.adminRepository.getTasksBountiesBarData();
  }
  async updateTasksStatus(
    taskId: string,
    taskStatus: { taskStatus: TaskStatus },
  ) {
    return await this.adminRepository.updateTaskStatus(taskId, taskStatus);
  }

  async updateUser(userId:string,updateUserDto:any) {
    return await this.adminRepository.updateUser(userId,updateUserDto)
  }
}
