import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';

import { GetUser } from './decorators';
import {
  ActivateUserDto,
  LoginDto,
  RequestResetPasswordDto,
  RegisterUserDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { User } from './entities';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authservice: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const data = await this.authservice.registerUser(dto);
    return {
      msg: 'User registered',
      data,
    };
  }

  @Post('/login')
  login(@Body() dto: LoginDto): Promise<{ accesToken: string }> {
    return this.authservice.login(dto);
  }

  @Get('/activate-account')
  activateAccount(@Query() dto: ActivateUserDto): Promise<void> {
    return this.authservice.activateUser(dto);
  }

  @Patch('/request-reset-password')
  requestResetPassword(@Body() dto: RequestResetPasswordDto): Promise<void> {
    return this.authservice.requestResetPassword(dto);
  }

  @Patch('/reset-pasword')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authservice.resetPassword(dto);
  }

  @Patch('/change-password')
  @UseGuards(AuthGuard())
  changePassword(
    @Body() dto: ChangePasswordDto,
    @GetUser() user: User
  ): Promise<void> {
    return this.authservice.changePassword(dto, user);
  }
}
