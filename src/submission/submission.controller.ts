import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Req, UseGuards ,Query} from '@nestjs/common';
import { UserRole } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Roles } from '../common/decorators';
import { SubmissionService } from './submission.service';
import { ApproveResponseDto, CreateSubmissionDto, CreateSubmissionResponseDto, RejectResponseDto } from './dto';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { sendResponse } from '../common/utils';
import { ApiBearerAuth, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { SubmissionListDto } from './dto/submission.list.dto';
import { RejectSubmissionDto } from './dto/reject-submission.dto';
import { RequestRevisionDto } from './dto/request-revision.dto';
import { BaseQueryDto } from '../common/dto';

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
    async list(@Param('taskId') taskId: string,@Req()req :AuthRequest): Promise<SubmissionListDto> {
        const result = await this.submissionService.getSubmissionsByTaskId(taskId,req.user.sub);
        return sendResponse({
            success: true,
            message: "Submissions retrieved successfully",
            data: result
        });
    }

    @Get('my')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: SubmissionListDto })
    async mySubmissions(@Req()req :AuthRequest ,@Query() query:BaseQueryDto): Promise<SubmissionListDto> {
        const result = await this.submissionService.getMySubmissions(req.user.sub,query);
        return sendResponse({
            success: true,
            message: "My submissions retrieved successfully",
            meta:result.meta,
            data: result.data
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
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
        @Body() dto: RejectSubmissionDto
    ): Promise<RejectResponseDto> {
        const rejectSubmissionDto = {
            submissionId,
            approverId: req.user.sub
        };
        await this.submissionService.rejectSubmission(submissionId,req.user.sub,dto);
        return sendResponse({
            success: true,
            message: "Submission rejected successfully",
            data: null
        });
    }

    @Patch(':submissionId/revision')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RejectResponseDto })
    async revisionSubmission(
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
        @Body() dto: RequestRevisionDto
    ): Promise<RejectResponseDto> {
        await this.submissionService.revisionSubmission(submissionId,req.user.sub,dto);
        return sendResponse({
            success: true,
            message: "Submission revisioned successfully",
            data: null
        });
    }

    
    @Patch(':submissionId/resubmit')
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ type: RejectResponseDto })
    async resubmitSubmission(
        @Param('submissionId') submissionId: string,
        @Req() req: AuthRequest,
        @Body() dto: CreateSubmissionDto
    ): Promise<RejectResponseDto> {
        await this.submissionService.reSubmit(submissionId,req.user.sub,dto);
        return sendResponse({
            success: true,
            message: "Submission resubmitted successfully",
            data: null
        });
    }
}
