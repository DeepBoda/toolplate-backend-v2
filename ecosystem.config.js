module.exports = {
  apps: [
    {
      name: "toolplate-backend",
      script: "app.js",
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
      },
      sticky: true,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      combine_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: 1000,
      kill_timeout: 3000,
      restart_delay: 5000,
      listen_timeout: 60000,
    },
  ],
};
