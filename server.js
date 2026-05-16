const http = require('http');
require('dotenv').config();
const { monitorEventLoopDelay } = require('perf_hooks');

const PORT = process.env.PORT || 3000;

// Event loop monitoring
const eventLoopMonitor = monitorEventLoopDelay({
    resolution: 20
});

eventLoopMonitor.enable();

setInterval(() => {

    console.log('----- Event Loop Metrics -----');

    console.log({
        mean: `${(eventLoopMonitor.mean / 1e6).toFixed(2)} ms`,
        max: `${(eventLoopMonitor.max / 1e6).toFixed(2)} ms`,
        min: `${(eventLoopMonitor.min / 1e6).toFixed(2)} ms`,
        p99: `${(eventLoopMonitor.percentile(99) / 1e6).toFixed(2)} ms`
    });

    console.log('------------------------------\n');

    eventLoopMonitor.reset();

}, 5000);

// Create server
const server = http.createServer((req, res) => {

    // Health endpoint
    if (req.url === '/health' && req.method === 'GET') {

        const memory = process.memoryUsage();

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        return res.end(JSON.stringify({
            status: 'OK',
            uptime: `${process.uptime().toFixed(2)} seconds`,
            memory: {
                rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
                heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`
            }
        }));
    }

    // Default route
    res.writeHead(200, {
        'Content-Type': 'application/json'
    });

    res.end(JSON.stringify({
        success: true,
        message: 'NEXUS server is running'
    }));
});

// Start server
server.listen(PORT, () => {
    console.log(`NEXUS running on port ${PORT}`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {

    console.log(`\n${signal} received. Shutting down gracefully...`);

    server.close(() => {

        console.log('HTTP server closed.');

        // Disable monitor
        eventLoopMonitor.disable();

        console.log('Cleanup completed.');

        process.exit(0);
    });

    // Force shutdown after timeout
    setTimeout(() => {

        console.error('Forcefully shutting down...');

        process.exit(1);

    }, 10000);
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));