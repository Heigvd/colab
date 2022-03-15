/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractResource,
  ActivityFlowLink,
  AuthInfo,
  Card,
  CardContent,
  CardTypeCreationBean,
  Change,
  ColabClient,
  Document,
  entityIs,
  HierarchicalPosition,
  HttpSession,
  InvolvementLevel,
  Project,
  Resource,
  ResourceCreationBean,
  ResourceRef,
  SignUpInfo,
  StickyNoteLink,
  StickyNoteLinkCreationBean,
  TeamMember,
  TeamRole,
  TextDataBlock,
  User,
  WsSessionIdentifier,
} from 'colab-rest-client';
import { PasswordScore } from '../components/common/Form/Form';
import { DocumentKind } from '../components/documents/documentCommonType';
import { hashPassword } from '../SecurityHelper';
import { addNotification } from '../store/notification';
import { ColabState, getStore } from '../store/store';
import { CardTypeAllInOne } from '../types/cardTypeDefinition';

const winPath = window.location.pathname;

/**
 * Get application path. With a leading / and no leading slash.
 * If application is deployed on ROOT, empty path is returned
 */
export const getApplicationPath = () => {
  return winPath.endsWith('/') ? winPath.substring(0, winPath.length - 1) : winPath;
};

const restClient = ColabClient(getApplicationPath(), error => {
  if (entityIs(error, 'HttpException')) {
    getStore().dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: error,
      }),
    );
  } else if (error instanceof Error) {
    getStore().dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: `${error.name}: ${error.message}`,
      }),
    );
  } else {
    getStore().dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: 'Something went wrong',
      }),
    );
  }
});

/**
 * First access to the API client.
 * Such direct allows direct calls to the API, bypassing thunk/redux action. It's not that normal.
 * to do such calls but may be usefull in some edge-cases whene using the redux state is useless.
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
      // an authenticated user shall reconnect to its own channel ASAP
      if (state.auth.currentUserId != null) {
        restClient.WebsocketRestEndpoint.subscribeToBroadcastChannel(payload);
        restClient.WebsocketRestEndpoint.subscribeToUserChannel(payload);
      }
    }
    return payload;
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration & Application Properties
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAccountConfig = createAsyncThunk('config/getAccountConfig', async () => {
  return await restClient.ConfigRestEndpoint.getAccountConfig();
});

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

export const getVersionDetails = createAsyncThunk('monitoring/getVersionDetails', async () => {
  return await restClient.MonitoringRestEndpoint.getVersion();
});

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
      passwordScore: PasswordScore;
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

export const getCurrentUserActiveSessions = createAsyncThunk('user/getSessions', async () => {
  return await restClient.UserRestEndpoint.getActiveSessions();
});

export const forceLogout = createAsyncThunk('user/forceLogout', async (session: HttpSession) => {
  return await restClient.UserRestEndpoint.forceLogout(session.id!);
});

export const updateLocalAccountPassword = createAsyncThunk(
  'user/updatePassword',
  async (a: { email: string; password: string; passwordScore: PasswordScore }) => {
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
      passwordScore: PasswordScore;
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
    thunkApi.dispatch(
      signInWithLocalAccount({
        identifier: a.email,
        password: a.password,
        passwordScore: a.passwordScore,
      }),
    );
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
        // reconnect to broadcast channel
        // subscribe to the new current user channel ASAP
        await restClient.WebsocketRestEndpoint.subscribeToBroadcastChannel({
          '@class': 'WsSessionIdentifier',
          sessionId: state.websockets.sessionId,
        });
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

export const getRootCardOfProject = createAsyncThunk<Card, number>(
  'project/getRootCard',
  async (projectId: number) => {
    return await restClient.ProjectRestEndpoint.getRootCardOfProject(projectId);
  },
);

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
      await thunkApi.dispatch(getRootCardOfProject(project.id));
    }
    return project;
  },
);

export const closeCurrentProject = createAsyncThunk(
  'project/stopEditing',
  async (_action: void, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (
      state.projects.editing != null &&
      state.websockets.sessionId &&
      state.auth.status === 'AUTHENTICATED'
    ) {
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
  const waitMembers = restClient.ProjectRestEndpoint.getMembers(projectId);
  const waitRoles = restClient.ProjectRestEndpoint.getRoles(projectId);

  return {
    members: await waitMembers,
    roles: await waitRoles,
  };
});

export const sendInvitation = createAsyncThunk(
  'project/team/invite',
  async (payload: { projectId: number; recipient: string }, thunkApi) => {
    if (payload.recipient) {
      await restClient.TeamRestEndpoint.inviteSomeone(payload.projectId, payload.recipient);
      thunkApi.dispatch(getProjectTeam(payload.projectId));
    }
  },
);

export const createRole = createAsyncThunk(
  'project/team/createRole',
  async (payload: { project: Project; role: TeamRole }) => {
    const r: TeamRole = { ...payload.role, projectId: payload.project.id };
    return await restClient.TeamRestEndpoint.createRole(r);
  },
);

export const updateRole = createAsyncThunk('project/role/update', async (role: TeamRole) => {
  return await restClient.TeamRestEndpoint.updateRole(role);
});

export const deleteRole = createAsyncThunk('project/role/delete', async (roleId: number) => {
  return await restClient.TeamRestEndpoint.deleteRole(roleId);
});

export const giveRole = createAsyncThunk(
  'project/team/give',
  async ({ roleId, memberId }: { roleId: number; memberId: number }) => {
    return await restClient.TeamRestEndpoint.giveRoleTo(roleId, memberId);
  },
);

export const removeRole = createAsyncThunk(
  'project/team/remove',
  async ({ roleId, memberId }: { roleId: number; memberId: number }) => {
    return await restClient.TeamRestEndpoint.removeRoleFrom(roleId, memberId);
  },
);

export const updateMember = createAsyncThunk(
  'project/member/update',
  async (member: TeamMember) => {
    await restClient.TeamRestEndpoint.updateTeamMember(member);
  },
);

export const setMemberPosition = createAsyncThunk(
  'project/member/position',
  async ({ memberId, position }: { memberId: number; position: HierarchicalPosition }) => {
    await restClient.TeamRestEndpoint.changeMemberPosition(memberId, position);
  },
);

export const setMemberInvolvement = createAsyncThunk(
  'project/member/involvement',
  async ({
    memberId,
    involvement,
    cardId,
  }: {
    memberId: number;
    involvement: InvolvementLevel;
    cardId: number;
  }) => {
    await restClient.TeamRestEndpoint.setMemberInvolvement(cardId, memberId, involvement);
  },
);

export const clearMemberInvolvement = createAsyncThunk(
  'project/role/clearInvolvement',
  async ({ memberId, cardId }: { memberId: number; cardId: number }) => {
    await restClient.TeamRestEndpoint.clearMemberInvolvement(cardId, memberId);
  },
);

export const setRoleInvolvement = createAsyncThunk(
  'project/role/involvement',
  async ({
    roleId,
    involvement,
    cardId,
  }: {
    roleId: number;
    involvement: InvolvementLevel;
    cardId: number;
  }) => {
    await restClient.TeamRestEndpoint.setRoleInvolvement(cardId, roleId, involvement);
  },
);

export const clearRoleInvolvement = createAsyncThunk(
  'project/role/clearInvolvement',
  async ({ roleId, cardId }: { roleId: number; cardId: number }) => {
    await restClient.TeamRestEndpoint.clearRoleInvolvement(cardId, roleId);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Types
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getExpandedCardType = createAsyncThunk('cardType/getExpanded', async (id: number) => {
  return await restClient.CardTypeRestEndpoint.getExpandedCardType(id);
});

/**
 * Get project own abstract card types:
 *  - defined specifically for the project
 *    - CardType
 *  - defined by other projects and referenced by the current project
 *    - every link in the chain of CardTypeRef + target CardType
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
 * Get all published card types from all projects accessible to the current user
 * + all global published card types
 */
export const getAvailablePublishedCardTypes = createAsyncThunk(
  'cardType/getPublished',
  async () => {
    const getFromProjects =
      restClient.CardTypeRestEndpoint.getPublishedCardTypesOfReachableProjects();
    const getGlobals = restClient.CardTypeRestEndpoint.getPublishedGlobalsCardTypes();

    return [...(await getFromProjects), ...(await getGlobals)];
  },
);

export const createCardType = createAsyncThunk(
  'cardType/create',
  async (cardType: CardTypeCreationBean) => {
    return await restClient.CardTypeRestEndpoint.createCardType(cardType);
  },
);

export const updateCardTypeTitle = createAsyncThunk(
  'cardType/update',
  async ({ cardTypeId, title }: CardTypeAllInOne, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (cardTypeId) {
      const cardTypeServerSide = state.cardType.cardtypes[cardTypeId];
      if (entityIs(cardTypeServerSide, 'CardType')) {
        await restClient.CardTypeRestEndpoint.updateCardType({
          ...cardTypeServerSide,
          title: title,
        });
      }
    }
    // see if we can throw an error
  },
);

export const updateCardTypeTags = createAsyncThunk(
  'cardType/update',
  async ({ cardTypeId, tags }: CardTypeAllInOne, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (cardTypeId) {
      const cardTypeServerSide = state.cardType.cardtypes[cardTypeId];
      if (entityIs(cardTypeServerSide, 'CardType')) {
        await restClient.CardTypeRestEndpoint.updateCardType({
          ...cardTypeServerSide,
          tags: tags,
        });
      }
    }
    // see if we can throw an error
  },
);

export const updateCardTypeDeprecated = createAsyncThunk(
  'cardType/update',
  async ({ ownId, deprecated }: CardTypeAllInOne, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (ownId) {
      const cardTypeServerSide = state.cardType.cardtypes[ownId];
      if (entityIs(cardTypeServerSide, 'AbstractCardType')) {
        await restClient.CardTypeRestEndpoint.updateCardType({
          ...cardTypeServerSide,
          deprecated: deprecated,
        });
      }
    }
    // see if we can throw an error
  },
);

export const updateCardTypePublished = createAsyncThunk(
  'cardType/update',
  async ({ ownId, published }: CardTypeAllInOne, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (ownId) {
      const cardTypeServerSide = state.cardType.cardtypes[ownId];
      if (entityIs(cardTypeServerSide, 'AbstractCardType')) {
        await restClient.CardTypeRestEndpoint.updateCardType({
          ...cardTypeServerSide,
          published: published,
        });
      }
    }
    // see if we can throw an error
  },
);

/**
 * Use the card type in the project. Concretely that means make a card type reference.
 */
export const addCardTypeToProject = createAsyncThunk(
  'cardType/addToProject',
  async ({ cardType, project }: { cardType: CardTypeAllInOne; project: Project }) => {
    if (cardType.ownId && project.id)
      return await restClient.CardTypeRestEndpoint.useCardTypeInProject(cardType.ownId, project.id);
  },
);

// export const deleteCardType = createAsyncThunk('cardType/delete', async (cardType: CardType) => {
//   if (cardType.id) {
//     await restClient.CardTypeRestEndpoint.deleteCardType(cardType.id);
//   }
// });

// TODO sandra in progress : sharpened use of delete vs remove from project

/**
 * Remove the card type from the project. Can be done only if not used.
 */
export const removeCardTypeFromProject = createAsyncThunk(
  'cardType/removeFromProject',
  async ({ cardType, project }: { cardType: CardTypeAllInOne; project: Project }) => {
    if (cardType.ownId && project.id) {
      return await restClient.CardTypeRestEndpoint.removeCardTypeFromProject(
        cardType.ownId,
        project.id,
      );
    }
  },
);

/**
 * Get all global cardTypes.
 * Admin only !
 */
export const getAllGlobalCardTypes = createAsyncThunk('cardType/getAllGlobals', async () => {
  return await restClient.CardTypeRestEndpoint.getAllGlobalCardTypes();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCard = createAsyncThunk('card/get', async (id: number) => {
  return await restClient.CardRestEndpoint.getCard(id);
});

export const getAllProjectCards = createAsyncThunk(
  'card/getAllProjectCards',
  async (id: number) => {
    return await restClient.ProjectRestEndpoint.getCardsOfProject(id);
  },
);

export const getAllProjectCardContents = createAsyncThunk(
  'card/getAllProjectCardContents',
  async (id: number) => {
    return await restClient.ProjectRestEndpoint.getCardContentsOfProject(id);
  },
);

export const createSubCardWithTextDataBlock = createAsyncThunk(
  'card/createSubCard',
  async ({ parent, cardTypeId }: { parent: CardContent; cardTypeId: number | null }) => {
    if (parent.id != null) {
      const firstDeliverable: TextDataBlock = {
        '@class': 'TextDataBlock',
        mimeType: 'text/markdown',
        revision: '0',
      };

      if (cardTypeId != null) {
        return await restClient.CardRestEndpoint.createNewCardWithDeliverable(
          parent.id,
          cardTypeId,
          firstDeliverable,
        );
      } else {
        return await restClient.CardRestEndpoint.createNewCardWithDeliverableWithoutType(
          parent.id,
          firstDeliverable,
        );
      }
    }
  },
);

export const updateCard = createAsyncThunk('card/update', async (card: Card) => {
  await restClient.CardRestEndpoint.updateCard(card);
});

export const moveCard = createAsyncThunk(
  'card/move',
  async ({ cardId, newParentId }: { cardId: number; newParentId: number }) => {
    await restClient.CardRestEndpoint.moveCard(cardId, newParentId);
  },
);

export const deleteCard = createAsyncThunk('card/delete', async (card: Card) => {
  if (card.id) {
    await restClient.CardRestEndpoint.deleteCard(card.id);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Access Control List
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getACL = createAsyncThunk('acl/get', async (cardId: number) => {
  return await restClient.CardRestEndpoint.getAcls(cardId);
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

export const createCardContentVariantWithBlockDoc = createAsyncThunk(
  'cardcontent/create',
  async (cardId: number) => {
    const doc: TextDataBlock = {
      '@class': 'TextDataBlock',
      mimeType: 'text/markdown',
      revision: '0',
    };
    return await restClient.CardContentRestEndpoint.createNewCardContentWithDeliverable(
      cardId,
      doc,
    );
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

export const getDeliverablesOfCardContent = createAsyncThunk(
  'cardcontent/getDeliverables',
  async (cardContentId: number) => {
    return await restClient.CardContentRestEndpoint.getDeliverablesOfCardContent(cardContentId);
  },
);

export const addDeliverable = createAsyncThunk(
  'cardcontent/addDeliverable',
  async ({ cardContentId, docKind }: { cardContentId: number; docKind: DocumentKind }) => {
    const deliverable = makeNewDocument(docKind);
    return await restClient.CardContentRestEndpoint.addDeliverable(cardContentId, deliverable);
  },
);

export const removeDeliverable = createAsyncThunk(
  'cardcontent/removeDeliverable',
  async ({ cardContentId, documentId }: { cardContentId: number; documentId: number }) => {
    return await restClient.CardContentRestEndpoint.removeDeliverable(cardContentId, documentId);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Resources
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAbstractResource = createAsyncThunk<AbstractResource, number>(
  'resource/getAbstractResource',
  async (id: number) => {
    return await restClient.ResourceRestEndpoint.getAbstractResource(id);
  },
);

export const getResourceChainForAbstractCardTypeId = createAsyncThunk(
  'resource/getForCardTypeId',
  async (cardTypeId: number) => {
    return await restClient.ResourceRestEndpoint.getResourceChainForAbstractCardType(cardTypeId);
  },
);

export const getResourceChainForCardContentId = createAsyncThunk(
  'resource/getForCardContentId',
  async (cardContentId: number) => {
    return await restClient.ResourceRestEndpoint.getResourceChainForCardContent(cardContentId);
  },
);

export const updateResource = createAsyncThunk(
  'resource/updateResource',
  async (resource: Resource) => {
    return await restClient.ResourceRestEndpoint.updateResource(resource);
  },
);

export const updateResourceRef = createAsyncThunk(
  'resource/updateResourceRef',
  async (resourceRef: ResourceRef) => {
    return await restClient.ResourceRestEndpoint.updateResourceRef(resourceRef);
  },
);

export const createResource = createAsyncThunk(
  'resource/create',
  async (resource: ResourceCreationBean) => {
    return await restClient.ResourceRestEndpoint.createResource(resource);
  },
);

export const deleteResource = createAsyncThunk('resource/delete', async (resource: Resource) => {
  if (resource.id) {
    return await restClient.ResourceRestEndpoint.deleteResource(resource.id);
  }
});

export const removeAccessToResource = createAsyncThunk(
  'resourceOrRef/refuse',
  async (resourceRef: ResourceRef) => {
    if (resourceRef) {
      return await restClient.ResourceRestEndpoint.updateResourceRef({
        ...resourceRef,
        refused: true,
      });
    }
  },
);

export const getDocumentsOfResource = createAsyncThunk(
  'resource/getDocuments',
  async (resourceId: number) => {
    return await restClient.ResourceRestEndpoint.getDocumentsOfResource(resourceId);
  },
);

export const addDocumentToResource = createAsyncThunk(
  'resource/addDocument',
  async ({ resourceId, docKind }: { resourceId: number; docKind: DocumentKind }) => {
    const document = makeNewDocument(docKind);
    return await restClient.ResourceRestEndpoint.addDocument(resourceId, document);
  },
);

export const removeDocumentOfResource = createAsyncThunk(
  'resource/removeDocument',
  async ({ resourceId, documentId }: { resourceId: number; documentId: number }) => {
    return await restClient.ResourceRestEndpoint.removeDocument(resourceId, documentId);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Documents
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getDocument = createAsyncThunk<Document, number>(
  'document/get',
  async (id: number) => {
    return await restClient.DocumentRestEndpoint.getDocument(id);
  },
);

export const updateDocument = createAsyncThunk('document/update', async (document: Document) => {
  return await restClient.DocumentRestEndpoint.updateDocument(document);
});

export const updateDocumentText = createAsyncThunk(
  'document/updateText',
  async ({ id, textData }: { id: number; textData: string }, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (id) {
      const docServerSide = state.document.documents[id];
      if (entityIs(docServerSide, 'TextDataBlock')) {
        await restClient.DocumentRestEndpoint.updateDocument({
          ...docServerSide,
          textData: textData,
        });
      }
    }
    // see if we can throw an error
  },
);

export const moveDocumentUp = createAsyncThunk('document/moveUp', async (docId: number) => {
  return await restClient.DocumentRestEndpoint.moveDocumentUp(docId);
});

export const moveDocumentDown = createAsyncThunk('document/moveDown', async (docId: number) => {
  return await restClient.DocumentRestEndpoint.moveDocumentDown(docId);
});

function makeNewDocument(docKind: DocumentKind) {
  let document = null;
  if (docKind == 'DocumentFile') {
    document = {
      '@class': docKind,
      fileSize: 0,
      mimeType: 'application/octet-stream',
    };
  } else if (docKind == 'TextDataBlock') {
    document = {
      '@class': docKind,
      mimeType: 'text/markdown',
      revision: '0',
    };
  } else {
    document = {
      '@class': docKind,
    };
  }

  return document;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Blocks
////////////////////////////////////////////////////////////////////////////////////////////////////

export const subscribeToBlockChannel = createAsyncThunk(
  'block/subscribe',
  async (id: number, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    const sessionId = state.websockets.sessionId;

    if (sessionId) {
      await restClient.WebsocketRestEndpoint.subscribeToBlockChannel(id, {
        '@class': 'WsSessionIdentifier',
        sessionId: sessionId,
      });
    }
  },
);

export const unsubscribeFromBlockChannel = createAsyncThunk(
  'block/unsubscribe',
  async (id: number, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    const sessionId = state.websockets.sessionId;

    if (sessionId && state.auth.status === 'AUTHENTICATED') {
      await restClient.WebsocketRestEndpoint.unsubscribeFromBlockChannel(id, {
        '@class': 'WsSessionIdentifier',
        sessionId: sessionId,
      });
    }
  },
);

export const getBlockPendingChanges = createAsyncThunk(
  'block/getPendingChanges',
  async (id: number) => {
    return await restClient.ChangeRestEndpoint.getChanges(id);
  },
);

export const patchBlock = createAsyncThunk(
  'block/patch',
  async (payload: { id: number; change: Change }) => {
    return await restClient.ChangeRestEndpoint.patchBlock(payload.id, payload.change);
  },
);

export const deletePendingChanges = createAsyncThunk('block/deleteChanges', async (id: number) => {
  return await restClient.ChangeRestEndpoint.deletePendingChanges(id);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sticky Note Links
////////////////////////////////////////////////////////////////////////////////////////////////////

//export const getStickyNoteLink = createAsyncThunk('stickyNoteLinks/get', async (id: number) => {
//  return await restClient.StickyNoteLinkRestEndpoint.getLink(id);
//});

// TODO see if it belongs to stickyNoteLinks or to cards. Make your choice !
export const getStickyNoteLinkAsDest = createAsyncThunk(
  'stickyNoteLinks/getAsDest',
  async (cardId: number) => {
    return await restClient.CardRestEndpoint.getStickyNoteLinksAsDest(cardId);
  },
);

export const createStickyNote = createAsyncThunk(
  'stickyNoteLinks/create',
  async (stickyNote: StickyNoteLinkCreationBean) => {
    return await restClient.StickyNoteLinkRestEndpoint.createLink(stickyNote);
  },
);

export const updateStickyNote = createAsyncThunk(
  'stickyNoteLinks/update',
  async (stickyNote: StickyNoteLink) => {
    return await restClient.StickyNoteLinkRestEndpoint.updateLink(stickyNote);
  },
);

export const deleteStickyNote = createAsyncThunk(
  'stickyNoteLinks/delete',
  async (stickyNote: StickyNoteLink) => {
    if (stickyNote.id != null) {
      return await restClient.StickyNoteLinkRestEndpoint.deleteLink(stickyNote.id);
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Activity-Flow Links
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAllActivityFlowLinks = createAsyncThunk(
  'activityFlow/getAll',
  async (projectId: number) => {
    return await restClient.ProjectRestEndpoint.getActivityFlowLinks(projectId);
  },
);

export const getActivityFlowLinkFromCard = createAsyncThunk(
  'activityFlow/getFromCard',
  async (cardId: number) => {
    return await restClient.CardRestEndpoint.getActivityFlowLinksAsPrevious(cardId);
  },
);

export const getActivityFlowLinkToCard = createAsyncThunk(
  'activityFlow/getToCard',
  async (cardId: number) => {
    return await restClient.CardRestEndpoint.getActivityFlowLinksAsNext(cardId);
  },
);

export const createActivityFlowLink = createAsyncThunk(
  'activityFlow/create',
  async ({ previousId, nextId }: { previousId: number; nextId: number }) => {
    const link: ActivityFlowLink = {
      '@class': 'ActivityFlowLink',
      previousCardId: previousId,
      nextCardId: nextId,
    };
    return await restClient.ActivityFlowLinkRestEndpoint.createLink(link);
  },
);

export const changeActivityFlowLinkPreviousCard = createAsyncThunk(
  'activityFlow/changePrevCard',
  async ({ linkId, cardId }: { linkId: number; cardId: number }) => {
    return await restClient.ActivityFlowLinkRestEndpoint.changePreviousCard(linkId, cardId);
  },
);

export const changeActivityFlowLinkNextCard = createAsyncThunk(
  'activityFlow/changeNextCard',
  async ({ linkId, cardId }: { linkId: number; cardId: number }) => {
    return await restClient.ActivityFlowLinkRestEndpoint.changeNextCard(linkId, cardId);
  },
);

export const deleteActivityFlowLink = createAsyncThunk(
  'activityFlow/delete',
  async (id: number) => {
    return await restClient.ActivityFlowLinkRestEndpoint.deleteLink(id);
  },
);

/////////////////////////////////////////////////////////////////////////////
// Document Files
/////////////////////////////////////////////////////////////////////////////

export const uploadFile = createAsyncThunk(
  'files',
  async ({ docId, file, fileSize }: { docId: number; file: File; fileSize: number }) => {
    return await restClient.DocumentFileRestEndPoint.updateFile(docId, fileSize, file);
  },
);

// export const getFile = createAsyncThunk('files/GetFile', async (id: number) => {
//   return await restClient.DocumentFileRestEndPoint.getFileContent(id);
// });

// export const deleteFile = createAsyncThunk('files/DeleteFile', async (id: number) => {
//   return await restClient.DocumentFileRestEndPoint.deleteFile(id);
// });

/////////////////////////////////////////////////////////////////////////////
// External Data API
/////////////////////////////////////////////////////////////////////////////

export const getUrlMetadata = createAsyncThunk(
  'exernalData/getUrlMetadata',
  async (url: string) => {
    return await restClient.ExternalDataRestEndpoint.getUrlMetadata(url);
  },
);

export const refreshUrlMetadata = createAsyncThunk(
  'exernalData/refreshUrlMetadata',
  async (url: string) => {
    return await restClient.ExternalDataRestEndpoint.getRefreshedUrlMetadata(url);
  },
);
