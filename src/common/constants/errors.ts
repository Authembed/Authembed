import { HttpStatus } from '@nestjs/common';

export const errors = {
  EMAIL_TAKEN: HttpStatus.CONFLICT,
};
