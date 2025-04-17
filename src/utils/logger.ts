
class Logger {
  private isDev:boolean;
  private isEnabled: boolean;

  constructor() {
    this.isDev = import.meta.env.DEV;
    this.isEnabled = true;
  }

  private shouldLog():boolean {
    return this.isDev && this.isEnabled;
  }

  setEnabled(enabled:boolean):void {
    this.isEnabled = enabled;
  }

  log(...args: unknown[]): void {
    if (this.shouldLog()) {
      console.log('%c[INFO]', 'color: #4CAF50 font-family: monospace;', ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn('%c[WARN]', 'color: #FFC107; font-family: monosapace;', ...args)
    }
  }
  
  error(...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn('%c[ERROR]', 'color: #F44336; font-family: monosapace;', ...args)
    }
  }
}

export const logger = new Logger();
