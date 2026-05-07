import { Body, Controller, HttpCode, HttpStatus, Put, Req, UseGuards, Get, Delete } from '@nestjs/common';
import { ChangePasswordDto, ChangePasswordResponseDto, DeleteAccountResponseDto, UpdateProfileResponseDto, UpdateUserDto, UserProfileResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { UsersService } from './users.service';
import { sendResponse } from '../common/utils';
import type { AuthRequest } from '../auth/types/auth-request.type';
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';

@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiCookieAuth('accessToken')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }


    @HttpCode(HttpStatus.OK)
    @Get('profile')
    @ApiOkResponse({ type: UserProfileResponseDto })
    async getUserProfile(@Req() req: AuthRequest): Promise<UserProfileResponseDto> {
        const result = await this.usersService.getUserProfile(req.user.sub)
        return sendResponse({
            success: true,
            message: "User Profile fetched successfully",
            data: result    
        })
    }

    @HttpCode(HttpStatus.OK)
    @Put('profile')
    @ApiOkResponse({ type: UpdateProfileResponseDto })
    async updateProfile(@Body() updateProfileDto: UpdateUserDto, @Req() req: AuthRequest): Promise<UpdateProfileResponseDto> {
        const result = await this.usersService.updateUserProfile(req.user.sub, updateProfileDto)
        return sendResponse({
            success: true,
            message: "User Profile updated successfully",
            data: result
        })
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Put('change-password')
    @ApiOkResponse({ type: ChangePasswordResponseDto })
    async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req: AuthRequest): Promise<ChangePasswordResponseDto> {
        await this.usersService.changeUserPassword(req.user.sub, changePasswordDto);
        return sendResponse({
            success: true,
            message: 'Password changed successfully',
            data: null,
        });
    }

    
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('delete-account')
    @ApiOkResponse({ type: DeleteAccountResponseDto})
    async deleteMyAccount( @Req() req: AuthRequest): Promise<DeleteAccountResponseDto> {
        await this.usersService.deleteMyAccount(req.user.sub);
        return sendResponse({
            success: true,
            message: 'User Deleted successfully',
            data: null,
        });
    }
}
