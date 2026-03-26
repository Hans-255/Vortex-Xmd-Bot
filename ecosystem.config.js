module.exports = {
  apps: [{
    name: 'vortex-xmd',
    script: 'index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    restart_delay: 3000,
    max_restarts: 50,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '/dev/stderr',
    out_file: '/dev/stdout',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    kill_timeout: 5000
  }]
};
