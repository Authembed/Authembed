import { IsObject, IsOptional, IsString } from 'class-validator';

export class PatchUserRequestBodyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  privateMetadata?: Record<string, unknown>;
}
