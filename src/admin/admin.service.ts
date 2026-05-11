import { Injectable } from '@nestjs/common';
import { TaskStatus } from '../tasks/enums/tasks.enum';
import { UsersService } from '../users/users.service';
import { TasksService } from '../tasks/tasks.service';
import { SubmissionService } from '../submission/submission.service';
import { GetTasksQueryDto } from '../tasks/dto';
import { SubmissionQueryDto } from '../submission/dto/submission.list.dto';
import { UsersBaseQueryDto } from '../users/dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService:UsersService,
    private readonly tasksService:TasksService,
    private readonly submissionsService:SubmissionService
  ) {}

  async countTotals(): Promise<{
    users: number;
    submissions: number;
    tasks: number;
  }> {
    const users = await this.usersService.countAllUsers()
    const submissions = await this.submissionsService.countAllSubmissions()
    const tasks = await this.tasksService.countAllTasks()
    return { users, submissions, tasks };
  }

  async getAllUsers(query: UsersBaseQueryDto): Promise<any> {
    return this.usersService.getAllUsers(query);
  }

  async getAllSubmissions(query: SubmissionQueryDto): Promise<any> {
    return this.submissionsService.getAllSubmissions(query);
  }

  async getAllTasks(query: GetTasksQueryDto): Promise<any> {
    return this.tasksService.getAllTasksAdmin(query);
  }
  async getTasksBountiesBarData():Promise<any>{
    return this.tasksService.getTasksBountiesBarData();
  }

  async updateUser(userId:string,updateUserDto:any){
    return await this.usersService.updateUser(userId,updateUserDto)
  }
  async updateTasksStatus(
    taskId: string,
    taskStatus: { taskStatus: TaskStatus },
  ) {
    return await this.tasksService.updateTasksStatus(taskId, taskStatus);
  }


}
