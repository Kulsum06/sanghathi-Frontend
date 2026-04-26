const isDev = import.meta.env.DEV;

const emit = (method, ...args) => {
  if (!isDev) {
    return;
  }

  const sink = console[method] || console.log;
  sink(...args);
};

const logger = {
  debug: (...args) => emit("debug", ...args),
  info: (...args) => emit("info", ...args),
  warn: (...args) => emit("warn", ...args),
  error: (...args) => emit("error", ...args),
};

export default logger;
