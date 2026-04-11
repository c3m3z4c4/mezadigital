module.exports = {
  apps: [
    {
      name: "mezadigital",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/var/www/mezadigital",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "/var/log/pm2/mezadigital-error.log",
      out_file: "/var/log/pm2/mezadigital-out.log",
    },
  ],
};
