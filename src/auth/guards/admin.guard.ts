import { AuthGuard } from '@nestjs/passport';

export const AdminAuthGuard = AuthGuard('admin');
