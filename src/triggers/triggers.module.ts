import { Module } from '@nestjs/common';
import { ActionsModulesInstallerService } from './actions-modules-installer.service';
import { TriggersService } from './triggers.service';

@Module({
  providers: [TriggersService, ActionsModulesInstallerService],
  exports: [TriggersService, ActionsModulesInstallerService],
})
export class TriggersModule {}
