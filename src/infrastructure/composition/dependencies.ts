import { AuthUseCases } from '../../application/ports/in/auth.use-cases';
import { TasksUseCases } from '../../application/ports/in/tasks.use-cases';
import { UsersUseCases } from '../../application/ports/in/users.use-cases';
import { TasksRepository } from '../../application/ports/out/tasks.repository';
import { UsersRepository } from '../../application/ports/out/users.repository';
import { AuthService } from '../../application/services/auth.service';
import { TasksService, TasksServiceOptions } from '../../application/services/tasks.service';
import { UsersService, UsersServiceOptions } from '../../application/services/users.service';
import { getRuntimeConfig, getRequiredEnv } from '../config/env';
import { getFirestoreDatabase } from '../config/firestore';
import { FirestoreTasksRepository } from '../persistence/firestore/tasks.repository';
import { FirestoreUsersRepository } from '../persistence/firestore/users.repository';
import { PasswordService } from '../security/password.service';
import { TokenService } from '../security/token.service';

export interface ApplicationDependencies {
  authService: AuthUseCases;
  usersService: UsersUseCases;
  tasksService: TasksUseCases;
}

export interface BuildApplicationDependenciesInput {
  usersRepository: UsersRepository;
  tasksRepository: TasksRepository;
  jwtSecret: string;
  jwtExpiresIn?: string;
  passwordSaltRounds?: number;
  usersServiceOptions?: UsersServiceOptions;
  tasksServiceOptions?: TasksServiceOptions;
}

export const buildApplicationDependencies = (
  input: BuildApplicationDependenciesInput,
): ApplicationDependencies => {
  const passwordService = new PasswordService(input.passwordSaltRounds);
  const tokenService = new TokenService(input.jwtSecret, input.jwtExpiresIn ?? '1h');

  return {
    authService: new AuthService(input.usersRepository, passwordService, tokenService),
    usersService: new UsersService(
      input.usersRepository,
      passwordService,
      tokenService,
      input.usersServiceOptions,
    ),
    tasksService: new TasksService(input.tasksRepository, input.tasksServiceOptions),
  };
};

let cachedDependencies: ApplicationDependencies | null = null;

export const getRuntimeApplicationDependencies = (): ApplicationDependencies => {
  if (!cachedDependencies) {
    const firestore = getFirestoreDatabase();
    const config = getRuntimeConfig();

    cachedDependencies = buildApplicationDependencies({
      usersRepository: new FirestoreUsersRepository(firestore),
      tasksRepository: new FirestoreTasksRepository(firestore),
      jwtSecret: getRequiredEnv('JWT_SECRET'),
      jwtExpiresIn: config.jwtExpiresIn,
    });
  }

  return cachedDependencies;
};
