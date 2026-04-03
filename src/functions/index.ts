import { app } from '@azure/functions';

import { createLoginHandler } from '../http/azure/handlers/auth.handlers';
import { createHealthHandler } from '../http/azure/handlers/health.handlers';
import {
  createCreateTaskHandler,
  createDeleteTaskHandler,
  createListTasksHandler,
  createUpdateTaskHandler,
} from '../http/azure/handlers/tasks.handlers';
import {
  createRegisterUserHandler,
  createUserExistsHandler,
} from '../http/azure/handlers/users.handlers';
import { getRuntimeApplicationDependencies } from '../infrastructure/composition/dependencies';

const dependencies = getRuntimeApplicationDependencies();
const allowMethods = ['OPTIONS'] as const;
const listTasksHandler = createListTasksHandler(dependencies);
const createTaskHandler = createCreateTaskHandler(dependencies);
const updateTaskHandler = createUpdateTaskHandler(dependencies);
const deleteTaskHandler = createDeleteTaskHandler(dependencies);

app.http('health', {
  methods: ['GET', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/health',
  handler: createHealthHandler(dependencies),
});

app.http('authLogin', {
  methods: ['POST', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/auth/login',
  handler: createLoginHandler(dependencies),
});

app.http('usersExists', {
  methods: ['GET', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/users/exists',
  handler: createUserExistsHandler(dependencies),
});

app.http('usersCreate', {
  methods: ['POST', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/users',
  handler: createRegisterUserHandler(dependencies),
});

app.http('tasksCollection', {
  methods: ['GET', 'POST', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/tasks',
  handler: (request, context) =>
    request.method.toUpperCase() === 'POST'
      ? createTaskHandler(request, context)
      : listTasksHandler(request, context),
});

app.http('taskItem', {
  methods: ['PUT', 'DELETE', ...allowMethods],
  authLevel: 'anonymous',
  route: 'v1/tasks/{taskId}',
  handler: (request, context) =>
    request.method.toUpperCase() === 'DELETE'
      ? deleteTaskHandler(request, context)
      : updateTaskHandler(request, context),
});
