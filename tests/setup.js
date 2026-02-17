/**
 * Global test setup for toolplate-backend-v2
 * 
 * This file runs before all test suites.
 * It sets up environment variables and mocks for external services
 * so tests can run without real DB, Redis, or Elasticsearch connections.
 */

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3099';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
process.env.JWT_EXPIREIN = '1h';
process.env.REDIS_PORT = '6379';
process.env.REDIS_DATABASE = '1';
process.env.API_KEY_DEV = 'test-api-key';
process.env.API_KEY = 'test-api-key';
process.env.DEV_CORS_ORIGINS = 'http://localhost:3000';
process.env.PROD_CORS_ORIGINS = 'http://localhost:3000';
process.env.WOOFFER_TOKEN = 'test-wooffer-token';
process.env.WOOFFER_SERVICE_DEV = 'test-wooffer-service';
process.env.WOOFFER_SERVICE = 'test-wooffer-service';
process.env.log = '0';

// Suppress console output during tests unless explicitly needed
if (process.env.TEST_VERBOSE !== '1') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    // Keep error and warn visible for debugging
    error: console.error,
    warn: console.warn,
  };
}
