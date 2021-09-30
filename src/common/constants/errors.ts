import { HttpStatus } from '@nestjs/common';

export const errors = {
  EMAIL_TAKEN: HttpStatus.CONFLICT,
  UNIQUE_METADATA_TAKEN: HttpStatus.CONFLICT,
};
