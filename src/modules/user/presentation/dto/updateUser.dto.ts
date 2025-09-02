
import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsBoolean()
  @IsOptional()
  isActive: boolean;
}