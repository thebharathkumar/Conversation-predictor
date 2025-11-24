import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    anthropicKey: !!process.env.ANTHROPIC_API_KEY,
    postgresUrl: !!process.env.POSTGRES_URL,
    timestamp: new Date().toISOString(),
  };

  const allHealthy = checks.anthropicKey && checks.postgresUrl;

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    message: allHealthy
      ? 'All systems operational'
      : 'Missing configuration - see checks for details',
  });
}
