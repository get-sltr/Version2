/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set before the app starts.
 * Import this in your app's entry point to catch missing config early.
 */

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

// Core Supabase configuration
const SUPABASE_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_SUPABASE_URL', required: true, description: 'Supabase project URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', required: true, description: 'Supabase anonymous key' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: true, description: 'Supabase service role key (server-side only)' },
];

// Database configuration
const DATABASE_VARS: EnvVar[] = [
  { name: 'DATABASE_URL', required: true, description: 'PostgreSQL connection string for vector tiles' },
];

// RevenueCat payment configuration (for native apps)
const REVENUECAT_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_REVENUECAT_API_KEY', required: false, description: 'RevenueCat public API key for subscriptions' },
];

// LiveKit video/audio configuration
const LIVEKIT_VARS: EnvVar[] = [
  { name: 'LIVEKIT_API_KEY', required: true, description: 'LiveKit API key' },
  { name: 'LIVEKIT_API_SECRET', required: true, description: 'LiveKit API secret' },
  { name: 'NEXT_PUBLIC_LIVEKIT_URL', required: true, description: 'LiveKit WebSocket URL' },
];

// Daily.co video calls configuration
const DAILY_VARS: EnvVar[] = [
  { name: 'DAILY_API_KEY', required: true, description: 'Daily.co API key for video calls' },
];

// Email service configuration
const EMAIL_VARS: EnvVar[] = [
  { name: 'RESEND_API_KEY', required: true, description: 'Resend API key for transactional emails' },
  { name: 'EMAIL_SERVICE_TOKEN', required: true, description: 'Internal service token for email API' },
  { name: 'EMAIL_FROM_ADDRESS', required: false, description: 'Default from address for emails' },
];

// Rate limiting configuration
const RATE_LIMIT_VARS: EnvVar[] = [
  { name: 'UPSTASH_REDIS_REST_URL', required: true, description: 'Upstash Redis REST URL' },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: true, description: 'Upstash Redis REST token' },
];

// Map configuration
const MAP_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_MAPBOX_TOKEN', required: true, description: 'Mapbox public token' },
];

// App configuration
const APP_VARS: EnvVar[] = [
  { name: 'NEXT_PUBLIC_APP_URL', required: true, description: 'Public app URL for redirects' },
];

// Apple / App Store configuration (for webhook & native app)
const APPLE_VARS: EnvVar[] = [
  { name: 'REVENUECAT_WEBHOOK_SECRET', required: false, description: 'RevenueCat webhook authorization secret' },
  { name: 'APPLE_BUNDLE_ID', required: false, description: 'Apple app bundle identifier (com.sltrdigital.primal)' },
];

// All environment variables grouped
const ALL_ENV_VARS = {
  supabase: SUPABASE_VARS,
  database: DATABASE_VARS,
  revenuecat: REVENUECAT_VARS,
  apple: APPLE_VARS,
  livekit: LIVEKIT_VARS,
  daily: DAILY_VARS,
  email: EMAIL_VARS,
  rateLimit: RATE_LIMIT_VARS,
  map: MAP_VARS,
  app: APP_VARS,
};

export interface ValidationResult {
  valid: boolean;
  missing: { name: string; description: string }[];
  warnings: { name: string; description: string }[];
}

/**
 * Validate all required environment variables
 */
export function validateEnv(): ValidationResult {
  const missing: { name: string; description: string }[] = [];
  const warnings: { name: string; description: string }[] = [];

  for (const group of Object.values(ALL_ENV_VARS)) {
    for (const envVar of group) {
      const value = process.env[envVar.name];

      if (!value || value.trim() === '') {
        if (envVar.required) {
          missing.push({ name: envVar.name, description: envVar.description });
        } else {
          warnings.push({ name: envVar.name, description: envVar.description });
        }
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Validate environment variables and log results
 * Call this during app initialization
 */
export function validateEnvWithLogging(): boolean {
  const result = validateEnv();

  if (result.missing.length > 0) {
    console.error('\n❌ MISSING REQUIRED ENVIRONMENT VARIABLES:');
    console.error('─'.repeat(50));
    for (const { name, description } of result.missing) {
      console.error(`  • ${name}`);
      console.error(`    ${description}\n`);
    }
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  OPTIONAL ENVIRONMENT VARIABLES NOT SET:');
    console.warn('─'.repeat(50));
    for (const { name, description } of result.warnings) {
      console.warn(`  • ${name} - ${description}`);
    }
    console.warn('');
  }

  if (result.valid) {
    console.log('✅ All required environment variables are configured\n');
  }

  return result.valid;
}

/**
 * Validate specific service configuration
 */
export function validateServiceEnv(
  service: keyof typeof ALL_ENV_VARS
): ValidationResult {
  const vars = ALL_ENV_VARS[service];
  const missing: { name: string; description: string }[] = [];
  const warnings: { name: string; description: string }[] = [];

  for (const envVar of vars) {
    const value = process.env[envVar.name];

    if (!value || value.trim() === '') {
      if (envVar.required) {
        missing.push({ name: envVar.name, description: envVar.description });
      } else {
        warnings.push({ name: envVar.name, description: envVar.description });
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Check if a specific environment variable is set
 */
export function hasEnvVar(name: string): boolean {
  const value = process.env[name];
  return !!(value && value.trim() !== '');
}

/**
 * Get environment variable with fallback
 */
export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value && value.trim() !== '') {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Environment variable ${name} is not set`);
}

/**
 * Generate a sample .env.local file content
 */
export function generateEnvTemplate(): string {
  const lines: string[] = [
    '# Primal Environment Configuration',
    '# Copy this to .env.local and fill in your values',
    '# DO NOT commit .env.local to version control',
    '',
  ];

  for (const [groupName, vars] of Object.entries(ALL_ENV_VARS)) {
    lines.push(`# ${groupName.charAt(0).toUpperCase() + groupName.slice(1)} Configuration`);
    for (const { name, description, required } of vars) {
      lines.push(`# ${description}${required ? ' (REQUIRED)' : ' (optional)'}`);
      lines.push(`${name}=`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
