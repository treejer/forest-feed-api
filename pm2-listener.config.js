
module.exports = {
    apps: [
      {
        name: "balance-listener",
        script: `npx nestjs-command listener:run --type ${process.env.type}`,
        error_file: ".pm2/logs/balance-listener/balance-listener-error.log",
        out_file: ".pm2/logs/balance-listener/balance-listener-out.log",
        log_file: ".pm2/logs/balance-listener/balance-listener-log.log",
      },
    ],
  };
  
  //-----> how to run  type=balance pm2 start ./pm2-balance-listener.config.js --name balance-listener
  