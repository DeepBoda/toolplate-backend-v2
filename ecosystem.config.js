module.exports = {
  apps: [
    {
      name: "toolplate-backend",
      script: "app.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: true,
      sticky: true,
      max_restarts: 10,
      min_uptime: 5000,
      restart_delay: 2000,
      kill_timeout: 5000,
      listen_timeout: 8000,
      max_memory_restart: "3G",
      error_file: "error.log",
      out_file: "out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      combine_logs: true,
      merge_logs: true,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },

      node_args: "--max-old-space-size=4096",
    },
  ],

  // deploy: {
  //   production: {
  //     user: "root",
  //     host: "13.235.186.84",
  //     ref: "origin/production",
  //     repo: "https://github.com/TST-Technology/toolplate-backend.git",
  //     path: "/root/toolplate-backend",
  //     "post-deploy":
  //       "npm install && pm2 reload ecosystem.config.js --env production",
  //     env: {
  //       NODE_ENV: "production",
  //     },
  //   },
  // },
};
