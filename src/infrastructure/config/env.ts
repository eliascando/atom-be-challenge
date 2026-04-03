import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const stripWrappingQuotes = (value: string): string => {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
};

const parseDotEnvLine = (line: string): [string, string] | null => {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');

  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = stripWrappingQuotes(trimmed.slice(separatorIndex + 1).trim());

  if (!key) {
    return null;
  }

  return [key, value];
};

let envFileLoaded = false;

export const loadDotEnvFile = (filePath = resolve(process.cwd(), '.env')): void => {
  if (envFileLoaded || !existsSync(filePath)) {
    envFileLoaded = true;
    return;
  }

  const content = readFileSync(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const parsedEntry = parseDotEnvLine(line);

    if (!parsedEntry) {
      continue;
    }

    const [key, value] = parsedEntry;

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  envFileLoaded = true;
};

loadDotEnvFile();

const normalizeOrigins = (value?: string): string[] => {
  if (!value || value.trim() === '*') {
    return ['*'];
  }

  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export interface RuntimeConfig {
  corsOrigins: string[];
  jwtExpiresIn: string;
}

export const getRuntimeConfig = (): RuntimeConfig => ({
  corsOrigins: normalizeOrigins(process.env.CORS_ORIGIN),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
});

export const getOptionalEnv = (name: string): string | undefined => {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
};

export const getRequiredEnv = (name: string): string => {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
};
