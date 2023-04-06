import pino from 'pino';

const logger = pino.pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      translateTime: 'SYS:dd-mm-yy HH:MM:ss',
      ignore: 'PID,hostname',
    },
  },
});

export default logger;
