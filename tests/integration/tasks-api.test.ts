import { describe, expect, it } from 'vitest';

import { createLoginHandler } from '../../src/http/azure/handlers/auth.handlers';
import {
  createCreateTaskHandler,
  createDeleteTaskHandler,
  createListTasksHandler,
  createUpdateTaskHandler,
} from '../../src/http/azure/handlers/tasks.handlers';
import {
  createRegisterUserHandler,
  createUserExistsHandler,
} from '../../src/http/azure/handlers/users.handlers';
import { buildTestDependencies } from '../support/build-test-dependencies';
import { createHttpRequest, createInvocationContext, getJsonBody } from '../support/http';

describe('Tasks API', () => {
  it('rechaza acceder a tareas sin bearer token', async () => {
    const { dependencies } = buildTestDependencies();
    const handler = createListTasksHandler(dependencies);

    const response = await handler(
      createHttpRequest({
        method: 'GET',
        url: 'http://localhost/api/v1/tasks',
      }),
      createInvocationContext('tasksList'),
    );

    expect(response.status).toBe(401);
    expect(getJsonBody<{ error: { code: string } }>(response).error.code).toBe('UNAUTHORIZED');
  });

  it('crea usuario, emite JWT y permite el flujo CRUD de tareas', async () => {
    const { dependencies } = buildTestDependencies();

    const registerUser = createRegisterUserHandler(dependencies);
    const userExists = createUserExistsHandler(dependencies);
    const login = createLoginHandler(dependencies);
    const createTask = createCreateTaskHandler(dependencies);
    const listTasks = createListTasksHandler(dependencies);
    const updateTask = createUpdateTaskHandler(dependencies);
    const deleteTask = createDeleteTaskHandler(dependencies);

    const createUserResponse = await registerUser(
      createHttpRequest({
        method: 'POST',
        url: 'http://localhost/api/v1/users',
        body: {
          string: JSON.stringify({
            name: 'Elias Cando',
            email: 'elias@example.com',
            password: 'password123',
          }),
        },
        headers: {
          'content-type': 'application/json',
        },
      }),
      createInvocationContext('usersCreate'),
    );

    expect(createUserResponse.status).toBe(201);
    const createUserBody = getJsonBody<{
      data: { token: string; user: { email: string } };
    }>(createUserResponse);
    expect(createUserBody.data.user.email).toBe('elias@example.com');
    expect(createUserBody.data.token).toBeTypeOf('string');

    const existsResponse = await userExists(
      createHttpRequest({
        method: 'GET',
        url: 'http://localhost/api/v1/users/exists?email=elias@example.com',
        query: { email: 'elias@example.com' },
      }),
      createInvocationContext('usersExists'),
    );

    expect(existsResponse.status).toBe(200);
    expect(getJsonBody<{ data: { exists: boolean } }>(existsResponse).data.exists).toBe(true);

    const loginResponse = await login(
      createHttpRequest({
        method: 'POST',
        url: 'http://localhost/api/v1/auth/login',
        body: {
          string: JSON.stringify({
            email: 'elias@example.com',
            password: 'password123',
          }),
        },
        headers: {
          'content-type': 'application/json',
        },
      }),
      createInvocationContext('authLogin'),
    );

    expect(loginResponse.status).toBe(200);
    const token = getJsonBody<{ data: { token: string } }>(loginResponse).data.token;

    const createTaskResponse = await createTask(
      createHttpRequest({
        method: 'POST',
        url: 'http://localhost/api/v1/tasks',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: {
          string: JSON.stringify({
            title: 'Diseñar arquitectura hexagonal',
            description: 'Separar dominio, aplicación e infraestructura',
          }),
        },
      }),
      createInvocationContext('tasksCreate'),
    );

    expect(createTaskResponse.status).toBe(201);
    const taskBody = getJsonBody<{ data: { id: string; status: string } }>(createTaskResponse);
    expect(taskBody.data.status).toBe('pending');

    const taskId = taskBody.data.id;

    const listResponse = await listTasks(
      createHttpRequest({
        method: 'GET',
        url: 'http://localhost/api/v1/tasks',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      createInvocationContext('tasksList'),
    );

    expect(listResponse.status).toBe(200);
    expect(getJsonBody<{ data: unknown[] }>(listResponse).data).toHaveLength(1);

    const updateResponse = await updateTask(
      createHttpRequest({
        method: 'PUT',
        url: `http://localhost/api/v1/tasks/${taskId}`,
        params: {
          taskId,
        },
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: {
          string: JSON.stringify({
            status: 'done',
          }),
        },
      }),
      createInvocationContext('tasksUpdate'),
    );

    expect(updateResponse.status).toBe(200);
    expect(getJsonBody<{ data: { status: string } }>(updateResponse).data.status).toBe('done');

    const deleteResponse = await deleteTask(
      createHttpRequest({
        method: 'DELETE',
        url: `http://localhost/api/v1/tasks/${taskId}`,
        params: {
          taskId,
        },
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      createInvocationContext('tasksDelete'),
    );

    expect(deleteResponse.status).toBe(204);

    const emptyListResponse = await listTasks(
      createHttpRequest({
        method: 'GET',
        url: 'http://localhost/api/v1/tasks',
        headers: {
          authorization: `Bearer ${token}`,
        },
      }),
      createInvocationContext('tasksList'),
    );

    expect(emptyListResponse.status).toBe(200);
    expect(getJsonBody<{ data: unknown[] }>(emptyListResponse).data).toHaveLength(0);
  });
});
