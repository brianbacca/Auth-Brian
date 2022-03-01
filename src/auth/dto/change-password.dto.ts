import { IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  oldPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @Length(6, 20)
  newPassword: string;
}
