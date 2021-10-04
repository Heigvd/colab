/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractCardType,
  AbstractResource,
  AuthInfo,
  Block,
  BlockDocument,
  Card,
  CardContent,
  CardType,
  Change,
  ColabClient,
  Document,
  entityIs,
  HierarchicalPosition,
  InvolvementLevel,
  Project,
  Resource,
  ResourceRef,
  SignUpInfo,
  StickyNoteLink,
  TeamRole,
  User,
  WsSessionIdentifier,
} from 'colab-rest-client';
import { CreationScope, CreationScopeKind } from '../components/resources/ResourceCommonType';
import { hashPassword } from '../SecurityHelper';
import { addNotification } from '../store/notification';
import { ColabState, getStore } from '../store/store';

const restClient = ColabClient('', error => {
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

/**
 * For Admins: get all cardTypes
 * DEPRECATED!!!
 */
export const initCardTypes = createAsyncThunk('cardType/init', async () => {
  return await restClient.CardTypeRestEndpoint.getAllCardTypes();
});

/**
 * Get project own cardTypes:
 *  - defined by the project
 *    - list of CardType
 *  - defined by other projects but already referenced by the current project
 *    - CardTypeRef chain + CardType
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
 * Get all published type from all project accessible to the curent user plus global published ones
 */
export const getPublishedCardTypes = createAsyncThunk('cardType/getPublished', async () => {
  const getFromProjects = restClient.CardTypeRestEndpoint.getPublishedCardTypes();
  const getGlobals = restClient.CardTypeRestEndpoint.getPublishedGlobalsCardTypes();

  return [...(await getFromProjects), ...(await getGlobals)];
});

/**
 * Get all global cardTypes.
 * Admin only !
 */
export const getAllGlobalCardTypes = createAsyncThunk('cardType/getAllGlobals', async () => {
  return await restClient.CardTypeRestEndpoint.getAllGlobalCardTypes();
});

export const getCardType = createAsyncThunk<AbstractCardType, number>(
  'cardType/get',
  async (id: number) => {
    return await restClient.CardTypeRestEndpoint.getCardType(id);
  },
);

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

/**
 * @deprecated
 */
export const initCards = createAsyncThunk('card/init', async () => {
  return await restClient.CardRestEndpoint.getAllCards();
});

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
      const card = await restClient.CardRestEndpoint.createNewCard(parent.id, cardTypeId);
      const contents = await restClient.CardRestEndpoint.getContentVariantsOfCard(card.id!);

      const content = contents[0];
      if (content != null && content.id) {
        const doc: BlockDocument = {
          '@class': 'BlockDocument',
          title: '',
          teaser: '',
        };
        await restClient.CardContentRestEndpoint.assignDeliverable(content.id, doc);
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

export const createCardContentVariant = createAsyncThunk(
  'cardcontent/create',
  async (cardId: number) => {
    const content = await restClient.CardContentRestEndpoint.createNewCardContent(cardId);
    const doc: BlockDocument = {
      '@class': 'BlockDocument',
      title: '',
      teaser: '',
    };
    if (content.id != null) {
      await restClient.CardContentRestEndpoint.assignDeliverable(content.id, doc);
    }
    return content;
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
  async ({
    document,
    creationScope,
    category,
  }: {
    document: Document;
    creationScope: CreationScope;
    category?: string;
  }) => {
    // TODO add category -> createResourceForXxx(id, document, category)
    if (category) {
      //
    }

    if (creationScope.kind === CreationScopeKind.CardType) {
      if (creationScope.cardTypeId != null) {
        return await restClient.ResourceRestEndpoint.createResourceForAbstractCardType(
          creationScope.cardTypeId,
          document,
          /* category, */
        );
      }
    } else if (creationScope.kind === CreationScopeKind.Card) {
      if (creationScope.cardId != null) {
        return await restClient.ResourceRestEndpoint.createResourceForCard(
          creationScope.cardId,
          document,
          /* category, */
        );
      }
    } else if (creationScope.kind === CreationScopeKind.CardContent) {
      if (creationScope.cardContentId != null) {
        return await restClient.ResourceRestEndpoint.createResourceForCardContent(
          creationScope.cardContentId,
          document,
          /* category, */
        );
      }
    }

    // nothing good happened
    // TODO see how to say it
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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Documents
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getDocument = createAsyncThunk<Document, number>(
  'document/get',
  async (id: number) => {
    return await restClient.DocumentRestEndPoint.getDocument(id);
  },
);

export const updateDocument = createAsyncThunk('document/update', async (document: Document) => {
  return await restClient.DocumentRestEndPoint.updateDocument(document);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Blocks
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getDocumentBlocks = createAsyncThunk(
  'block/getFromDoc',
  async (document: BlockDocument) => {
    if (document.id) {
      return await restClient.DocumentRestEndPoint.getBlocksOfDocument(document.id);
    }
  },
);

export const createBlock = createAsyncThunk(
  'block/create',
  async (payload: { document: BlockDocument; block: Block }) => {
    return await restClient.BlockRestEndPoint.createBlock({
      ...payload.block,
      documentId: payload.document.id,
    });
  },
);

export const getBlock = createAsyncThunk('block/get', async (id: number) => {
  return await restClient.BlockRestEndPoint.getBlock(id);
});

export const getBlockPendingChanges = createAsyncThunk(
  'block/getPendingChanges',
  async (id: number) => {
    return await restClient.BlockRestEndPoint.getChanges(id);
  },
);

export const updateBlock = createAsyncThunk('block/update', async (block: Block) => {
  return await restClient.BlockRestEndPoint.updateBlock(block);
});

export const patchBlock = createAsyncThunk(
  'block/patch',
  async (payload: { id: number; change: Change }) => {
    return await restClient.BlockRestEndPoint.patchBlock(payload.id, payload.change);
  },
);

export const deletePendingChanges = createAsyncThunk('block/deleteChanges', async (id: number) => {
  return await restClient.BlockRestEndPoint.deletePendingChanges(id);
});

export const deleteBlock = createAsyncThunk('block/delete', async (block: Block) => {
  if (block.id != null) {
    return await restClient.BlockRestEndPoint.deleteBlock(block.id);
  }
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
  async (stickyNote: StickyNoteLink) => {
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
