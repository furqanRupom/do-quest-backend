import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto';
import type { AuthRequest } from '../auth/types/auth-request.type';

@Controller('tasks/:taskId/submissions')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.User)
export class SubmissionController {
    constructor(
        private readonly submissionService: SubmissionService,
    ) { }

    @Post()
    async createSubmission(
        @Param('taskId') taskId: string,
        @Body() createSubmissionDto: CreateSubmissionDto,
        @Req() req: AuthRequest,
    ) {
        return this.submissionService.createSubmission(createSubmissionDto, taskId, req.user.sub);
    }

    @Get()
    list(@Param('taskId') taskId: string) {
        return this.submissionService.getSubmissionsByTaskId(taskId);
    }


    @Put(':submissionId/approve')
    approveSubmission(
        @Param('taskId') taskId: string,
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
    ) {
        const approveSubmissionDto = {
            taskId,
            submissionId,
            approverId: req.user.sub
        };
        return this.submissionService.approveSubmission(approveSubmissionDto);
    }

    @Put(':submissionId/reject')
    rejectSubmission(
        @Param('taskId') taskId: string,
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
    ) {
        const rejectSubmissionDto = {
            taskId,
            submissionId,
            approverId: req.user.sub
        };
        return this.submissionService.rejectSubmission(rejectSubmissionDto);
    }

}
