
module.exports = {
  apps: [
    {
      name: `forestFeed-${process.env.type}-listener`,
      script: `npx nestjs-command listener:run --type ${process.env.type}`,
      error_file: `.pm2/logs/${process.env.type}-listener/${process.env.type}-listener-error.log`,
      out_file: `.pm2/logs/${process.env.type}-listener/${process.env.type}-listener-out.log`,
      log_file: `.pm2/logs/${process.env.type}-listener/${process.env.type}-listener-log.log`,
    },
  ],
};

  //-----> how to run  type=balance pm2 start ./pm2-listener.config.js --name balance-listener
