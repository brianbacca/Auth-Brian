import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 } from 'uuid';

import { EncodeServices } from 'src/services/encode.services';
import {
  ActivateUserDto,
  ChangePasswordDto,
  LoginDto,
  RegisterUserDto,
  RequestResetPasswordDto,
  ResetPasswordDto,
} from './dto/index';
import { JwtPayload } from './interface';
import { UserRepository } from './user.repository';
import { User } from './entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly encodeServices: EncodeServices,
    private readonly jwtServices: JwtService
  ) {}

  async registerUser(dto: RegisterUserDto) {
    const { name, email, password } = dto;
    const hashPassword = await this.encodeServices.encodePassword(password);

    return this.userRepository.createUser(name, email, hashPassword, v4());
  }

  async login(dto: LoginDto): Promise<{ accesToken: string }> {
    const { email, password } = dto;
    const user = await this.userRepository.findOneByEmail(email);

    if (
      user &&
      (await this.encodeServices.checkPassword(password, user.password))
    ) {
      const payload: JwtPayload = {
        id: user.id,
        email,
        active: user.active,
      };

      const accesToken = await this.jwtServices.sign(payload);
      return { accesToken };
    }
    throw new UnauthorizedException('Please check your credentials ');
  }

  async activateUser(activateUserDto: ActivateUserDto): Promise<void> {
    const { id, code } = activateUserDto;
    const user: User =
      await this.userRepository.findOneInactiveByIdAndActivationToken(id, code);

    if (!user) {
      throw new UnauthorizedException('This action cannot be done');
    }
    this.userRepository.activateUser(user);
  }

  async requestResetPassword(dto: RequestResetPasswordDto): Promise<void> {
    const { email } = dto;
    const user: User = await this.userRepository.findOneByEmail(email);
    user.resetPasswordToken = v4();
    await this.userRepository.save(user);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { resetPasswordToken, password } = dto;

    const user: User = await this.userRepository.findOneByResetPasswordToken(
      resetPasswordToken
    );

    user.password = await this.encodeServices.encodePassword(password);
    user.resetPasswordToken = null;
    this.userRepository.save(user);
  }

  async changePassword(dto: ChangePasswordDto, user: User): Promise<void> {
    const { oldPassword, newPassword } = dto;
    if (await this.encodeServices.checkPassword(oldPassword, user.password)) {
      user.password = await this.encodeServices.encodePassword(newPassword);
      this.userRepository.save(user);
    } else {
      throw new BadRequestException('Old password does not match');
    }
  }
}
