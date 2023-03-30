/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AbstractCardType,
  AbstractResource,
  AccountConfig,
  ActivityFlowLink,
  Assignment,
  AuthInfo,
  BlockMonitoring,
  Card,
  CardContent,
  CardTypeCreationData,
  Change,
  ColabClient,
  CopyParam,
  Document,
  DuplicationParam,
  entityIs,
  ErrorHandler,
  GridPosition,
  HierarchicalPosition,
  HttpSession,
  InvolvementLevel,
  Project,
  ProjectCreationData,
  ProjectStructure,
  Resource,
  ResourceCreationData,
  ResourceRef,
  SignUpInfo,
  StickyNoteLink,
  StickyNoteLinkCreationData,
  TeamMember,
  TeamRole,
  TextDataBlock,
  TouchUserPresence,
  User,
  UserPresence,
  VersionDetails,
  WsSessionIdentifier,
} from 'colab-rest-client';
import { PasswordScore } from '../components/common/element/Form';
import { DocumentKind } from '../components/documents/documentCommonType';
import { ResourceAndRef } from '../components/resources/resourcesCommonType';
import { hashPassword } from '../SecurityHelper';
import { selectCurrentProjectId } from '../store/selectors/projectSelector';
import { addNotification } from '../store/slice/notificationSlice';
import { ColabState, store } from '../store/store';
import { CardTypeAllInOne, CardTypeOnOneSOwn, CardTypeWithRef } from '../types/cardTypeDefinition';

const winPath = window.location.pathname;

/**
 * Get application path. With a leading / and no leading slash.
 * If application is deployed on ROOT, empty path is returned
 */
export const getApplicationPath = () => {
  return winPath.endsWith('/') ? winPath.substring(0, winPath.length - 1) : winPath;
};

const restClient = ColabClient(getApplicationPath(), error => {
  // TODO see how it could be auto generated as everything that is handled by ColabNotification.message
  if (entityIs(error, 'HttpException') || typeof error === 'string') {
    store.dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: error,
      }),
    );
  } else if (error instanceof Error) {
    store.dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: `${error.name}: ${error.message}`,
      }),
    );
  } else {
    store.dispatch(
      addNotification({
        status: 'OPEN',
        type: 'ERROR',
        message: null,
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

export const getAccountConfig = createAsyncThunk<AccountConfig, void>(
  'config/getAccountConfig',
  async () => {
    return await restClient.ConfigRestEndpoint.getAccountConfig();
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

export const getVersionDetails = createAsyncThunk<VersionDetails, void>(
  'monitoring/getVersionDetails',
  async () => {
    return await restClient.MonitoringRestEndpoint.getVersion();
  },
);

export const getLiveMonitoringData = createAsyncThunk<BlockMonitoring[], void>(
  'monitoring/getLive',
  async () => {
    return await restClient.ChangeRestEndpoint.getMonitoringData();
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Authentication
////////////////////////////////////////////////////////////////////////////////////////////////////

export const signInWithLocalAccount = createAsyncThunk(
  'auth/signInLocalAccount',
  async (
    {
      identifier,
      password /*, passwordScore*/,
      errorHandler,
    }: {
      identifier: string;
      password: string;
      passwordScore: PasswordScore;
      errorHandler?: ErrorHandler;
    },
    thunkApi,
  ) => {
    // first, fetch an authentication method
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(identifier);

    const authInfo: AuthInfo = {
      '@class': 'AuthInfo',
      identifier,
      mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password),
    };

    await restClient.UserRestEndpoint.signIn(authInfo, errorHandler);

    thunkApi.dispatch(reloadCurrentUser());
  },
);

export const signUp = createAsyncThunk(
  'auth/signup',
  async (
    {
      username,
      email,
      password,
      passwordScore,
      errorHandler,
    }: {
      username: string;
      email: string;
      password: string;
      passwordScore: PasswordScore;
      errorHandler?: ErrorHandler;
    },
    thunkApi,
  ) => {
    // first, fetch an authentication method
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(email);

    const signUpInfo: SignUpInfo = {
      '@class': 'SignUpInfo',
      email,
      username,
      hashMethod: authMethod.mandatoryMethod,
      salt: authMethod.salt,
      hash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password),
    };

    await restClient.UserRestEndpoint.signUp(signUpInfo, errorHandler);

    // go back to sign in page
    thunkApi.dispatch(
      signInWithLocalAccount({
        identifier: email,
        password,
        passwordScore,
      }),
    );
  },
);

export const requestPasswordReset = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    await restClient.UserRestEndpoint.requestPasswordReset(email);
  },
);

export const signOut = createAsyncThunk('auth/signout', async () => {
  return await restClient.UserRestEndpoint.signOut();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Users
////////////////////////////////////////////////////////////////////////////////////////////////////

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

export const updateLocalAccountPassword = createAsyncThunk(
  'user/updatePassword',
  async ({
    email,
    password,
  }: {
    email: string;
    password: string;
    passwordScore: PasswordScore;
  }) => {
    // first, fetch the authenatication method fot the account
    const authMethod = await restClient.UserRestEndpoint.getAuthMethod(email);

    if (entityIs(authMethod, 'AuthMethod')) {
      const authInfo: AuthInfo = {
        '@class': 'AuthInfo',
        identifier: email,
        mandatoryHash: await hashPassword(authMethod.mandatoryMethod, authMethod.salt, password),
      };

      await restClient.UserRestEndpoint.updateLocalAccountPassword(authInfo);
    }
  },
);

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

export const getCurrentUserActiveSessions = createAsyncThunk<HttpSession[], void>(
  'user/getSessions',
  async () => {
    return await restClient.UserRestEndpoint.getActiveSessions();
  },
);

export const updateUser = createAsyncThunk('user/update', async (user: User) => {
  await restClient.UserRestEndpoint.updateUser(user);
  return user;
});

export const getUser = createAsyncThunk<User | null, number>('user/get', async (id: number) => {
  if (id > 0) {
    return await restClient.UserRestEndpoint.getUserById(id);
  } else {
    return null;
  }
});

export const getAllUsers = createAsyncThunk<User[], void>('user/getAll', async () => {
  return await restClient.UserRestEndpoint.getAllUsers();
});

export const getUsersForProject = createAsyncThunk<User[] | null, number | null>(
  'project/getUsers',
  async (projectId: number | null) => {
    if (projectId) {
      return await restClient.UserRestEndpoint.getUsersForProject(projectId);
    } else {
      return null;
    }
  },
);

export const forceLogout = createAsyncThunk('user/forceLogout', async (session: HttpSession) => {
  return await restClient.UserRestEndpoint.forceLogout(session.id!);
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Projects
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getProject = createAsyncThunk<Project | null, number>(
  'project/get',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ProjectRestEndpoint.getProject(id);
    } else {
      return null;
    }
  },
);

export const getMyProjects = createAsyncThunk<Project[], void>('project/list', async () => {
  return await restClient.ProjectRestEndpoint.getProjectsWhereTeamMember();
});

export const getInstanceableModels = createAsyncThunk<Project[], void>(
  'project/baseModels',
  async () => {
    return await restClient.ProjectRestEndpoint.getInstanceableModels();
  },
);

export const getAllProjectsAndModels = createAsyncThunk<Project[], void>(
  'project/all',
  async () => {
    return await restClient.ProjectRestEndpoint.getAllProjects();
  },
);

export const getAllGlobalProjects = createAsyncThunk<Project[], void>(
  'project/allGlobal',
  async () => {
    return await restClient.ProjectRestEndpoint.getAllGlobalModels();
  },
);

export const createProject = createAsyncThunk(
  'project/create',
  async (creationData: ProjectCreationData) => {
    return await restClient.ProjectRestEndpoint.createProject(creationData);
  },
);

export const duplicateProject = createAsyncThunk(
  'project/duplicate',
  async ({ project, newName }: { project: Project; newName: string }) => {
    if (project.id) {
      const parameters: DuplicationParam = {
        '@class': 'DuplicationParam',
        withRoles: true,
        withTeamMembers: false,
        withCardTypes: true,
        withCardsStructure: true,
        withDeliverables: true,
        withResources: true,
        withStickyNotes: true,
        withActivityFlow: true,
        makeOnlyCardTypeReferences: false,
        resetProgressionData: false,
      };

      return await restClient.ProjectRestEndpoint.duplicateProject(project.id, newName, parameters);
    }
  },
);

export const updateProject = createAsyncThunk('project/update', async (project: Project) => {
  await restClient.ProjectRestEndpoint.updateProject(project);
});

export const deleteProject = createAsyncThunk('project/delete', async (project: Project) => {
  if (project.id) {
    await restClient.ProjectRestEndpoint.deleteProject(project.id);
  }
});

export const getRootCardOfProject = createAsyncThunk<Card | null, number>(
  'project/getRootCard',
  async (projectId: number) => {
    if (projectId > 0) {
      return await restClient.ProjectRestEndpoint.getRootCardOfProject(projectId);
    } else {
      return null;
    }
  },
);

export const reconnectToProjectChannel = createAsyncThunk(
  'project/reconnect',
  async (project: Project, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    if (state.websockets.sessionId != null && project.id != null) {
      // Subscribe to new project channel
      await restClient.WebsocketRestEndpoint.subscribeToProjectChannel(project.id, {
        '@class': 'WsSessionIdentifier',
        sessionId: state.websockets.sessionId,
      });

      // initialized project content
      //await thunkApi.dispatch(getRootCardOfProject(project.id)); // LAZY
      await thunkApi.dispatch(getProjectStructure(project.id)); // GREEDY
    }
    return project;
  },
);

// TODO Sandra 01.2023 : review wisely
export const startProjectEdition = createAsyncThunk(
  'project/startEditing',
  async (project: Project, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    const currentSessionId = state.websockets.sessionId;
    const currentProjectId = selectCurrentProjectId(state);

    if (currentSessionId != null && project.id != null) {
      if (currentProjectId != null) {
        // close current project if there is one
        await thunkApi.dispatch(closeCurrentProject());
      }

      // Subscribe to new project channel
      await restClient.WebsocketRestEndpoint.subscribeToProjectChannel(project.id, {
        '@class': 'WsSessionIdentifier',
        sessionId: currentSessionId,
      });

      // initialized project content
      //await thunkApi.dispatch(getRootCardOfProject(project.id)); // LAZY
      await thunkApi.dispatch(getProjectStructure(project.id)); // GREEDY
    }
    return project;
  },
);

// TODO Sandra 01.2023 : review wisely
export const closeCurrentProject = createAsyncThunk(
  'project/stopEditing',
  async (_action: void, thunkApi) => {
    const state = thunkApi.getState() as ColabState;
    const currentSessionId = state.websockets.sessionId;
    const authStatus = state.auth.status;
    const currentProjectId = selectCurrentProjectId(state);

    if (currentProjectId != null && currentSessionId && authStatus === 'AUTHENTICATED') {
      restClient.WebsocketRestEndpoint.unsubscribeFromProjectChannel(currentProjectId, {
        '@class': 'WsSessionIdentifier',
        sessionId: currentSessionId,
      });
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Project model
////////////////////////////////////////////////////////////////////////////////////////////////////

export const shareModel = createAsyncThunk(
  'model/share',
  async (payload: { projectId: number; recipient: string }) => {
    if (payload.recipient) {
      await restClient.ProjectRestEndpoint.shareModel(payload.projectId, payload.recipient);
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Project copy param
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCopyParam = createAsyncThunk<CopyParam | null, number>(
  'copyParam/get',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ProjectRestEndpoint.getCopyParam(id);
    } else {
      return null;
    }
  },
);

export const updateCopyParam = createAsyncThunk(
  'copyParam/update',
  async (copyParam: CopyParam) => {
    await restClient.ProjectRestEndpoint.updateCopyParam(copyParam);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Project team
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getProjectTeam = createAsyncThunk<
  { members: TeamMember[]; roles: TeamRole[] } | null,
  number
>('project/team/get', async (projectId: number) => {
  if (projectId > 0) {
    const waitMembers = restClient.TeamRestEndpoint.getTeamMembersForProject(projectId);
    const waitRoles = restClient.TeamRestEndpoint.getTeamRolesForProject(projectId);

    return {
      members: await waitMembers,
      roles: await waitRoles,
    };
  } else {
    return null;
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Team member
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getTeamMembersForProject = createAsyncThunk<
  TeamMember[] | null,
  number | null | undefined
>('team/project/getMembers', async (projectId: number | null | undefined) => {
  if (projectId) {
    return await restClient.TeamRestEndpoint.getTeamMembersForProject(projectId);
  } else {
    return null;
  }
});

export const updateMember = createAsyncThunk(
  'project/member/update',
  async (member: TeamMember) => {
    await restClient.TeamRestEndpoint.updateTeamMember(member);
  },
);

export const deleteMember = createAsyncThunk(
  'project/member/delete',
  async (member: TeamMember) => {
    if (member && member.id) {
      await restClient.TeamRestEndpoint.deleteTeamMember(member.id);
    }
  },
);

export const setMemberPosition = createAsyncThunk(
  'project/member/position',
  async ({ memberId, position }: { memberId: number; position: HierarchicalPosition }) => {
    await restClient.TeamRestEndpoint.changeMemberPosition(memberId, position);
  },
);

export const sendInvitation = createAsyncThunk(
  'project/team/invite',
  async (payload: { projectId: number; recipient: string }, thunkApi) => {
    if (payload.recipient) {
      await restClient.TeamRestEndpoint.inviteSomeone(payload.projectId, payload.recipient);
      thunkApi.dispatch(getProjectTeam(payload.projectId));
    }
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Team role
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getTeamRolesForProject = createAsyncThunk<
  TeamRole[] | null,
  number | null | undefined
>('project/getTeamRoles', async (projectId: number | null | undefined) => {
  if (projectId) {
    return await restClient.TeamRestEndpoint.getTeamRolesForProject(projectId);
  } else {
    return null;
  }
});

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// Assignments
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getAssignmentsForProject = createAsyncThunk<
  Assignment[] | null,
  number | null | undefined
>('assignments/byproject', async (projectId: number | null | undefined) => {
  if (projectId) {
    return await restClient.TeamRestEndpoint.getAssignmentsForProject(projectId);
  } else {
    return null;
  }
});

export const getAssignmentsForCard = createAsyncThunk<
  Assignment[] | null,
  number | null | undefined
>('assignments/bycard', async (cardId: number | null | undefined) => {
  if (cardId) {
    return await restClient.TeamRestEndpoint.getAssignmentsForCard(cardId);
  } else {
    return null;
  }
});

export const createAssignment = createAsyncThunk(
  'assignment/add',
  async ({ cardId, memberId }: { cardId: number; memberId: number }) => {
    await restClient.TeamRestEndpoint.createEmptyAssignment(cardId, memberId);
  },
);

export const setAssignment = createAsyncThunk(
  'assignment/set',
  async ({
    cardId,
    memberId,
    involvementLevel,
  }: {
    cardId: number;
    memberId: number;
    involvementLevel: InvolvementLevel;
  }) => {
    await restClient.TeamRestEndpoint.setAssignment(cardId, memberId, involvementLevel);
  },
);

export const removeAssignmentLevel = createAsyncThunk(
  'assignment/remove',
  async ({ cardId, memberId }: { cardId: number; memberId: number }) => {
    await restClient.TeamRestEndpoint.removeAssignmentLevel(cardId, memberId);
  },
);

export const deleteAssignments = createAsyncThunk(
  'assignment/delete',
  async ({ cardId, memberId }: { cardId: number; memberId: number }) => {
    await restClient.TeamRestEndpoint.deleteAssignments(cardId, memberId);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Presence
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getPresenceList = createAsyncThunk<UserPresence[], number>(
  'presence/getList',
  async (projectId: number) => {
    if (projectId > 0) {
      return await restClient.PresenceRestEndpoint.getProjectPresence(projectId);
    } else {
      return [];
    }
  },
);

export const makePresenceKnown = createAsyncThunk(
  'presence/touch',
  async (presence: TouchUserPresence) => {
    return await restClient.PresenceRestEndpoint.updateUserPresence(presence);
  },
);

export const clearPresenceList = createAsyncThunk('presence/clear', async (projectId: number) => {
  return await restClient.PresenceRestEndpoint.clearProjectPresenceList(projectId);
});

export const clearAllPresenceLists = createAsyncThunk('presence/clearAll', async () => {
  return await restClient.PresenceRestEndpoint.clearAllPresenceList();
});

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Types
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getExpandedCardType = createAsyncThunk<AbstractCardType[], number>(
  'cardType/getExpanded',
  async (id: number) => {
    if (id > 0) {
      return await restClient.CardTypeRestEndpoint.getExpandedCardType(id);
    } else {
      return [];
    }
  },
);

/**
 * Get project own abstract card types:
 *  - defined specifically for the project
 *    - CardType
 *  - defined by other projects and referenced by the current project
 *    - every link in the chain of CardTypeRef + target CardType
 */
export const getProjectCardTypes = createAsyncThunk<AbstractCardType[], number>(
  'cardType/getProjectOnes',
  async (projectId: number) => {
    if (projectId > 0) {
      return await restClient.ProjectRestEndpoint.getCardTypesOfProject(projectId);
    } else {
      return [];
    }
  },
);

/**
 * Get all published card types from all projects accessible to the current user
 * + all global published card types
 */
export const getAvailablePublishedCardTypes = createAsyncThunk<AbstractCardType[], void>(
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
  async (cardType: CardTypeCreationData) => {
    return await restClient.CardTypeRestEndpoint.createCardType(cardType);
  },
);

export const updateCardTypeTitle = createAsyncThunk(
  'cardType/updateTitle',
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
  'cardType/updateTags',
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
  'cardType/updateDeprecated',
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
  'cardType/updatePublished',
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
  async ({ cardType, projectId }: { cardType: CardTypeAllInOne; projectId: number }) => {
    if (cardType.ownId && projectId)
      return await restClient.CardTypeRestEndpoint.useCardTypeInProject(cardType.ownId, projectId);
  },
);

export const deleteCardType = createAsyncThunk(
  'cardType/delete',
  async (cardType: CardTypeOnOneSOwn) => {
    if (cardType.ownId) {
      await restClient.CardTypeRestEndpoint.deleteCardType(cardType.ownId);
    }
  },
);

/**
 * Remove the card type from the project. Can be done only if not used.
 */
export const removeCardTypeRefFromProject = createAsyncThunk(
  'cardType/removeFromProject',
  async ({ cardType, projectId }: { cardType: CardTypeWithRef; projectId: number }) => {
    if (cardType.ownId && projectId) {
      return await restClient.CardTypeRestEndpoint.removeCardTypeRefFromProject(
        cardType.ownId,
        projectId,
      );
    }
  },
);

/**
 * Get all global cardTypes.
 * Admin only !
 */
export const getAllGlobalCardTypes = createAsyncThunk<AbstractCardType[], void>(
  'cardType/getAllGlobals',
  async () => {
    return await restClient.CardTypeRestEndpoint.getAllGlobalCardTypes();
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Cards
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCard = createAsyncThunk<Card | null, number>('card/get', async (id: number) => {
  if (id > 0) {
    return await restClient.CardRestEndpoint.getCard(id);
  } else {
    return null;
  }
});

export const getProjectStructure = createAsyncThunk<ProjectStructure | null, number>(
  'project/getStructure',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ProjectRestEndpoint.getStructureOfProject(id);
    } else {
      return null;
    }
  },
);

export const getAllProjectCards = createAsyncThunk<Card[], number>(
  'card/getAllProjectCards',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ProjectRestEndpoint.getCardsOfProject(id);
    } else {
      return [];
    }
  },
);

export const getAllProjectCardContents = createAsyncThunk<CardContent[], number>(
  'card/getAllProjectCardContents',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ProjectRestEndpoint.getCardContentsOfProject(id);
    } else {
      return [];
    }
  },
);

export const createSubCardWithTextDataBlock = createAsyncThunk(
  'card/createSubCard',
  async ({ parent, cardTypeId }: { parent: CardContent; cardTypeId: number | null }) => {
    if (parent.id != null) {
      const firstDeliverable: TextDataBlock = {
        '@class': 'TextDataBlock',
        mimeType: 'text/markdown',
        healthy: true,
        revision: '0',
      };

      if (cardTypeId) {
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

export const changeCardPosition = createAsyncThunk(
  'card/changecardindex',
  async ({ cardId, newPosition }: { cardId: number; newPosition: GridPosition }) => {
    // change the index and review other cards index
    await restClient.CardRestEndpoint.changeCardPosition(cardId, newPosition);
  },
);

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

export const createCardCardType = createAsyncThunk(
  'card/createCardType',
  async (cardId: number) => {
    await restClient.CardRestEndpoint.createCardType(cardId);
  },
);

export const removeCardCardType = createAsyncThunk(
  'card/removeCardType',
  async (cardId: number) => {
    await restClient.CardRestEndpoint.removeCardType(cardId);
  },
);

////////////////////////////////////////////////////////////////////////////////////////////////////
// Card Contents
////////////////////////////////////////////////////////////////////////////////////////////////////

export const getCardContent = createAsyncThunk<CardContent | null, number>(
  'cardcontent/get',
  async (id: number) => {
    if (id > 0) {
      return await restClient.CardContentRestEndpoint.getCardContent(id);
    } else {
      return null;
    }
  },
);

export const getCardContents = createAsyncThunk<CardContent[], number>(
  'cardcontent/getByCard',
  async (cardId: number) => {
    if (cardId > 0) {
      return await restClient.CardRestEndpoint.getContentVariantsOfCard(cardId);
    } else {
      return [];
    }
  },
);

export const createCardContentVariantWithBlockDoc = createAsyncThunk(
  'cardcontent/create',
  async (cardId: number) => {
    const doc: TextDataBlock = {
      '@class': 'TextDataBlock',
      mimeType: 'text/markdown',
      revision: '0',
      healthy: true,
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

export const getSubCards = createAsyncThunk<Card[], number>(
  'cardcontent/getSubs',
  async (cardContentId: number) => {
    if (cardContentId > 0) {
      return await restClient.CardContentRestEndpoint.getSubCards(cardContentId);
    } else {
      return [];
    }
  },
);

export const getDeliverablesOfCardContent = createAsyncThunk<Document[], number>(
  'cardcontent/getDeliverables',
  async (cardContentId: number) => {
    if (cardContentId > 0) {
      return await restClient.CardContentRestEndpoint.getDeliverablesOfCardContent(cardContentId);
    } else {
      return [];
    }
  },
);

export const addDeliverableAtBeginning = createAsyncThunk(
  'cardcontent/addDeliverableAtBeginning',
  async ({ cardContentId, docKind }: { cardContentId: number; docKind: DocumentKind }) => {
    const deliverable = makeNewDocument(docKind);
    return await restClient.CardContentRestEndpoint.addDeliverableAtBeginning(
      cardContentId,
      deliverable,
    );
  },
);

export const addDeliverableAtEnd = createAsyncThunk(
  'cardcontent/addDeliverableAtEnd',
  async ({ cardContentId, docKind }: { cardContentId: number; docKind: DocumentKind }) => {
    const deliverable = makeNewDocument(docKind);
    return await restClient.CardContentRestEndpoint.addDeliverableAtEnd(cardContentId, deliverable);
  },
);

export const addDeliverableBefore = createAsyncThunk(
  'cardcontent/addDeliverableBefore',
  async ({
    cardContentId,
    neighbourDocId,
    docKind,
  }: {
    cardContentId: number;
    neighbourDocId: number;
    docKind: DocumentKind;
  }) => {
    const deliverable = makeNewDocument(docKind);
    return await restClient.CardContentRestEndpoint.addDeliverableBefore(
      cardContentId,
      neighbourDocId,
      deliverable,
    );
  },
);

export const addDeliverableAfter = createAsyncThunk(
  'cardcontent/addDeliverableAfter',
  async ({
    cardContentId,
    neighbourDocId,
    docKind,
  }: {
    cardContentId: number;
    neighbourDocId: number;
    docKind: DocumentKind;
  }) => {
    const deliverable = makeNewDocument(docKind);
    return await restClient.CardContentRestEndpoint.addDeliverableAfter(
      cardContentId,
      neighbourDocId,
      deliverable,
    );
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

export const getAbstractResource = createAsyncThunk<AbstractResource | null, number>(
  'resource/getAbstractResource',
  async (id: number) => {
    if (id > 0) {
      return await restClient.ResourceRestEndpoint.getAbstractResource(id);
    } else {
      return null;
    }
  },
);

export const getResourceChainForAbstractCardTypeId = createAsyncThunk<AbstractResource[][], number>(
  'resource/getForCardTypeId',
  async (cardTypeId: number) => {
    if (cardTypeId > 0) {
      return await restClient.ResourceRestEndpoint.getResourceChainForAbstractCardType(cardTypeId);
    } else {
      return [];
    }
  },
);

export const getResourceChainForCardContentId = createAsyncThunk<AbstractResource[][], number>(
  'resource/getForCardContentId',
  async (cardContentId: number) => {
    if (cardContentId > 0) {
      return await restClient.ResourceRestEndpoint.getResourceChainForCardContent(cardContentId);
    } else {
      return [];
    }
  },
);

export const getDirectResourcesOfProject = createAsyncThunk<AbstractResource[], number>(
  'resource/getAllOfProject',
  async (projectId: number) => {
    if (projectId > 0) {
      return await restClient.ResourceRestEndpoint.getDirectAbstractResourcesOfProject(projectId);
    } else {
      return []; // to avoid undefined, return an empty array
    }
  },
);

export const updateResource = createAsyncThunk(
  'resource/updateResource',
  async (resource: Resource) => {
    return await restClient.ResourceRestEndpoint.updateResource(resource);
  },
);

export const publishResource = createAsyncThunk('resource/publish', async (resourceId: number) => {
  return await restClient.ResourceRestEndpoint.publishResource(resourceId);
});

export const unpublishResource = createAsyncThunk(
  'resource/unpublish',
  async (resourceId: number) => {
    return await restClient.ResourceRestEndpoint.unpublishResource(resourceId);
  },
);

export const moveResource = createAsyncThunk(
  'resource/move',
  async ({
    resource,
    newParentType,
    newParentId,
    published,
  }: {
    resource: AbstractResource;
    newParentType: 'Card' | 'CardContent' | 'CardType';
    newParentId: number;
    published: boolean;
  }) => {
    return await restClient.ResourceRestEndpoint.moveResource(
      resource.id!,
      newParentType,
      newParentId,
      published,
    );
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
  async (resource: ResourceCreationData) => {
    return await restClient.ResourceRestEndpoint.createResource(resource);
  },
);

export const deleteResource = createAsyncThunk('resource/delete', async (resource: Resource) => {
  if (resource.id) {
    return await restClient.ResourceRestEndpoint.deleteResource(resource.id);
  }
});

export const duplicateAndMoveResource = createAsyncThunk(
  'resource/duplicateAndMove',
  async ({
    resourceOrRef,
    newParentType,
    newParentId,
  }: {
    resourceOrRef: AbstractResource;
    newParentType: 'Card' | 'CardContent' | 'CardType';
    newParentId: number;
  }) => {
    if (resourceOrRef.id) {
      return await restClient.ResourceRestEndpoint.damr1(
        resourceOrRef.id,
        newParentType,
        newParentId,
      );
    }
  },
);

export function getResourceToEdit(resource: ResourceAndRef): ResourceRef | Resource {
  if (resource.isDirectResource) {
    return resource.targetResource;
  }

  return (
    resource.cardResourceRef || // if we can, we change at card level
    resource.cardContentResourceRef ||
    resource.cardTypeResourceRef ||
    resource.targetResource
  );
}

export const giveAccessToResource = createAsyncThunk(
  'resourceOrRef/revive',
  async (resourceAndRef: ResourceAndRef) => {
    if (resourceAndRef) {
      const resourceToActivate = getResourceToEdit(resourceAndRef);
      if (resourceToActivate.id != null) {
        return await restClient.ResourceRestEndpoint.restoreResourceOrRef(resourceToActivate.id);
      }
    }
  },
);

export const removeAccessToResource = createAsyncThunk(
  'resourceOrRef/disable',
  async (resource: ResourceAndRef) => {
    const resourceToDisable = getResourceToEdit(resource);
    if (resourceToDisable.id != null) {
      return await restClient.ResourceRestEndpoint.discardResourceOrRef(resourceToDisable.id);
    }
  },
);

export const changeResourceCategory = createAsyncThunk(
  'resource/changeCategory',
  async ({
    resourceOrRef,
    categoryName,
  }: {
    resourceOrRef: AbstractResource;
    categoryName: string;
  }) => {
    if (resourceOrRef && resourceOrRef.id) {
      if (categoryName) {
        return await restClient.ResourceRestEndpoint.changeCategory(resourceOrRef.id, categoryName);
      } else {
        return await restClient.ResourceRestEndpoint.removeCategory(resourceOrRef.id);
      }
    }
  },
);

export const getDocumentsOfResource = createAsyncThunk<Document[], number>(
  'resource/getDocuments',
  async (resourceId: number) => {
    if (resourceId > 0) {
      return await restClient.ResourceRestEndpoint.getDocumentsOfResource(resourceId);
    } else {
      return [];
    }
  },
);

export const addDocumentToResourceAtBeginning = createAsyncThunk(
  'resource/addDocumentAtBeginning',
  async ({ resourceId, docKind }: { resourceId: number; docKind: DocumentKind }) => {
    const document = makeNewDocument(docKind);
    return await restClient.ResourceRestEndpoint.addDocumentAtBeginning(resourceId, document);
  },
);

export const addDocumentToResourceAtEnd = createAsyncThunk(
  'resource/addDocumentAtEnd',
  async ({ resourceId, docKind }: { resourceId: number; docKind: DocumentKind }) => {
    const document = makeNewDocument(docKind);
    return await restClient.ResourceRestEndpoint.addDocumentAtEnd(resourceId, document);
  },
);

export const addDocumentToResourceBefore = createAsyncThunk(
  'resource/addDocumentBefore',
  async ({
    resourceId,
    neighbourDocId,
    docKind,
  }: {
    resourceId: number;
    neighbourDocId: number;
    docKind: DocumentKind;
  }) => {
    const document = makeNewDocument(docKind);
    return await restClient.ResourceRestEndpoint.addDocumentBefore(
      resourceId,
      neighbourDocId,
      document,
    );
  },
);

export const addDocumentToResourceAfter = createAsyncThunk(
  'resource/addDocumentAfter',
  async ({
    resourceId,
    neighbourDocId,
    docKind,
  }: {
    resourceId: number;
    neighbourDocId: number;
    docKind: DocumentKind;
  }) => {
    const document = makeNewDocument(docKind);
    return await restClient.ResourceRestEndpoint.addDocumentAfter(
      resourceId,
      neighbourDocId,
      document,
    );
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

export const getDocument = createAsyncThunk<Document | null, number>(
  'document/get',
  async (id: number) => {
    if (id > 0) {
      return await restClient.DocumentRestEndpoint.getDocument(id);
    } else {
      return null;
    }
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

function makeNewDocument(docKind: DocumentKind): Document {
  if (docKind == 'DocumentFile') {
    return {
      '@class': docKind,
      fileSize: 0,
      mimeType: 'application/octet-stream',
    };
  } else if (docKind == 'TextDataBlock') {
    return {
      '@class': docKind,
      mimeType: 'text/markdown',
      healthy: true,
      revision: '0',
    };
  } else if (docKind == 'ExternalLink') {
    return {
      '@class': docKind,
    };
  }
  throw new Error('Unreachable code');
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
      // once registerd, make sur to sync pending changes
      thunkApi.dispatch(getBlockPendingChanges(id));
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
export const getStickyNoteLinkAsDest = createAsyncThunk<StickyNoteLink[], number>(
  'stickyNoteLinks/getAsDest',
  async (cardId: number) => {
    if (cardId > 0) {
      return await restClient.CardRestEndpoint.getStickyNoteLinksAsDest(cardId);
    } else {
      return [];
    }
  },
);

export const createStickyNote = createAsyncThunk(
  'stickyNoteLinks/create',
  async (stickyNote: StickyNoteLinkCreationData) => {
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

export const getAllActivityFlowLinks = createAsyncThunk<ActivityFlowLink[], number>(
  'activityFlow/getAll',
  async (projectId: number) => {
    if (projectId > 0) {
      return await restClient.ProjectRestEndpoint.getActivityFlowLinks(projectId);
    } else {
      return [];
    }
  },
);

export const getActivityFlowLinkFromCard = createAsyncThunk<ActivityFlowLink[], number>(
  'activityFlow/getFromCard',
  async (cardId: number) => {
    if (cardId > 0) {
      return await restClient.CardRestEndpoint.getActivityFlowLinksAsPrevious(cardId);
    } else {
      return [];
    }
  },
);

export const getActivityFlowLinkToCard = createAsyncThunk<ActivityFlowLink[], number>(
  'activityFlow/getToCard',
  async (cardId: number) => {
    if (cardId > 0) {
      return await restClient.CardRestEndpoint.getActivityFlowLinksAsNext(cardId);
    } else {
      return [];
    }
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
//   if (id > 0) {
//     return await restClient.DocumentFileRestEndPoint.getFileContent(id);
//   } else {
//     return null;
//   }
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
