import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.number().default(3333),
});

const parsedEnvSchema = envSchema.safeParse(process.env);

if (parsedEnvSchema.success === false) {
  const errorMessage = 'Invalid environment variables!';

  console.error(errorMessage, parsedEnvSchema.error.format());

  throw new Error(errorMessage);
}

export const env = parsedEnvSchema.data;
