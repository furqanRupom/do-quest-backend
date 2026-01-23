import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UserRole } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { SubmissionService } from './submission.service';
import { ApproveResponseDto, CreateSubmissionDto, CreateSubmissionResponseDto, RejectResponseDto } from './dto';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { sendResponse } from '../common/utils';
import { ApiBearerAuth, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { SubmissionListDto } from './dto/submission.list.dto';

@Controller('tasks/:taskId/submissions')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.User)
@ApiBearerAuth()
export class SubmissionController {
    constructor(
        private readonly submissionService: SubmissionService,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({ type: CreateSubmissionResponseDto })
    async createSubmission(
        @Param('taskId') taskId: string,
        @Body() createSubmissionDto: CreateSubmissionDto,
        @Req() req: AuthRequest,
    ): Promise<CreateSubmissionResponseDto> {
        const result = await this.submissionService.createSubmission(createSubmissionDto, taskId, req.user.sub);
        return sendResponse({
            success: true,
            message: "Submission created successfully",
            data: result
        })
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: SubmissionListDto })
    async list(@Param('taskId') taskId: string): Promise<SubmissionListDto> {
        const result = await this.submissionService.getSubmissionsByTaskId(taskId);
        return sendResponse({
            success: true,
            message: "Submissions retrieved successfully",
            data: result
        });
    }


    @Put(':submissionId/approve')
    @ApiResponse({ type: ApproveResponseDto })
    @HttpCode(HttpStatus.OK)
    async approveSubmission(
        @Param('taskId') taskId: string,
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
    ): Promise<ApproveResponseDto> {
        const approveSubmissionDto = {
            taskId,
            submissionId,
            approverId: req.user.sub
        };
        const result = await this.submissionService.approveSubmission(approveSubmissionDto);
        return sendResponse({
            success: true,
            message: "Submission approved successfully",
            data: result
        });
    }

    @Put(':submissionId/reject')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RejectResponseDto })
    async rejectSubmission(
        @Param('taskId') taskId: string,
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
    ): Promise<RejectResponseDto> {
        const rejectSubmissionDto = {
            taskId,
            submissionId,
            approverId: req.user.sub
        };
        await this.submissionService.rejectSubmission(rejectSubmissionDto);
        return sendResponse({
            success: true,
            message: "Submission rejected successfully",
            data: null
        });
    }

}
