import { ApplicationDependencies } from '../../../infrastructure/composition/dependencies';
import { createAzureHttpHandler, jsonResponse } from '../http';

export const createHealthHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request }) =>
    jsonResponse(request, 200, {
      data: {
        service: 'taskexpress-functions-api',
        status: 'ok',
      },
    }),
  );
