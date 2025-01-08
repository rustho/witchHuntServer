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

  const port = process.env.PORT || 3333;

  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on: http://localhost:${port}`);
    console.log('Ready for traffic');
  });

  // Handle shutdown gracefully
  const signals = ['SIGTERM', 'SIGINT'];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`${signal} received. Starting graceful shutdown...`);
      try {
        await app.close();
        console.log('Application shutdown complete.');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    });
  }
}

bootstrap().catch((err) => {
  console.error('Failed to start application:', err);
  process.exit(1);
});
