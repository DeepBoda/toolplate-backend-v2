/**
 * Input Sanitization Unit Tests
 * 
 * Verifies that the sanitization middleware correctly strips
 * XSS and SQL injection patterns from request bodies, query params,
 * and URL parameters, while preserving legitimate data.
 */

const { sanitizeMiddleware, sanitizeValue, sanitizeData } = require('../middlewares/sanitize');
const { XSS_PATTERNS } = require('../constants/sanitizePatterns');

describe('Input Sanitization Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {}, query: {}, params: {} };
        res = {};
        next = jest.fn();
    });

    // ─── sanitizeValue() ───

    describe('sanitizeValue()', () => {
        test('removes <script> tags', () => {
            const input = 'Hello <script>alert("XSS")</script> World';
            expect(sanitizeValue(input)).toBe('Hello  World');
        });

        test('removes event handlers', () => {
            const input = '<img src="x" onerror="alert(1)">';
            expect(sanitizeValue(input)).toBe('<img src="x">');
        });

        test('removes javascript: protocol', () => {
            const input = '<a href="javascript:alert(1)">Click me</a>';
            expect(sanitizeValue(input)).toBe('<a href="">Click me</a>');
        });

        test('removes dangerous tags (iframe)', () => {
            const input = 'Check this <iframe src="evil.com"></iframe> out';
            expect(sanitizeValue(input)).toBe('Check this  out');
        });

        test('removes SQL injection patterns', () => {
            const input = "admin'; DROP TABLE users; --";
            expect(sanitizeValue(input)).toBe("admin';   users;");
        });

        test('preserves legitimate text', () => {
            const input = 'Hello World';
            expect(sanitizeValue(input)).toBe('Hello World');
        });

        test('trims whitespace', () => {
            const input = '  Hello  ';
            expect(sanitizeValue(input)).toBe('Hello');
        });

        test('returns non-string values as-is', () => {
            expect(sanitizeValue(123)).toBe(123);
            expect(sanitizeValue(true)).toBe(true);
            expect(sanitizeValue(null)).toBe(null);
        });
    });

    // ─── sanitizeData() ───

    describe('sanitizeData()', () => {
        test('recursively sanitizes objects', () => {
            const input = {
                name: 'John <script>alert(1)</script>',
                details: {
                    bio: '<img src=x onerror=alert(1)>',
                },
            };
            const sanitized = sanitizeData(input);
            expect(sanitized.name).toBe('John');
            expect(sanitized.details.bio).toBe('<img src=x>');
        });

        test('recursively sanitizes arrays', () => {
            const input = ['<script>', 'safe'];
            const sanitized = sanitizeData(input);
            expect(sanitized[0]).toBe('');
            expect(sanitized[1]).toBe('safe');
        });

        test('handles mixed nested structures', () => {
            const input = {
                tags: ['<script>', { name: 'safe' }],
            };
            const sanitized = sanitizeData(input);
            expect(sanitized.tags[0]).toBe('');
            expect(sanitized.tags[1].name).toBe('safe');
        });
    });

    // ─── sanitizeMiddleware() ───

    describe('sanitizeMiddleware()', () => {
        test('sanitizes req.body', () => {
            req.body = { field: '<script>' };
            sanitizeMiddleware(req, res, next);
            expect(req.body.field).toBe('');
            expect(next).toHaveBeenCalled();
        });

        test('sanitizes req.query', () => {
            req.query = { search: '<script>' };
            sanitizeMiddleware(req, res, next);
            expect(req.query.search).toBe('');
            expect(next).toHaveBeenCalled();
        });

        test('sanitizes req.params', () => {
            req.params = { id: '<script>' };
            sanitizeMiddleware(req, res, next);
            expect(req.params.id).toBe('');
            expect(next).toHaveBeenCalled();
        });

        test('handles missing body/query/params cleanly', () => {
            req = {};
            sanitizeMiddleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });

    // ─── Constants Verify ───

    test('constants are exported correctly', () => {
        expect(XSS_PATTERNS).toBeDefined();
        expect(XSS_PATTERNS.SCRIPT_TAGS).toBeInstanceOf(RegExp);
    });
});
