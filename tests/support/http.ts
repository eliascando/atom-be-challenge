import { HttpRequest, HttpRequestInit, HttpResponseInit, InvocationContext } from '@azure/functions';

export const createHttpRequest = (init: HttpRequestInit): HttpRequest =>
  new HttpRequest({
    method: 'GET',
    url: 'http://localhost/api/v1/test',
    ...init,
  });

export const createInvocationContext = (functionName = 'testFunction'): InvocationContext =>
  new InvocationContext({ functionName });

export const getJsonBody = <T>(response: HttpResponseInit): T => {
  if (response.jsonBody !== undefined) {
    return response.jsonBody as T;
  }

  if (typeof response.body === 'string') {
    return JSON.parse(response.body) as T;
  }

  throw new Error('La respuesta no contiene un body JSON serializable');
};
