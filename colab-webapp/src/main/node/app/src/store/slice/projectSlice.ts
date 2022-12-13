/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Project, TeamMember, TeamRole } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

/**
 * NOT_SET: the state is not fully set. It may contain some data (received by websocket) but there
 *          is no guarantee it contains all data
 * LOADING: request to load all data is pending
 * SET:     all data are known
 */
export type StateStatus = 'NOT_INITIALIZED' | 'LOADING' | 'INITIALIZED';

export interface TeamState {
  status: StateStatus;
  members: Record<number, TeamMember>;
  roles: Record<number, TeamRole>;
}

/** what we have in the store */
export interface ProjectState {
  /** all the projects we got so far */
  projects: Record<number, Project | AvailabilityStatus>;

  /** did we load all the projects of the current user */
  statusForCurrentUser: AvailabilityStatus;
  /** did we load all the projects */
  statusForAll: AvailabilityStatus;

  currentUserId: number | undefined;

  mine: number[];

  teams: Record<number, TeamState>;
  editing: number | null;
  editingStatus: 'NOT_EDITING' | 'LOADING' | 'READY';
}

const initialState: ProjectState = {
  projects: {},

  statusForCurrentUser: 'NOT_INITIALIZED',
  statusForAll: 'NOT_INITIALIZED',

  currentUserId: undefined,
  mine: [],
  teams: {},
  editing: null,
  editingStatus: 'NOT_EDITING',
};

const getOrCreateTeamState = (state: ProjectState, projectId: number): TeamState => {
  const teamState = state.teams[projectId];
  if (teamState) {
    return teamState;
  } else {
    const ts: TeamState = { status: 'NOT_INITIALIZED', members: {}, roles: {} };
    state.teams[projectId] = ts;
    return ts;
  }
};

const updateTeamMember = (state: ProjectState, member: TeamMember) => {
  const projectId = member.projectId;
  const mId = member.id;

  const userId = member.userId;
  if (projectId != null && userId != null && userId === state.currentUserId) {
    if (state.mine.indexOf(projectId) == -1) {
      state.mine.push(projectId);
    }
  }

  if (projectId != null && mId != null) {
    const team = state.teams[projectId];
    if (team != null && team.status === 'INITIALIZED') {
      team.members[mId] = member;
    }
  }
};

const removeTeamMember = (state: ProjectState, memberId: number) => {
  Object.values(state.teams).forEach(team => {
    if (team.members[memberId]) {
      delete team.members[memberId];
    }
  });
};

const updateRole = (state: ProjectState, role: TeamRole) => {
  const projectId = role.projectId;
  const roleId = role.id;

  if (projectId != null && roleId != null) {
    const team = state.teams[projectId];
    if (team != null && team.status === 'INITIALIZED') {
      team.roles[roleId] = role;
    }
  }
};

const removeRole = (state: ProjectState, roleId: number) => {
  Object.values(state.teams).forEach(team => {
    if (team.roles[roleId]) {
      delete team.roles[roleId];
    }
  });
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.projects.updated.forEach(project => {
          if (project.id != null) {
            state.projects[project.id] = project;
          }
        });

        action.payload.projects.deleted.forEach(entry => {
          const mineIndex = state.mine.indexOf(entry.id);
          if (mineIndex >= 0) {
            state.mine.splice(mineIndex, 1);
          }

          delete state.projects[entry.id];
        });

        action.payload.members.updated.forEach(item => {
          updateTeamMember(state, item);
        });

        action.payload.members.deleted.forEach(entry => {
          if (entry.id != null) {
            removeTeamMember(state, entry.id);
          }
        });

        action.payload.roles.updated.forEach(item => {
          updateRole(state, item);
        });

        action.payload.roles.deleted.forEach(entry => {
          if (entry.id != null) {
            removeRole(state, entry.id);
          }
        });
      })

      .addCase(API.reloadCurrentUser.fulfilled, (state, action) => {
        // hack: to build state.mine projects, currentUserId must be known
        state.currentUserId = action.payload.currentUser
          ? action.payload.currentUser.id || undefined
          : undefined;
      })

      .addCase(API.getProject.pending, (state, action) => {
        state.projects[action.meta.arg] = 'LOADING';
      })
      .addCase(API.getProject.fulfilled, (state, action) => {
        state.projects[action.meta.arg] = action.payload;
      })
      .addCase(API.getProject.rejected, (state, action) => {
        state.projects[action.meta.arg] = 'ERROR';
      })

      .addCase(API.getUserProjects.pending, state => {
        state.statusForCurrentUser = 'LOADING';
      })
      .addCase(API.getUserProjects.fulfilled, (state, action) => {
        state.mine = action.payload.flatMap(project => (project.id != null ? [project.id] : []));
        state.projects = { ...state.projects, ...mapById(action.payload) };
        state.statusForCurrentUser = 'READY';
      })
      .addCase(API.getUserProjects.rejected, state => {
        state.statusForCurrentUser = 'ERROR';
      })

      .addCase(API.getAllProjects.pending, state => {
        state.statusForAll = 'LOADING';
      })
      .addCase(API.getAllProjects.fulfilled, (state, action) => {
        state.projects = mapById(action.payload);
        state.statusForAll = 'READY';
      })
      .addCase(API.getAllProjects.rejected, state => {
        state.statusForAll = 'ERROR';
      })

      .addCase(API.getProjectTeam.pending, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          const ts = getOrCreateTeamState(state, projectId);
          ts.status = 'LOADING';
        }
      })
      .addCase(API.getProjectTeam.fulfilled, (state, action) => {
        const projectId = action.meta.arg;
        if (projectId) {
          const ts = getOrCreateTeamState(state, projectId);
          ts.status = 'INITIALIZED';
          if (action.payload) {
            ts.members = mapById(action.payload.members);
            ts.roles = mapById(action.payload.roles);
          }
        }
      })

      //      .addCase(API.createProject.fulfilled, (state, action) => {
      //        state.mine.push(action.payload);
      //      })

      .addCase(API.startProjectEdition.pending, state => {
        state.editingStatus = 'LOADING';
      })
      .addCase(API.startProjectEdition.fulfilled, (state, action) => {
        if (action.payload.id != null) {
          state.editing = action.payload.id;
        } else {
          state.editing = null;
        }
        state.editingStatus = 'READY';
      })

      .addCase(API.closeCurrentProject.pending, state => {
        state.editing = null;
        state.editingStatus = 'NOT_EDITING';
      })

      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default projectsSlice.reducer;
