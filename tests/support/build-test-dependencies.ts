import { buildApplicationDependencies } from '../../src/infrastructure/composition/dependencies';
import { InMemoryTaskRepository } from './in-memory/in-memory-task.repository';
import { InMemoryUsersRepository } from './in-memory/in-memory-user.repository';

export const buildTestDependencies = () => {
  const usersRepository = new InMemoryUsersRepository();
  const tasksRepository = new InMemoryTaskRepository();

  const dependencies = buildApplicationDependencies({
    usersRepository,
    tasksRepository,
    jwtSecret: 'test-secret',
    jwtExpiresIn: '1h',
    passwordSaltRounds: 1,
  });

  return {
    dependencies,
    repositories: {
      tasksRepository,
      usersRepository,
    },
  };
};
