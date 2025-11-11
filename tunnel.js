#!/usr/bin/env node
import localtunnel from 'localtunnel';

(async () => {
  const tunnel = await localtunnel({ port: 8000 });

  console.log('Tunnel URL:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel closed');
    process.exit(0);
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err);
    process.exit(1);
  });

  // Keep the process alive
  process.on('SIGINT', () => {
    console.log('\nShutting down tunnel...');
    tunnel.close();
  });

  console.log('Tunnel is active. Press Ctrl+C to stop.');

  // Keep the process alive indefinitely
  setInterval(() => {
    // Heartbeat to keep process alive
  }, 1000);
})();
