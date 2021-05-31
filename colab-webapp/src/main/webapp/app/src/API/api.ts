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
  WsSessionIdentifier,
  CardContent,
  CardType,
} from 'colab-rest-client';

import { getStore, ColabState } from '../store/store';

import { addError } from '../store/error';
import { hashPassword } from '../SecurityHelper';
import { createAsyncThunk } from '@reduxjs/toolkit';

const restClient = ColabClient('', error => {
  if (entityIs(error, 'HttpException')) {
    getStore().dispatch(
      addError({
        status: 'OPEN',
        error: error,
      }),
    );
  } else if (error instanceof Error) {
    getStore().dispatch(
      addError({
        status: 'OPEN',
        error: `${error.name}: ${error.message}`,
      }),
    );
  } else {
    getStore().dispatch(
      addError({
        status: 'OPEN',
        error: 'Something went wrong',
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
export const getRestClient = (): typeof restClient => restClient;

////////////////////////////////////////////////////////////////////////////////////////////////////
// Websocket Management
////////////////////////////////////////////////////////////////////////////////////////////////////
export const initSocketId = createAsyncThunk(
  'websocket/initSessionId',
  async (payload: WsSessionIdentifier | null, thunkApi) => {
    const state = thunkApi.getState() as ColabState;

    if (payload != null) {
      // when initializing / setting a new socket id
      // an authenticated user shall reconnect to its own channel ASAP
      if (state.auth.currentUserId != null) {
        restClient.WebsocketRestEndpoint.subscribeToUserChannel(payload);
      }
    }
    return payload;
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Admin & Monitoring
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getOccupiedChannels = createAsyncThunk('admin/getChannels', async () => {
  return await restClient.WebsocketRestEndpoint.getExistingChannels();
});

export const getLoggerLevels = createAsyncThunk('admin/getLoggerLevels', async () => {
  return await restClient.MonitoringRestEndpoint.getLoggerLevels();
});

export const changeLoggerLevel = createAsyncThunk(
  'admin/setLoggerLevel',
  async (payload: { loggerName: string; loggerLevel: string }, thunkApi) => {
    await restClient.MonitoringRestEndpoint.changeLoggerLevel(
      payload.loggerName,
      payload.loggerLevel,
    );
    thunkApi.dispatch(getLoggerLevels());
    return payload;
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentication
////////////////////////////////////////////////////////////////////////////////////////////////////

export const requestPasswordReset = createAsyncThunk(
  'auth/restPassword',
  async (a: { email: string }) => {
    await restClient.UserRestEndpoint.requestPasswordReset(a.email);
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
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(a.identifier);
    const authInfo: AuthInfo = {
      '@class': 'AuthInfo',
      identifier: a.identifier,
      mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
    };

    await restClient.UserRestEndpoint.signIn(authInfo);

    thunkApi.dispatch(reloadCurrentUser());
  },
);

export const updateLocalAccountPassword = createAsyncThunk(
  'user/updatePassword',
  async (a: { email: string; password: string }) => {
    // first, fetch the authenatication method fot the account
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(a.email);

    if (entityIs(authMethod, 'AuthMethod')) {
      const authInfo: AuthInfo = {
        '@class': 'AuthInfo',
        identifier: a.email,
        mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
      };

      await restClient.UserRestEndpoint.updateLocalAccountPassword(authInfo);
    }
  },
);

export const signOut = createAsyncThunk('auth/signout', async () => {
  return await restClient.UserRestEndpoint.signOut();
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
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(a.email);

    const signUpInfo: SignUpInfo = {
      '@class': 'SignUpInfo',
      email: a.email,
      username: a.username,
      hashMethod: authMethod.mandatoryMethod,
      salt: authMethod.salt,
      hash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, a.password),
    };
    await restClient.UserRestEndpoint.signUp(signUpInfo);

    // go back to login page
    thunkApi.dispatch(signInWithLocalAccount({ identifier: a.email, password: a.password }));
  },
);

export const reloadCurrentUser = createAsyncThunk(
  'auth/reload',
  async (_noPayload: void, thunkApi) => {
    // one would like to await both query result later, but as those requests are most likely
    // the very firsts to be sent to the server, it shoudl be avoided to prevent creatiing two
    // colab_session_id
    const currentAccount = await restClient.UserRestEndpoint.getCurrentAccount();
    const currentUser = await restClient.UserRestEndpoint.getCurrentUser();

    const allAccounts = await restClient.UserRestEndpoint.getAllCurrentUserAccounts();

    if (currentUser != null) {
      // current user is authenticated
      const state = thunkApi.getState() as ColabState;
      if (state.websockets.sessionId != null && state.auth.currentUserId != currentUser.id) {
        // Websocket session is ready AND currentUser just changed
        // subscribe to the new current user channel ASAP
        await restClient.WebsocketRestEndpoint.subscribeToUserChannel({
          '@class': 'WsSessionIdentifier',
          sessionId: state.websockets.sessionId,
        });
      }
    }
    return { currentUser: currentUser, currentAccount: currentAccount, accounts: allAccounts };
  },
);

export const updateUser = createAsyncThunk('user/update', async (user: User) => {
  await restClient.UserRestEndpoint.updateUser(user);
  return user;
});

export const getUser = createAsyncThunk('user/get', async (id: number) => {
  return await restClient.UserRestEndpoint.getUserById(id);
});

export const getAllUsers = createAsyncThunk('user/getAll', async () => {
  return await restClient.UserRestEndpoint.getAllUsers();
});

export const grantAdminRight = createAsyncThunk('user/grantAdminRight', async (user: User) => {
  if (user.id != null) {
    return await restClient.UserRestEndpoint.grantAdminRight(user.id);
  }
});

export const revokeAdminRight = createAsyncThunk('user/revokeAdminRight', async (user: User) => {
  if (user.id != null) {
    return await restClient.UserRestEndpoint.revokeAdminRight(user.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Projects
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getUserProjects = createAsyncThunk('project/users', async () => {
  return await restClient.ProjectRestEndpoint.getUserProjects();
});

export const getAllProjects = createAsyncThunk('project/all', async () => {
  return await restClient.ProjectRestEndpoint.getAllProjects();
});

export const createProject = createAsyncThunk('project/create', async (project: Project) => {
  return await restClient.ProjectRestEndpoint.createProject({
    ...project,
    id: undefined,
  });
});

export const updateProject = createAsyncThunk('project/update', async (project: Project) => {
  await restClient.ProjectRestEndpoint.updateProject(project);
});

export const deleteProject = createAsyncThunk('project/delete', async (project: Project) => {
  if (project.id) {
    await restClient.ProjectRestEndpoint.deleteProject(project.id);
  }
});

export const startProjectEdition = createAsyncThunk(
  'project/startEditing',
  async (project: Project, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (state.websockets.sessionId != null && project.id != null) {
      if (state.projects.editing != null) {
        // close current project if there is one
        await thunkApi.dispatch(closeCurrentProject());
      }

      // Subscribe to new project channel
      await restClient.WebsocketRestEndpoint.subscribeToProjectChannel(project.id, {
        '@class': 'WsSessionIdentifier',
        sessionId: state.websockets.sessionId,
      });

      // initialized project content
      if (project.rootCardId != null) {
        await thunkApi.dispatch(getCard(project.rootCardId));
      }
    }
    return project;
  },
);

export const closeCurrentProject = createAsyncThunk(
  'project/stopEditing',
  async (_action: void, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (state.projects.editing != null && state.websockets.sessionId) {
      restClient.WebsocketRestEndpoint.unsubscribeFromProjectChannel(state.projects.editing, {
        '@class': 'WsSessionIdentifier',
        sessionId: state.websockets.sessionId,
      });
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Project team
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getProjectTeam = createAsyncThunk('project/team/get', async (projectId: number) => {
  return await restClient.ProjectRestEndpoint.getMembers(projectId);
});

export const sendInvitation = createAsyncThunk(
  'project/team/invite',
  async (payload: { projectId: number; recipient: string }, thunkApi) => {
    if (payload.recipient) {
      await restClient.ProjectRestEndpoint.inviteSomeone(payload.projectId, payload.recipient);
      thunkApi.dispatch(getProjectTeam(payload.projectId));
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Types
////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * For Admins: get all cardTypes
 */
export const initCardTypes = createAsyncThunk('cardType/init', async () => {
  return await restClient.CardTypeRestEndpoint.getAllCardTypes();
});

/**
 * Get project own cardTypes
 */
export const getProjectCardTypes = createAsyncThunk(
  'cardType/getProjectOnes',
  async (project: Project) => {
    if (project.id) {
      return await restClient.ProjectRestEndpoint.getCardTypesOfProject(project.id);
    } else {
      return [];
    }
  },
);

/**
 * Get all global cardTypes
 */
export const getAllGlobalCardTypes = createAsyncThunk('cardType/getAllGlobals', async () => {
  return await restClient.CardTypeRestEndpoint.getAllGlobalCardTypes();
});

/**
 * Get published global cardTypes
 */
export const getPublishedGlobalCardTypes = createAsyncThunk(
  'cardType/getPublihedGlobals',
  async () => {
    return await restClient.CardTypeRestEndpoint.getPublishedGlobalsCardTypes();
  },
);

export const getCardType = createAsyncThunk('cardType/get', async (id: number) => {
  return await restClient.CardTypeRestEndpoint.getCardType(id);
});

export const createCardType = createAsyncThunk('cardType/create', async (cardType: CardType) => {
  return await restClient.CardTypeRestEndpoint.createCardType(cardType);
});

export const updateCardType = createAsyncThunk('cardType/update', async (cardType: CardType) => {
  await restClient.CardTypeRestEndpoint.updateCardType(cardType);
});

export const deleteCardType = createAsyncThunk('cardType/delete', async (cardType: CardType) => {
  if (cardType.id) {
    await restClient.CardTypeRestEndpoint.deleteCardType(cardType.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
////////////////////////////////////////////////////////////////////////////////////////////////////

export const initCards = createAsyncThunk('card/init', async () => {
  return await restClient.CardRestEndpoint.getAllCards();
});

export const getCard = createAsyncThunk('card/get', async (id: number) => {
  return await restClient.CardRestEndpoint.getCard(id);
});

export const createCard = createAsyncThunk('card/create', async (card: Card) => {
  return await restClient.CardRestEndpoint.createCard({
    ...card,
    id: undefined,
  });
});

export const createSubCard = createAsyncThunk(
  'card/createSubCard',
  async ({ parent, cardTypeId }: { parent: CardContent; cardTypeId: number }) => {
    if (parent.id != null) {
      return await restClient.CardRestEndpoint.createNewCard(parent.id, cardTypeId);
    }
  },
);

export const updateCard = createAsyncThunk('card/update', async (card: Card) => {
  await restClient.CardRestEndpoint.updateCard(card);
});

export const deleteCard = createAsyncThunk('card/delete', async (card: Card) => {
  if (card.id) {
    await restClient.CardRestEndpoint.deleteCard(card.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Contents
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCardContent = createAsyncThunk('cardcontent/get', async (id: number) => {
  return await restClient.CardContentRestEndpoint.getCardContent(id);
});

export const getCardContents = createAsyncThunk('cardcontent/getByCard', async (cardId: number) => {
  return await restClient.CardRestEndpoint.getContentVariantsOfCard(cardId);
});

export const createCardContentVariant = createAsyncThunk(
  'cardcontent/create',
  async (cardId: number) => {
    return await restClient.CardContentRestEndpoint.createNewCardContent(cardId);
  },
);

export const updateCardContent = createAsyncThunk(
  'cardcontent/update',
  async (cardContent: CardContent) => {
    return await restClient.CardContentRestEndpoint.updateCardContent(cardContent);
  },
);

export const deleteCardContent = createAsyncThunk(
  'cardcontent/delete',
  async (cardContent: CardContent) => {
    if (cardContent.id != null) {
      return await restClient.CardContentRestEndpoint.deleteCardContent(cardContent.id);
    }
  },
);

export const getSubCards = createAsyncThunk(
  'cardcontent/getSubs',
  async (cardContentId: number) => {
    return await restClient.CardContentRestEndpoint.getSubCards(cardContentId);
  },
);
