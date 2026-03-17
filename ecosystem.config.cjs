module.exports = {
  apps : [{
    name: "architect-server",
    script: "./dist-server/server.js",
    env: {
      NODE_ENV: "production",
      PORT: 4000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss"
  }]
}
