/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

export default {
  trace: (...params: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.trace(...params);
  },
  info: (...params: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.info(...params);
  },
  warn: (...params: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.warn(...params);
  },
  error: (...params: unknown[]): void => {
    // eslint-disable-next-line no-console
    console.error(...params);
  },
};
