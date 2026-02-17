/**
 * Smoke test - verifies Jest is configured correctly
 * This test ensures the test infrastructure works independently
 * of any external services (DB, Redis, Elasticsearch).
 */

describe('Test Infrastructure', () => {
    test('Jest is running in test environment', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    test('test API key is set', () => {
        expect(process.env.API_KEY).toBe('test-api-key');
    });

    test('basic assertions work', () => {
        expect(1 + 1).toBe(2);
        expect('toolplate').toContain('tool');
        expect([1, 2, 3]).toHaveLength(3);
        expect({ name: 'test' }).toHaveProperty('name');
    });

    test('async tests work', async () => {
        const result = await Promise.resolve('async works');
        expect(result).toBe('async works');
    });

    test('mocking works', () => {
        const mockFn = jest.fn(() => 42);
        expect(mockFn()).toBe(42);
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
