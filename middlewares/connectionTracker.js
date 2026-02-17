/**
 * Connection Tracker Middleware
 * 
 * Tracks active HTTP connections to support graceful shutdown.
 * Adds `isClosing` property to req object to signal shutdown state.
 * 
 * @module middlewares/connectionTracker
 */

let isClosing = false;
let activeConnections = 0;

/**
 * Tracks active request count.
 * Should be mounted early in middleware stack.
 */
const trackConnection = (req, res, next) => {
    if (isClosing) {
        res.set('Connection', 'close');
        res.status(503).json({
            status: 503,
            message: 'Server is shutting down',
        });
        return;
    }

    activeConnections++;
    res.on('finish', () => {
        activeConnections--;
    });
    next();
};

/**
 * Signal that shutdown process has started.
 * Rejects new connections with 503.
 */
const startClosing = () => {
    isClosing = true;
};

/**
 * Get current active connection count.
 */
const getActiveConnections = () => activeConnections;

module.exports = {
    trackConnection,
    startClosing,
    getActiveConnections,
};
