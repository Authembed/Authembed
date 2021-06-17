import { ConfigType, registerAs } from '@nestjs/config';
import { loadJsonConfigs } from './load-json-configs';

export const triggersConfigsFactory = registerAs('triggers', () => {
  const jsonConfigs = loadJsonConfigs();

  return jsonConfigs.triggers;
});

export const TRIGGERS_CONFIGS_KEY = triggersConfigsFactory.KEY;

export type TTriggersConfigs = ConfigType<typeof triggersConfigsFactory>;
