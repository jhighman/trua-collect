export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  public error(message: string, error?: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${this.context}] ${message}`, errorMessage);
  }

  public info(message: string, ...args: unknown[]) {
    console.info(`[${this.context}] ${message}`, ...args);
  }

  public warn(message: string, ...args: unknown[]) {
    console.warn(`[${this.context}] ${message}`, ...args);
  }

  public debug(message: string, ...args: unknown[]) {
    console.debug(`[${this.context}] ${message}`, ...args);
  }
} 