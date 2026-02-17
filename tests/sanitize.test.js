/**
 * Input Sanitization Middleware Tests
 * 
 * Tests for the global sanitization middleware that strips dangerous
 * content from request bodies to prevent XSS and injection attacks.
 */

const { sanitizeValue, sanitizeBody, sanitizeMiddleware } = require('../middlewares/sanitize');

describe('Input Sanitization', () => {
    // ─── sanitizeValue unit tests ───

    describe('sanitizeValue()', () => {
        test('strips script tags from strings', () => {
            const input = '<script>alert("xss")</script>Best AI Tool';
            const result = sanitizeValue(input);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('</script>');
            expect(result).toContain('Best AI Tool');
        });

        test('strips event handler attributes', () => {
            const input = '<img onerror="alert(1)" src="x">';
            const result = sanitizeValue(input);
            expect(result).not.toContain('onerror');
        });

        test('strips onload handlers', () => {
            const input = '<body onload="malicious()">';
            const result = sanitizeValue(input);
            expect(result).not.toContain('onload');
        });

        test('strips javascript: protocol', () => {
            const input = '<a href="javascript:alert(1)">Click</a>';
            const result = sanitizeValue(input);
            expect(result).not.toMatch(/javascript:/i);
        });

        test('preserves normal text', () => {
            expect(sanitizeValue('Hello World')).toBe('Hello World');
        });

        test('preserves email addresses', () => {
            expect(sanitizeValue('user@example.com')).toBe('user@example.com');
        });

        test('preserves URLs', () => {
            expect(sanitizeValue('https://example.com/path?q=1&page=2')).toBe('https://example.com/path?q=1&page=2');
        });

        test('does not modify numbers', () => {
            expect(sanitizeValue(42)).toBe(42);
        });

        test('does not modify booleans', () => {
            expect(sanitizeValue(true)).toBe(true);
            expect(sanitizeValue(false)).toBe(false);
        });

        test('does not modify null', () => {
            expect(sanitizeValue(null)).toBe(null);
        });

        test('does not modify undefined', () => {
            expect(sanitizeValue(undefined)).toBe(undefined);
        });

        test('strips SQL injection patterns', () => {
            const input = "'; DROP TABLE users; --";
            const result = sanitizeValue(input);
            expect(result).not.toMatch(/DROP\s+TABLE/i);
        });

        test('strips UNION SELECT injection', () => {
            const input = "' UNION SELECT * FROM users --";
            const result = sanitizeValue(input);
            expect(result).not.toMatch(/UNION\s+SELECT/i);
        });
    });

    // ─── sanitizeBody deep object tests ───

    describe('sanitizeBody()', () => {
        test('sanitizes nested objects', () => {
            const input = {
                data: {
                    name: '<script>alert("xss")</script>Test',
                },
            };
            const result = sanitizeBody(input);
            expect(result.data.name).not.toContain('<script>');
            expect(result.data.name).toContain('Test');
        });

        test('sanitizes arrays', () => {
            const input = {
                tags: ['<script>x</script>', 'valid-tag', '<img onerror="x">'],
            };
            const result = sanitizeBody(input);
            expect(result.tags[0]).not.toContain('<script>');
            expect(result.tags[1]).toBe('valid-tag');
            expect(result.tags[2]).not.toContain('onerror');
        });

        test('handles deeply nested structures', () => {
            const input = {
                level1: {
                    level2: {
                        level3: '<script>deep</script>Content',
                    },
                },
            };
            const result = sanitizeBody(input);
            expect(result.level1.level2.level3).not.toContain('<script>');
            expect(result.level1.level2.level3).toContain('Content');
        });

        test('preserves mixed type objects', () => {
            const input = {
                name: 'Valid Name',
                count: 5,
                active: true,
                tags: ['tag1', 'tag2'],
                nested: { value: 'test' },
            };
            const result = sanitizeBody(input);
            expect(result.name).toBe('Valid Name');
            expect(result.count).toBe(5);
            expect(result.active).toBe(true);
            expect(result.tags).toEqual(['tag1', 'tag2']);
            expect(result.nested.value).toBe('test');
        });

        test('returns empty object for empty input', () => {
            expect(sanitizeBody({})).toEqual({});
        });
    });

    // ─── Middleware integration tests ───

    describe('sanitizeMiddleware()', () => {
        test('sanitizes req.body and calls next', () => {
            const req = {
                body: {
                    title: '<script>alert("test")</script>Clean Title',
                    count: 10,
                },
            };
            const res = {};
            const next = jest.fn();

            sanitizeMiddleware(req, res, next);

            expect(req.body.title).not.toContain('<script>');
            expect(req.body.title).toContain('Clean Title');
            expect(req.body.count).toBe(10);
            expect(next).toHaveBeenCalledTimes(1);
        });

        test('handles request with no body', () => {
            const req = {};
            const res = {};
            const next = jest.fn();

            sanitizeMiddleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        test('handles request with empty body', () => {
            const req = { body: {} };
            const res = {};
            const next = jest.fn();

            sanitizeMiddleware(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });
    });
});
