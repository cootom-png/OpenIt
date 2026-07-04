/**
 * PM2 进程管理器配置文件
 *
 * 使用方法：
 *   1. 安装 PM2: npm install -g pm2
 *   2. 启动服务: pm2 start ecosystem.config.cjs
 *   3. 查看状态: pm2 status
 *   4. 查看日志: pm2 logs coriton-parts
 *   5. 设置开机自启: pm2 startup && pm2 save
 *   6. 重启服务: pm2 restart coriton-parts
 *   7. 停止服务: pm2 stop coriton-parts
 */
module.exports = {
  apps: [
    {
      name: "coriton-parts",
      script: "dist/index.js",
      cwd: __dirname,

      // 环境变量
      env: {
        NODE_ENV: "production",
      },

      // ─── 内存与重启策略 ───
      // 内存超过 800MB 自动重启（根据服务器内存调整）
      // 1GB 服务器建议设为 600M，2GB 服务器设为 800M，4GB 服务器设为 1500M
      max_memory_restart: "800M",

      // 崩溃后自动重启
      autorestart: true,

      // 重启间隔（毫秒），避免频繁重启消耗资源
      restart_delay: 3000,

      // 最大连续重启次数（超过后停止重启，需手动排查）
      max_restarts: 15,

      // 启动后等待多少毫秒才认为启动成功
      min_uptime: 5000,

      // ─── 日志配置 ───
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-output.log",

      // 合并所有实例的日志到同一文件
      merge_logs: true,

      // 日志添加时间戳
      time: true,

      // 日志文件最大大小（超过后自动轮转）
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // ─── 监控配置 ───
      // 不监听文件变化（生产环境不需要热重载）
      watch: false,

      // ─── 信号处理 ───
      // 优雅关闭等待时间（毫秒）
      kill_timeout: 5000,

      // 使用 SIGTERM 信号关闭（代码中已处理）
      shutdown_with_message: false,
    },
  ],
};
