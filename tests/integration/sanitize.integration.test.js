/**
 * Sanitization Integration Tests
 * 
 * Verifies that the global sanitization middleware correctly runs
 * on real requests to the Express app.
 */

// Use shared integration setup
require('../integration.setup');

const request = require('supertest');

// ─── Mocks ───

// Mock Auth Middleware to bypass checks
jest.mock('../../middlewares/auth', () => ({
    validateAPIKey: (req, res, next) => next(),
    protectRoute: () => (req, res, next) => next(),
    authMiddleware: (req, res, next) => next(),
}));

// Mock Tool Controller with Proxy to handle all method calls dynamically
// This avoids errors when new routes/methods are added to the controller
jest.mock('../../modules/tool/controller', () => {
    return new Proxy({}, {
        get: (target, prop) => {
            // maintain 'search' behavior for test
            if (prop === 'search') {
                return (req, res) => res.status(200).json(req.query);
            }
            // default mock for everything else
            return jest.fn();
        }
    });
});

// Lazy load app after mocks
const app = require('../../app');

describe('Sanitization Integration', () => {

    test('strips XSS from query params in real route', async () => {
        // Hits /api/v1/tool/search which uses the mocked controller.
        // The query param 'q' will be echoed back.
        const res = await request(app)
            .get('/api/v1/tool/search?q=<script>alert(1)</script>&safe=ok');

        expect(res.status).toBe(200);
        expect(res.body.q).toBe(''); // Sanitized
        expect(res.body.safe).toBe('ok'); // Preserved
    });

    test('strips SQL injection patterns from query params', async () => {
        const res = await request(app)
            .get('/api/v1/tool/search?q=DROP TABLE users');

        expect(res.status).toBe(200);
        // 'DROP' and 'TABLE' are removed.
        // Result is trimmed.
        expect(res.body.q).toBe('users');
        expect(res.body.q).not.toContain('DROP');
        expect(res.body.q).not.toContain('TABLE');
    });
});
