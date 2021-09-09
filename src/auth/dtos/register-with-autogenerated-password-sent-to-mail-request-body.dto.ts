import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsObject, IsOptional } from 'class-validator';

export class RegisterWithAuthgeneratedPasswordSentToMailRequestBodyDto {
  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}
