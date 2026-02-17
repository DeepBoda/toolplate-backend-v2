/**
 * Shutdown Configuration Constants
 * 
 * Defines timeouts and intervals for graceful shutdown process.
 */

module.exports = {
    // Max time to wait for shutdown before force exit (30s)
    SHUTDOWN_TIMEOUT_MS: 30000,

    // Interval to check for open connections during drain (1s)
    DRAIN_CHECK_INTERVAL_MS: 1000,

    // Signals that trigger shutdown
    SHUTDOWN_SIGNALS: ['SIGTERM', 'SIGINT'],
};
