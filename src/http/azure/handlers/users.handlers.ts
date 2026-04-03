import { toAuthResponse } from '../presenters/auth.presenter';
import { ApplicationDependencies } from '../../../infrastructure/composition/dependencies';
import { createAzureHttpHandler, jsonResponse, validateBody, validateQuery } from '../http';
import { createUserSchema, userExistsQuerySchema } from '../schemas/users.schema';

export const createUserExistsHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const query = validateQuery(userExistsQuerySchema, request);
    const exists = await services.usersService.exists(query.email);

    return jsonResponse(request, 200, {
      data: {
        exists,
      },
    });
  });

export const createRegisterUserHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const payload = await validateBody(createUserSchema, request);
    const result = await services.usersService.register(payload);

    return jsonResponse(request, 201, {
      data: toAuthResponse(result),
    });
  });
