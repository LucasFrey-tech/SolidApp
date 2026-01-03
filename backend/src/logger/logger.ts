import { createLogger, format, transports, Logger } from 'winston';
import app_config from '../../private/app.config.json';

export class Log {
  private static instance: Logger;

  private static createBaseLogger(): Logger {
    return createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json(),
      ),
      transports: [
        new transports.Console({
          format: format.combine(
            format.colorize({ all: app_config.logger.colorize_logs }),
            format.simple(),
          ),
          level: app_config.logger.console_details_level,
        }),
        new transports.File({
          format: format.combine(format.timestamp(), format.simple()),
          filename: app_config.logger.log_file,
          level: app_config.logger.file_details_level,
        }),
      ],
    });
  }

  public static getLogger(context?: string): Logger {
    if (!Log.instance) {
      Log.instance = Log.createBaseLogger();
    }
    return context ? Log.instance.child({ context }) : Log.instance;
  }
}
