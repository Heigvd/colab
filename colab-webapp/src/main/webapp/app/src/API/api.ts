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
  CardDef,
} from 'colab-rest-client';

import {getStore, ColabState} from '../store/store';

import {addError} from '../store/error';
import {hashPassword} from '../SecurityHelper';
import {createAsyncThunk} from '@reduxjs/toolkit';

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
        restClient.WebsocketController.subscribeToUserChannel(payload);
      }
    }
    return payload;
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Admin & Monitoring
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getOccupiedChannels = createAsyncThunk('admin/getChannels', async () => {
  return await restClient.WebsocketController.getExistingChannels();
});

export const getLoggerLevels = createAsyncThunk('admin/getLoggerLevels', async () => {
  return await restClient.MonitoringController.getLoggerLevels();
});

export const changeLoggerLevel = createAsyncThunk(
  'admin/setLoggerLevel',
  async (payload: {loggerName: string; loggerLevel: string}, thunkApi) => {
    await restClient.MonitoringController.changeLoggerLevel(
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
  async (a: {email: string}) => {
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
  async (a: {email: string; password: string}) => {
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
    thunkApi.dispatch(signInWithLocalAccount({identifier: a.email, password: a.password}));
  },
);

export const reloadCurrentUser = createAsyncThunk(
  'auth/reload',
  async (_noPayload: void, thunkApi) => {
    // one would like to await both query result later, but as those requests are most likely
    // the very firsts to be sent to the server, it shoudl be avoided to prevent creatiing two
    // colab_session_id
    const currentAccount = await restClient.UserController.getCurrentAccount();
    const currentUser = await restClient.UserController.getCurrentUser();

    const allAccounts = await restClient.UserController.getAllCurrentUserAccounts();

    if (currentUser != null) {
      // current user is authenticated
      const state = thunkApi.getState() as ColabState;
      if (state.websockets.sessionId != null && state.auth.currentUserId != currentUser.id) {
        // Websocket session is ready AND currentUser just changed
        // subscribe to the new current user channel ASAP
        await restClient.WebsocketController.subscribeToUserChannel({
          '@class': 'WsSessionIdentifier',
          sessionId: state.websockets.sessionId,
        });
      }
    }
    return {currentUser: currentUser, currentAccount: currentAccount, accounts: allAccounts};
  },
);

export const updateUser = createAsyncThunk('user/update', async (user: User) => {
  await restClient.UserController.updateUser(user);
  return user;
});

export const getUser = createAsyncThunk('user/get', async (id: number) => {
  return await restClient.UserController.getUserById(id);
});

export const getAllUsers = createAsyncThunk('user/getAll', async () => {
  return await restClient.UserController.getAllUsers();
});

export const grantAdminRight = createAsyncThunk('user/grantAdminRight', async (user: User) => {
  if (user.id != null) {
    return await restClient.UserController.grantAdminRight(user.id);
  }
});

export const revokeAdminRight = createAsyncThunk('user/revokeAdminRight', async (user: User) => {
  if (user.id != null) {
    return await restClient.UserController.revokeAdminRight(user.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Projects
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getUserProjects = createAsyncThunk('project/users', async () => {
  return await restClient.ProjectController.getUserProjects();
});

export const getAllProjects = createAsyncThunk('project/all', async () => {
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
      await restClient.WebsocketController.subscribeToProjectChannel(project.id, {
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
      restClient.WebsocketController.unsubscribeFromProjectChannel(state.projects.editing, {
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
  return await restClient.ProjectController.getMembers(projectId);
});

export const sendInvitation = createAsyncThunk(
  'project/team/invite',
  async (payload: {projectId: number; recipient: string}, thunkApi) => {
    if (payload.recipient) {
      await restClient.ProjectController.inviteSomeone(payload.projectId, payload.recipient);
      thunkApi.dispatch(getProjectTeam(payload.projectId));
    }
  },
);


////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Definitions
////////////////////////////////////////////////////////////////////////////////////////////////////

export const initCardDefs = createAsyncThunk('cardDef/init', async () => {
  return await restClient.CardDefController.getAllCardDefs()
});

export const getCardDef = createAsyncThunk('cardDef/create', async (id: number) => {
  return await restClient.CardDefController.getCardDef(id);
});

export const createCardDef = createAsyncThunk('cardDef/create', async (cardDef: CardDef) => {
  return await restClient.CardDefController.createCardDef({
    ...cardDef,
    id: undefined,
  });
});

export const updateCardDef = createAsyncThunk('cardDef/update', async (cardDef: CardDef) => {
  await restClient.CardDefController.updateCardDef(cardDef);
});

export const deleteCardDef = createAsyncThunk('cardDef/delete', async (cardDef: CardDef) => {
  if (cardDef.id) {
    await restClient.CardDefController.deleteCardDef(cardDef.id);
  }
});





////////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
////////////////////////////////////////////////////////////////////////////////////////////////////

export const initCards = createAsyncThunk('card/init', async () => {
  return await restClient.CardController.getAllCards();
});

export const getCard = createAsyncThunk('card/create', async (id: number) => {
  return await restClient.CardController.getCard(id);
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


////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Contents
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCardContents = createAsyncThunk('cardcontent/getByCard', async (cardId: number) => {
  return await restClient.CardController.getContentVariantsOfCard(cardId);
});

export const updateCardContent = createAsyncThunk('cardcontent/update', async (cardContent: CardContent) => {
  return await restClient.CardContentController.updateCardContent(cardContent);
});

export const createCardContentVariant = createAsyncThunk('cardcontent/create', async (cardId: number) => {
  return await restClient.CardContentController.createNewCardContent(cardId);
});

