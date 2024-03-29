/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

type LogFn = (...args: unknown[]) => void;

export type LoggerLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const OFF: LoggerLevel = 0;
export const ERROR: LoggerLevel = 1;
export const WARN: LoggerLevel = 2;
export const INFO: LoggerLevel = 3;
export const DEBUG: LoggerLevel = 4;
export const TRACE: LoggerLevel = 5;

interface Logger {
  getLevel: () => LoggerLevel;
  setLevel: (level: LoggerLevel) => void;
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

export const loggers: Record<string, Logger> = {};

function mapArgs(...args: unknown[]): unknown[] {
  return args.map(arg => {
    const argP = typeof arg === 'function' ? arg() : arg;
    try {
      return argP;
      //return typeof argP === 'object' ? JSON.stringify(argP) : arg;
    } catch {
      return arg;
    }
  });
}

export function getLogger(name: string): Logger {
  const logger = loggers[name];
  if (logger == null) {
    let currentLevel: LoggerLevel = WARN;
    const logger: Logger = {
      getLevel: () => currentLevel,
      setLevel: (level: LoggerLevel) => (currentLevel = level),
      trace: (...params: unknown[]): void => {
        if (currentLevel >= TRACE) {
          // eslint-disable-next-line no-console
          console.info(...mapArgs(...params));
        }
      },
      debug: (...params: unknown[]): void => {
        if (currentLevel >= DEBUG) {
          // eslint-disable-next-line no-console
          console.info(...mapArgs(...params));
        }
      },
      info: (...params: unknown[]): void => {
        if (currentLevel >= INFO) {
          // eslint-disable-next-line no-console
          console.info(...mapArgs(...params));
        }
      },
      warn: (...params: unknown[]): void => {
        if (currentLevel >= WARN) {
          // eslint-disable-next-line no-console
          console.warn(...mapArgs(...params));
        }
      },
      error: (...params: unknown[]): void => {
        if (currentLevel >= ERROR) {
          // eslint-disable-next-line no-console
          console.error(...mapArgs(...params));
        }
      },
    };
    loggers[name] = logger;
    return logger;
  } else {
    return logger;
  }
}

const logger = getLogger('default');
logger.setLevel(INFO);

export default logger;
