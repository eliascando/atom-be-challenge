import { ApplicationDependencies } from '../../../infrastructure/composition/dependencies';
import {
  createAzureHttpHandler,
  emptyResponse,
  getAuthorizationHeader,
  jsonResponse,
  validateBody,
  validateParams,
} from '../http';
import { toTaskResponse } from '../presenters/task.presenter';
import { createTaskSchema, taskParamsSchema, updateTaskSchema } from '../schemas/tasks.schema';

const authenticate = (
  authorization: string | undefined,
  dependencies: ApplicationDependencies,
) => dependencies.authService.authenticate(authorization);

export const createListTasksHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const auth = await authenticate(getAuthorizationHeader(request), services);
    const tasks = await services.tasksService.list(auth.userId);

    return jsonResponse(request, 200, {
      data: tasks.map(toTaskResponse),
    });
  });

export const createCreateTaskHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const auth = await authenticate(getAuthorizationHeader(request), services);
    const payload = await validateBody(createTaskSchema, request);
    const task = await services.tasksService.create({
      ...payload,
      userId: auth.userId,
    });

    return jsonResponse(request, 201, {
      data: toTaskResponse(task),
    });
  });

export const createUpdateTaskHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const auth = await authenticate(getAuthorizationHeader(request), services);
    const params = validateParams(taskParamsSchema, request);
    const payload = await validateBody(updateTaskSchema, request);
    const task = await services.tasksService.update({
      taskId: params.taskId,
      userId: auth.userId,
      ...payload,
    });

    return jsonResponse(request, 200, {
      data: toTaskResponse(task),
    });
  });

export const createDeleteTaskHandler = (dependencies: ApplicationDependencies) =>
  createAzureHttpHandler(dependencies, async ({ request, dependencies: services }) => {
    const auth = await authenticate(getAuthorizationHeader(request), services);
    const params = validateParams(taskParamsSchema, request);

    await services.tasksService.remove(params.taskId, auth.userId);

    return emptyResponse(request, 204);
  });
