/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

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
