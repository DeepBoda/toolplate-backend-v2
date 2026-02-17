/**
 * Tool Comparison Unit Tests
 * 
 * Verifies service layer logic for fetching comparison data,
 * including slicing input and query construction.
 */

// Mock Sequelize Op to be simple strings for testing
jest.mock('sequelize', () => ({
    Op: {
        in: 'IN_OPERATOR',
        lte: 'LTE_OPERATOR',
    },
}));

// Mock Tool Service
const mockFindAll = jest.fn();
jest.mock('../modules/tool/service', () => ({
    findAll: mockFindAll,
}));

// Mock dependencies required by service but not used in test logic directly
jest.mock('../modules/category/service', () => ({}));
jest.mock('../modules/toolCategory/model', () => ({}));
jest.mock('../modules/category/model', () => ({}));
jest.mock('../modules/mainCategory/model', () => ({}));
jest.mock('../modules/toolImages/model', () => ({}));

const comparisonService = require('../modules/toolComparison/service');
const toolService = require('../modules/tool/service');

describe('Tool Comparison Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('compareBySlugs', () => {
        test('returns empty array if no slugs provided', async () => {
            const result = await comparisonService.compareBySlugs([]);
            expect(result).toEqual([]);
            expect(toolService.findAll).not.toHaveBeenCalled();
        });

        test('fetches tools by slugs', async () => {
            // Setup mock return
            const mockTools = [{ slug: 'a' }, { slug: 'b' }];
            toolService.findAll.mockResolvedValue(mockTools);

            const slugs = ['a', 'b'];
            const result = await comparisonService.compareBySlugs(slugs);

            expect(result).toEqual(mockTools);
            expect(toolService.findAll).toHaveBeenCalled();

            const callArg = toolService.findAll.mock.calls[0][0];
            // Verify Op.in usage
            const inClause = callArg.where.slug;
            // Key should be [Op.in] -> 'IN_OPERATOR'
            // But callArg.where.slug is likely an object with key 'IN_OPERATOR'
            // Wait, {[Op.in]: ...} -> { IN_OPERATOR: [...] }
            expect(inClause.IN_OPERATOR).toEqual(['a', 'b']);
        });

        test('limits input to 4 slugs', async () => {
            toolService.findAll.mockResolvedValue([]);
            const slugs = ['1', '2', '3', '4', '5'];

            await comparisonService.compareBySlugs(slugs);

            const callArg = toolService.findAll.mock.calls[0][0];
            const inClause = callArg.where.slug.IN_OPERATOR;

            expect(inClause).toHaveLength(4);
            expect(inClause).toEqual(['1', '2', '3', '4']);
        });
    });
});
