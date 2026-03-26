module.exports = {
  apps: [{
    name: 'vortex-xmd',
    script: 'index.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '400M',
    restart_delay: 5000,
    max_restarts: 20,
    min_uptime: '15s',
    kill_timeout: 8000,
    error_file: '/dev/stderr',
    out_file: '/dev/stdout',
    merge_logs: true,
    env: {
      NODE_ENV: 'production'
    }
  }]
};
