import Joi from 'joi';
import fs from 'fs';
import path from 'path';
import appRootPath from 'app-root-path';
import { JSONConfig } from './interfaces/json-config.interface';

const jsonConfigs: JSONConfig | null = null;

export function loadJsonConfigs(): JSONConfig {
  if (jsonConfigs) {
    return jsonConfigs;
  }

  const actionTriggerConfigSchema = Joi.object({
    on: Joi.equal('user-registered').required(),
    action: Joi.string().required(),
    modules: Joi.object().optional(),
  });

  const jsonConfigsSchema = Joi.object({
    triggers: Joi.array().items(actionTriggerConfigSchema).optional(),
  });

  const jsonFileContents = JSON.parse(
    fs.readFileSync(path.join(appRootPath.toString(), 'config.json'), 'utf8'),
  );

  const { error, value } = jsonConfigsSchema.validate(jsonFileContents);

  if (error) {
    throw error;
  }

  return value as JSONConfig;
}
