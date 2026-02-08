import {
  checkRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  const testConfig = {
    limit: 3,
    windowMs: 1000, // 1 second window for testing
    prefix: 'test',
  };

  beforeEach(() => {
    // Clear rate limit store between tests by using unique identifiers
  });

  it('allows requests within the limit', () => {
    const id = `test-${Date.now()}-1`;

    const result1 = checkRateLimit(id, testConfig);
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = checkRateLimit(id, testConfig);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = checkRateLimit(id, testConfig);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('blocks requests over the limit', () => {
    const id = `test-${Date.now()}-2`;

    // Use up the limit
    checkRateLimit(id, testConfig);
    checkRateLimit(id, testConfig);
    checkRateLimit(id, testConfig);

    // This should be blocked
    const result = checkRateLimit(id, testConfig);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the time window', async () => {
    const id = `test-${Date.now()}-3`;
    const shortConfig = { ...testConfig, windowMs: 100 };

    // Use up the limit
    checkRateLimit(id, shortConfig);
    checkRateLimit(id, shortConfig);
    checkRateLimit(id, shortConfig);

    // Should be blocked
    const blocked = checkRateLimit(id, shortConfig);
    expect(blocked.success).toBe(false);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be allowed again
    const allowed = checkRateLimit(id, shortConfig);
    expect(allowed.success).toBe(true);
    expect(allowed.remaining).toBe(2);
  });

  it('returns correct rate limit info', () => {
    const id = `test-${Date.now()}-4`;

    const result = checkRateLimit(id, testConfig);

    expect(result.limit).toBe(3);
    expect(result.remaining).toBe(2);
    expect(result.reset).toBeGreaterThan(Date.now());
  });

  it('uses different buckets for different prefixes', () => {
    const id = `test-${Date.now()}-5`;

    const config1 = { ...testConfig, prefix: 'api' };
    const config2 = { ...testConfig, prefix: 'auth' };

    // Use up limit for prefix 'api'
    checkRateLimit(id, config1);
    checkRateLimit(id, config1);
    checkRateLimit(id, config1);
    const blockedApi = checkRateLimit(id, config1);
    expect(blockedApi.success).toBe(false);

    // Should still be allowed for prefix 'auth'
    const allowedAuth = checkRateLimit(id, config2);
    expect(allowedAuth.success).toBe(true);
  });
});

describe('getClientIdentifier', () => {
  it('uses X-Forwarded-For header when present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'X-Forwarded-For': '192.168.1.1, 10.0.0.1',
      },
    });

    const id = getClientIdentifier(request);
    expect(id).toBe('192.168.1.1');
  });

  it('uses X-Real-IP when X-Forwarded-For is not present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'X-Real-IP': '192.168.1.2',
      },
    });

    const id = getClientIdentifier(request);
    expect(id).toBe('192.168.1.2');
  });

  it('falls back to hash when no IP headers present', () => {
    const request = new Request('http://localhost', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const id = getClientIdentifier(request);
    expect(id).toMatch(/^fallback:/);
  });

  it('returns consistent fallback for same user-agent', () => {
    const request1 = new Request('http://localhost', {
      headers: {
        'User-Agent': 'Mozilla/5.0 Test',
        'Accept': 'text/html',
      },
    });
    const request2 = new Request('http://localhost', {
      headers: {
        'User-Agent': 'Mozilla/5.0 Test',
        'Accept': 'text/html',
      },
    });

    expect(getClientIdentifier(request1)).toBe(getClientIdentifier(request2));
  });
});

describe('rateLimitHeaders', () => {
  it('returns correct headers', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
    };

    const headers = rateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('99');
    expect(headers['X-RateLimit-Reset']).toBeDefined();
  });
});

describe('RATE_LIMITS presets', () => {
  it('has auth limit configured', () => {
    expect(RATE_LIMITS.AUTH.limit).toBe(5);
    expect(RATE_LIMITS.AUTH.prefix).toBe('auth');
  });

  it('has API limit configured', () => {
    expect(RATE_LIMITS.API.limit).toBe(100);
    expect(RATE_LIMITS.API.prefix).toBe('api');
  });

  it('has email limit configured', () => {
    expect(RATE_LIMITS.EMAIL.limit).toBe(10);
    expect(RATE_LIMITS.EMAIL.prefix).toBe('email');
  });

  it('has calls limit configured', () => {
    expect(RATE_LIMITS.CALLS.limit).toBe(10);
    expect(RATE_LIMITS.CALLS.prefix).toBe('calls');
  });

  it('has tiles limit configured for high-frequency requests', () => {
    expect(RATE_LIMITS.TILES.limit).toBe(500);
    expect(RATE_LIMITS.TILES.prefix).toBe('tiles');
  });
});
