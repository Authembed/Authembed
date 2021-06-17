import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { setupSwagger } from './lib/setup-swagger';
import { ValidationPipe } from '@nestjs/common';
import { ActionsModulesInstallerService } from './triggers/actions-modules-installer.service';

const logger = new Logger('Bootstrap');

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  setupSwagger(app);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const actionsModuleInstaller = app.get(ActionsModulesInstallerService);

  await actionsModuleInstaller.installActionsDependencies();

  const configService = app.get(ConfigService);
  const appPort = configService.get<number>('app.port');
  const appHost = configService.get<string>('app.host');

  await app.listen(appPort, appHost, () => {
    logger.log(`The server is listening on http://${appHost}:${appPort}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  logger.error(err);
  process.exit(1);
});
