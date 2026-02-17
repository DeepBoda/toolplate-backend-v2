/**
 * Redis Cache TTL Constants
 * 
 * Centralized TTL configuration for all cache entries.
 * Prevents infinite-TTL cache entries and ensures consistent cache behavior.
 * 
 * @module constants/cacheTTL
 */

module.exports = {
    /** Default TTL for any cache entry without explicit TTL (1 hour) */
    DEFAULT: 3600,

    /** Category/tag caches — rarely change (24 hours) */
    CATEGORY: 86400,

    /** Main category caches (24 hours) */
    MAIN_CATEGORY: 86400,

    /** Tool/blog list caches — moderate change frequency (30 minutes) */
    TOOL_LIST: 1800,
    BLOG_LIST: 1800,
    LISTING_LIST: 1800,
    NEWS_LIST: 1800,

    /** Individual tool/blog caches (1 hour) */
    TOOL_DETAIL: 3600,
    BLOG_DETAIL: 3600,
    LISTING_DETAIL: 3600,
    NEWS_DETAIL: 3600,

    /** Search results cache (15 minutes) */
    SEARCH: 900,

    /** App config cache (12 hours) */
    APP_CONFIG: 43200,

    /** Comparison results cache (30 minutes) */
    COMPARISON: 1800,

    /** User-specific caches (5 minutes) */
    USER_SESSION: 300,

    /** Home page caches (30 minutes) */
    HOME: 1800,
};
