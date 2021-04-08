/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
  ColabClient,
  AuthInfo,
  SignUpInfo,
  Project,
  Card,
  entityIs,
  User,
} from 'colab-rest-client';

import { getStore } from '../store/store';

import { addError } from '../store/error';
import { hashPassword } from '../SecurityHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';

const restClient = ColabClient('', error => {
  if (entityIs(error, 'HttpException') || error instanceof Error) {
    getStore().dispatch(
      addError({
        status: 'OPEN',
        error: error,
      }),
    );
  } else {
    getStore().dispatch(
      addError({
        status: 'OPEN',
        error: new Error('Something went wrong'),
      }),
    );
  }
});

/**
 * First access to the API client.
 * Such direct allows direct calls to the API, bypassing thunk/redux action. It's not that normal.
 * to do such calls but may be usefull in some edge-cades whene using the redux state is useless.
 * EG. token processing
 */
export const getRestClient = () => restClient;

export const requestPasswordReset = createAsyncThunk(
  'auth/restPassword',
  async (a: { email: string }) => {
    await restClient.UserController.requestPasswordReset(a.email);
  },
);

export const signInWithLocalAccount = createAsyncThunk(
  'auth/signInLocalAccount',
  async (
    a: {
      identifier: string;
      password: string;
    },
    thunkApi,
  ) => {
    // first, fetch an authenatication method
    const authMethod = await restClient.UserController.getAuthMethod(a.identifier);
    const authInfo: AuthInfo = {
      '@class': 'AuthInfo',
      identifier: a.identifier,
      mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
    };

    await restClient.UserController.signIn(authInfo);

    thunkApi.dispatch(reloadCurrentUser());
  },
);

export const updateLocalAccountPassword = createAsyncThunk(
  'user/updatePassword',
  async (a: { email: string; password: string }) => {
    // first, fetch the authenatication method fot the account
    const authMethod = await restClient.UserController.getAuthMethod(a.email);

    if (entityIs(authMethod, 'AuthMethod')) {
      const authInfo: AuthInfo = {
        '@class': 'AuthInfo',
        identifier: a.email,
        mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
      };

      await restClient.UserController.updateLocalAccountPassword(authInfo);
    }
  },
);

export const signOut = createAsyncThunk('auth/signout', async () => {
  return await restClient.UserController.signOut();
});

export const signUp = createAsyncThunk(
  'auth/signup',
  async (
    a: {
      username: string;
      email: string;
      password: string;
    },
    thunkApi,
  ) => {
    // first, fetch a
    const authMethod = await restClient.UserController.getAuthMethod(a.email);

    const signUpInfo: SignUpInfo = {
      '@class': 'SignUpInfo',
      email: a.email,
      username: a.username,
      hashMethod: authMethod.mandatoryMethod,
      salt: authMethod.salt,
      hash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
    };
    await restClient.UserController.signUp(signUpInfo);

    // go back to login page
    thunkApi.dispatch(signInWithLocalAccount({ identifier: a.email, password: a.password }));
  },
);

export const reloadCurrentUser = createAsyncThunk('auth/reload', async () => {
  // one would like to await both query result later, but as those requests are most likely
  // the very firsts to be sent to the server, it shoudl be avoided to prevent creatiing two
  // colab_session_id
  const currentAccount = await restClient.UserController.getCurrentAccount();
  const currentUser = await restClient.UserController.getCurrentUser();

  const allAccounts = await restClient.UserController.getAllCurrentUserAccounts();

  return { currentUser: currentUser, currentAccount: currentAccount, accounts: allAccounts };
});

export const updateUser = createAsyncThunk('user/update', async (user: User) => {
  await restClient.UserController.updateUser(user);
  return user;
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Projects
////////////////////////////////////////////////////////////////////////////////////////////////////

export const initProjects = createAsyncThunk('project/init', async () => {
  return await restClient.ProjectController.getAllProjects();
});

export const createProject = createAsyncThunk('project/create', async (project: Project) => {
  return await restClient.ProjectController.createProject({
    ...project,
    id: undefined,
  });
});

export const updateProject = createAsyncThunk('project/update', async (project: Project) => {
  await restClient.ProjectController.updateProject(project);
});

export const deleteProject = createAsyncThunk('project/delete', async (project: Project) => {
  if (project.id) {
    await restClient.ProjectController.deleteProject(project.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
////////////////////////////////////////////////////////////////////////////////////////////////////

export const initCards = createAsyncThunk('card/init', async () => {
  return await restClient.CardController.getAllCards();
});

export const createCard = createAsyncThunk('card/create', async (card: Card) => {
  return await restClient.CardController.createCard({
    ...card,
    id: undefined,
  });
});

export const updateCard = createAsyncThunk('card/update', async (card: Card) => {
  await restClient.CardController.updateCard(card);
});

export const deleteCard = createAsyncThunk('card/delete', async (card: Card) => {
  if (card.id) {
    await restClient.CardController.deleteCard(card.id);
  }
});
