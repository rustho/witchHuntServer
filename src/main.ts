import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Check required environment variables
  const requiredEnvVars = [
    'GOOGLE_SPREADSHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'TELEGRAM_BOT_TOKEN',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule, { bodyParser: true });

  // Enable graceful shutdown
  app.enableShutdownHooks();

  await app.listen(3333);

  // Handle termination signals
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Starting graceful shutdown...');
    await app.close();
    process.exit(0);
  });
}
bootstrap();
