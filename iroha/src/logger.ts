import { createLogger, format, transports } from 'winston';
import config from './config';

declare module 'winston' {
  interface LoggerOptions {
    rejectionHandlers?;
  }
  interface Logger {
    rejections;
  }
  namespace transports {
    interface ConsoleTransportInstance {
      handleRejections?;
    }
  }
}

const transport = new transports.Console();
transport.handleExceptions = true;
transport.handleRejections = true;

export const logger = createLogger({
  transports: [transport],
  format: format.combine(
    format.timestamp(),
    format.printf(info => `${info.timestamp} [${info.level}] ${info.message}`),
  ),
});

logger.exceptions.handle();
logger.rejections.handle();

// "ed25519.js" sets up "uncaughtException" and "unhandledRejection" and kills process.
// Logger must load before "ed25519.js" to set up those listeners early and get the event.
// https://github.com/soramitsu/iroha-ed25519.js/blob/3da98309f2fb4cd3e1ad66de56039ab58f95ef6b/lib/ed25519.js#L104
if (require.resolve('ed25519.js') in require.cache) {
  throw new Error(`"${__filename}" must be imported before "ed25519.js"`);
}

export const checkLogLevel = level => /^(error|warn|info|debug)$/i.test(level);

export function setLogLevel(level) {
  if (!checkLogLevel(level)) {
    throw new Error(`Unrecognized "LOG_LEVEL=${level}"`);
  }
  logger.level = level.toLowerCase();
}

setLogLevel(config.logLevel);
