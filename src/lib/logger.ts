const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) logger.log(...args);
  },
  error: (...args: unknown[]) => {
    if (isDev) logger.error(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) logger.warn(...args);
  },
  info: (...args: unknown[]) => {
    if (isDev) logger.info(...args);
  },
};
