import { execSync } from 'node:child_process';

const vercelEnv = process.env.VERCEL_ENV ?? '';
const useProduction = vercelEnv === 'production';
const cmd = useProduction ? 'npm run build' : 'npm run build:development';

console.log(
  `[vercel-build] VERCEL_ENV=${vercelEnv || '(unset)'} → Angular configuration: ${useProduction ? 'production' : 'development'}`,
);

execSync(cmd, { stdio: 'inherit' });
