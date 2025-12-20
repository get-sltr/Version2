/**
 * Error Logging System
 *
 * Captures and stores application errors for admin review.
 * Errors are stored in memory with option to persist to database.
 */

export interface AppError {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: string; // API route, component, etc.
  message: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  request?: {
    method?: string;
    url?: string;
    userAgent?: string;
    ip?: string;
  };
}

// In-memory error store (for serverless, use external store in production)
const errorStore: AppError[] = [];
const MAX_ERRORS = 1000;

/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Log an error
 */
export function logError(
  source: string,
  error: Error | string,
  options?: {
    level?: AppError['level'];
    userId?: string;
    userEmail?: string;
    metadata?: Record<string, unknown>;
    request?: AppError['request'];
  }
): string {
  const errorId = generateErrorId();
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  const appError: AppError = {
    id: errorId,
    timestamp: new Date().toISOString(),
    level: options?.level || 'error',
    source,
    message: errorMessage,
    stack: errorStack,
    userId: options?.userId,
    userEmail: options?.userEmail,
    metadata: options?.metadata,
    request: options?.request,
  };

  // Add to store
  errorStore.unshift(appError);

  // Trim store if too large
  if (errorStore.length > MAX_ERRORS) {
    errorStore.splice(MAX_ERRORS);
  }

  // Also log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${appError.level.toUpperCase()}] ${source}:`, errorMessage);
    if (errorStack) {
      console.error(errorStack);
    }
  }

  return errorId;
}

/**
 * Log an API error with request context
 */
export function logApiError(
  route: string,
  error: Error | string,
  request: Request,
  userId?: string,
  userEmail?: string
): string {
  return logError(`API: ${route}`, error, {
    level: 'error',
    userId,
    userEmail,
    request: {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') ||
          request.headers.get('x-real-ip') ||
          undefined,
    },
  });
}

/**
 * Log a warning
 */
export function logWarning(
  source: string,
  message: string,
  metadata?: Record<string, unknown>
): string {
  return logError(source, message, {
    level: 'warning',
    metadata,
  });
}

/**
 * Get all errors (for admin dashboard)
 */
export function getErrors(options?: {
  level?: AppError['level'];
  source?: string;
  since?: Date;
  limit?: number;
  offset?: number;
}): { errors: AppError[]; total: number } {
  let filtered = [...errorStore];

  if (options?.level) {
    filtered = filtered.filter((e) => e.level === options.level);
  }

  if (options?.source) {
    filtered = filtered.filter((e) =>
      e.source.toLowerCase().includes(options.source!.toLowerCase())
    );
  }

  if (options?.since) {
    filtered = filtered.filter((e) =>
      new Date(e.timestamp) >= options.since!
    );
  }

  const total = filtered.length;

  if (options?.offset) {
    filtered = filtered.slice(options.offset);
  }

  if (options?.limit) {
    filtered = filtered.slice(0, options.limit);
  }

  return { errors: filtered, total };
}

/**
 * Get error by ID
 */
export function getErrorById(id: string): AppError | null {
  return errorStore.find((e) => e.id === id) || null;
}

/**
 * Clear all errors (founder only)
 */
export function clearErrors(): void {
  errorStore.length = 0;
}

/**
 * Get error statistics
 */
export function getErrorStats(): {
  total: number;
  byLevel: Record<AppError['level'], number>;
  last24Hours: number;
  lastHour: number;
} {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const byLevel: Record<AppError['level'], number> = {
    error: 0,
    warning: 0,
    info: 0,
  };

  let last24Hours = 0;
  let lastHour = 0;

  errorStore.forEach((e) => {
    byLevel[e.level]++;
    const errorTime = new Date(e.timestamp);
    if (errorTime >= dayAgo) last24Hours++;
    if (errorTime >= hourAgo) lastHour++;
  });

  return {
    total: errorStore.length,
    byLevel,
    last24Hours,
    lastHour,
  };
}
