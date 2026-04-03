import { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { ZodType } from 'zod';

import { AppError } from '../../domain/errors/app-error';
import { ApplicationDependencies } from '../../infrastructure/composition/dependencies';
import { getRuntimeConfig } from '../../infrastructure/config/env';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
};

const SECURITY_HEADERS = {
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'x-dns-prefetch-control': 'off',
};

const ALLOW_HEADERS = 'authorization, content-type';
const ALLOW_METHODS = 'GET, POST, PUT, DELETE, OPTIONS';

export interface AzureHttpContext {
  request: HttpRequest;
  context: InvocationContext;
  dependencies: ApplicationDependencies;
}

export type AzureHttpAction = (context: AzureHttpContext) => Promise<HttpResponseInit>;

const resolveCorsHeaders = (request: HttpRequest): Record<string, string> => {
  const config = getRuntimeConfig();
  const origin = request.headers.get('origin');

  if (config.corsOrigins.length === 1 && config.corsOrigins[0] === '*') {
    return {
      'access-control-allow-headers': ALLOW_HEADERS,
      'access-control-allow-methods': ALLOW_METHODS,
      'access-control-allow-origin': '*',
    };
  }

  if (origin && config.corsOrigins.includes(origin)) {
    return {
      'access-control-allow-headers': ALLOW_HEADERS,
      'access-control-allow-methods': ALLOW_METHODS,
      'access-control-allow-origin': origin,
      vary: 'Origin',
    };
  }

  return {
    'access-control-allow-headers': ALLOW_HEADERS,
    'access-control-allow-methods': ALLOW_METHODS,
  };
};

const withDefaultHeaders = (
  request: HttpRequest,
  response: HttpResponseInit,
): HttpResponseInit => ({
  ...response,
  headers: {
    ...SECURITY_HEADERS,
    ...resolveCorsHeaders(request),
    ...(response.headers ?? {}),
  },
});

export const jsonResponse = (
  request: HttpRequest,
  status: number,
  jsonBody: unknown,
  headers?: Record<string, string>,
): HttpResponseInit =>
  withDefaultHeaders(request, {
    status,
    jsonBody,
    headers: {
      ...JSON_HEADERS,
      ...(headers ?? {}),
    },
  });

export const emptyResponse = (
  request: HttpRequest,
  status = 204,
  headers?: Record<string, string>,
): HttpResponseInit =>
  withDefaultHeaders(request, {
    status,
    headers,
  });

export const toErrorResponse = (
  request: HttpRequest,
  error: unknown,
): HttpResponseInit => {
  if (error instanceof AppError) {
    return jsonResponse(request, error.statusCode, {
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  return jsonResponse(request, 500, {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Error interno del servidor',
    },
  });
};

export const createAzureHttpHandler = (
  dependencies: ApplicationDependencies,
  action: AzureHttpAction,
) => {
  return async (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> => {
    try {
      if (request.method.toUpperCase() === 'OPTIONS') {
        return emptyResponse(request);
      }

      return withDefaultHeaders(
        request,
        await action({
          request,
          context,
          dependencies,
        }),
      );
    } catch (error) {
      context.error(error);
      return toErrorResponse(request, error);
    }
  };
};

export const readJsonBody = async <T>(request: HttpRequest): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AppError('JSON inválido', 400, 'BAD_REQUEST');
  }
};

export const validateSchema = <T>(schema: ZodType<T>, payload: unknown): T => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new AppError('Validación inválida', 400, 'VALIDATION_ERROR', result.error.flatten());
  }

  return result.data;
};

export const validateBody = async <T>(schema: ZodType<T>, request: HttpRequest): Promise<T> => {
  const body = await readJsonBody<unknown>(request);

  return validateSchema(schema, body);
};

export const validateQuery = <T>(schema: ZodType<T>, request: HttpRequest): T => {
  return validateSchema(schema, Object.fromEntries(request.query.entries()));
};

export const validateParams = <T>(schema: ZodType<T>, request: HttpRequest): T => {
  return validateSchema(schema, request.params);
};

export const getAuthorizationHeader = (request: HttpRequest): string | undefined => {
  return request.headers.get('authorization') ?? undefined;
};
