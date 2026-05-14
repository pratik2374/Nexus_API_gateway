const http = require('http');
const { monitorEventLoopDelay } = require('perf_hooks');

const PORT = process.env.PORT || 3000;

const eventLoopDelay = monitorEventLoopDelay({ resolution: 20 });
eventLoopDelay.enable();

setInterval(() => {

    const mean = (eventLoopDelay.mean / 1e6).toFixed(2);
    const max = (eventLoopDelay.max / 1e6).toFixed(2);
    const min = (eventLoopDelay.min / 1e6).toFixed(2);
    const p99 = (eventLoopDelay.percentile(99) / 1e6).toFixed(2);

    console.log('----- Event Loop Metrics -----');
    console.log(`Mean Delay : ${mean} ms`);
    console.log(`Max Delay  : ${max} ms`);
    console.log(`Min Delay  : ${min} ms`);
    console.log(`P99 Delay  : ${p99} ms`);
    console.log('------------------------------\n');

    // Reset histogram after logging
    eventLoopDelay.reset();

}, 5000);

const server = http.createServer((req, res) => {

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