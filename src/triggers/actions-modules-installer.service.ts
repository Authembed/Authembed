import { Inject, Injectable } from '@nestjs/common';
import {
  TRIGGERS_CONFIGS_KEY,
  TTriggersConfigs,
} from '../config/triggers.config';
import fs from 'fs/promises';
import appRootPath from 'app-root-path';
import path from 'path';
import childProcess from 'child_process';

@Injectable()
export class ActionsModulesInstallerService {
  constructor(
    @Inject(TRIGGERS_CONFIGS_KEY)
    private readonly triggersConfigs: TTriggersConfigs,
  ) {}

  async installActionsDependencies(): Promise<void> {
    const modules = this.triggersConfigs.reduce<Record<string, string>>(
      (acc, value) => ({ ...acc, ...value.modules }),
      {},
    );

    const packageJsonContent = {
      name: 'authembed-trigger-actions',
      dependencies: modules,
    };

    await fs.writeFile(
      path.join(appRootPath.toString(), 'actions', 'package.json'),
      JSON.stringify(packageJsonContent, null, 4),
    );

    await new Promise((resolve, reject) => {
      childProcess.exec(
        'npm i',
        {
          env: process.env,
          cwd: path.join(appRootPath.toString(), 'actions'),
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve(undefined);
        },
      );
    });
  }
}
