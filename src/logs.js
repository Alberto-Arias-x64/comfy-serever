import { LOG_PATH } from './config.js';
import fs from 'fs/promises';
import path from 'path';

export const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  FATAL: 'FATAL'
};

export class Logger {
  static instance = new Logger();
  #MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  #MAX_FILES = 100;

  constructor() {
    this.logDir = LOG_PATH;
  }

  static getInstance() {
    if (!Logger.instance) Logger.instance = new Logger();
    return Logger.instance;
  }

  async ensureLogDirectory() {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  getLogFileName() {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `app-${date}.log`);
  }

  async rotateLogs() {
    await this.ensureLogDirectory();
    const files = (await fs.readdir(this.logDir))
      .filter(file => file.startsWith('app-') && file.endsWith('.log'))
      .sort()
      .reverse();

    if (files.length >= this.#MAX_FILES) {
      for (let i = this.#MAX_FILES - 1; i < files.length; i++) {
        await fs.unlink(path.join(this.logDir, files[i]));
      }
    }
  }

  async writeLog(level, message, data) {
    await this.ensureLogDirectory();
    const currentLogFile = this.getLogFileName();
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data: data || null
    };

    const logString = JSON.stringify(logEntry) + '\n';

    try {
      const stats = await fs.stat(currentLogFile);
      if (stats.size + logString.length > this.#MAX_FILE_SIZE) {
        await this.rotateLogs();
      }
    } catch (error) {
      // File doesn't exist yet, that's okay
    }

    await fs.appendFile(currentLogFile, logString);
  }

  async debug(message, data) {
    console.debug(message, data);
    await this.writeLog(LogLevel.DEBUG, message, data);
  }

  async info(message, data) {
    console.info(message, data);
    await this.writeLog(LogLevel.INFO, message, data);
  }

  async warn(message, data) {
    console.warn(message, data);
    await this.writeLog(LogLevel.WARN, message, data);
  }

  async error(message, data) {
    console.error(message, data);
    await this.writeLog(LogLevel.ERROR, message, data);
  }

  async fatal(message, data) {
    console.error(message, data);
    await this.writeLog(LogLevel.FATAL, message, data);
  }
} 