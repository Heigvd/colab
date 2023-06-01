import { pino } from 'pino';
import PinoPretty from 'pino-pretty';

const prettyPrintOptions = {
  translateTime: 'SYS:dd-mm-yy HH:MM:ss',
  ignore: 'PID,hostname',
};

const logger = pino({
  level: 'debug',
  prettyPrint: false,
  prettifier: PinoPretty,
  transport: {
    target: 'pino-pretty',
    options: {
      targets: [
        {
          level: 'debug',
          target: 'pino-pretty',
          options: prettyPrintOptions,
        },
      ],
    },
  },
});

export default logger;
