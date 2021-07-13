/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export type LOGGERS = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export const levels = {
  trace: false,
  debug: false,
  info: true,
  warn: true,
  error: true,
};

export default {
  trace: (...params: unknown[]): void => {
    if (levels.trace) {
      // eslint-disable-next-line no-console
      console.info(...params);
    }
  },
  debug: (...params: unknown[]): void => {
    if (levels.debug) {
      // eslint-disable-next-line no-console
      console.info(...params);
    }
  },
  info: (...params: unknown[]): void => {
    if (levels.info) {
      // eslint-disable-next-line no-console
      console.info(...params);
    }
  },
  warn: (...params: unknown[]): void => {
    if (levels.warn) {
      // eslint-disable-next-line no-console
      console.warn(...params);
    }
  },
  error: (...params: unknown[]): void => {
    if (levels.error) {
      // eslint-disable-next-line no-console
      console.error(...params);
    }
  },
};
