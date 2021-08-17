import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetUsersBatchRequestBody {
  @ApiProperty({ type: 'string', isArray: true })
  @IsString({ each: true })
  ids: string[];
}
