import { AuthGuard } from '@nestjs/passport';

export const LocalGuard = AuthGuard('local');
