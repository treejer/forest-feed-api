
module.exports = {
    apps: [
      {
        name: `forestFeed-cronjob`,
        script: `npx nestjs-command cronJob:run`,
        error_file: `.pm2/logs/cronjob/cronjob-error.log`,
        out_file: `.pm2/logs/cronjob/cronjob-out.log`,
        log_file: `.pm2/logs/cronjob/cronjob-log.log`,
      },
    ],
  };
  
    //-----> how to run  pm2 start ./pm2-cronjob.config.js
  