# Nexus Server Architecture

## Overview

Nexus is a small Node.js HTTP service built with the built-in `http` module. It exposes a simple health endpoint, a default JSON response, and process-level monitoring for event loop latency and memory usage.

## Runtime Flow

1. The server reads `PORT` from the environment and falls back to `3000` when it is not set.
2. A `monitorEventLoopDelay` instance is created with a `20ms` resolution.
3. The monitor is enabled immediately when the process starts.
4. A timer logs event loop metrics every `5 seconds` and resets the monitor after each report.
5. The HTTP server starts listening on the configured port.

## Request Handling

### `GET /health`

The health route returns a JSON payload with:

- `status: "OK"`
- `uptime` in seconds
- memory usage for:
	- `rss`
	- `heapUsed`

This endpoint is intended for availability checks and basic runtime inspection.

### Default Response

Any request that does not match `GET /health` receives a JSON response:

- `success: true`
- `message: "NEXUS server is running"`

The response uses HTTP `200` and `Content-Type: application/json`.

## Observability

The process logs event loop performance every `5 seconds` using `perf_hooks.monitorEventLoopDelay`.

Each log entry includes:

- `mean`
- `max`
- `min`
- `p99`

All values are converted from nanoseconds to milliseconds before being printed.

## Graceful Shutdown

The process handles `SIGINT` and `SIGTERM` with the same shutdown path:

1. Log the received signal.
2. Close the HTTP server.
3. Disable the event loop monitor.
4. Exit with code `0` after cleanup.

If the server does not close within `10 seconds`, a forced shutdown is triggered and the process exits with code `1`.

## Project Entry Point

- Main file: `server.js`
- Start script: `node server.js`

## Notes

- The codebase currently uses only core Node.js APIs plus the `http` package declared in `package.json`.
- There are no additional routes, middleware layers, or external frameworks in the current implementation.
