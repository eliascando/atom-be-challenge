import { toAuthResponse } from '../presenters/auth.presenter';
import { ApplicationDependencies } from '../../../infrastructure/composition/dependencies';
import { createAzureHttpHandler, jsonResponse, validateBody } from '../http';
import { loginSchema } from '../schemas/auth.schema';

export const createLoginHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const payload = await validateBody(loginSchema, request);
    const result = await services.authService.login(payload);

    return jsonResponse(request, 200, {
      data: toAuthResponse(result),
    });
  });
