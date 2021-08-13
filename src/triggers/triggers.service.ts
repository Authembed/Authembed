import { Inject, Injectable } from '@nestjs/common';
import {
  TRIGGERS_CONFIGS_KEY,
  TTriggersConfigs,
} from '../config/triggers.config';
import { UserDocument } from '../users/schemas/user.schema';
import { APP_CONFIGS_KEY, TAppConfigs } from '../config/app.config';
import appRootPath from 'app-root-path';
import path from 'path';

@Injectable()
export class TriggersService {
  constructor(
    @Inject(TRIGGERS_CONFIGS_KEY)
    private readonly triggersConfigs: TTriggersConfigs,
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
  ) {}

  async runTriggersOnUserRegistered(user: UserDocument): Promise<void> {
    const triggerConfigsForOnUserRegistered = (
      this.triggersConfigs || []
    ).filter((config) => config.on == 'user-registered');

    for (const trigger of triggerConfigsForOnUserRegistered) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const action = require(path.join(
        appRootPath.toString(),
        'actions',
        'scripts',
        trigger.action,
      ));

      await action({
        event: 'user-registered',
        user: user.toJSON(),
      });
    }
  }
}
