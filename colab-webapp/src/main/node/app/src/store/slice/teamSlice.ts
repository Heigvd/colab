/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { createSlice } from '@reduxjs/toolkit';
import { InstanceMaker, TeamMember, TeamRole } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

export interface TeamState1 {
  status: AvailabilityStatus;
  members: Record<number, TeamMember>;
  roles: Record<number, TeamRole>;
}

export interface TeamState2 {
  teams: Record<number, TeamState1>;

  currentUserId: number | undefined;

  mine: number[];
  instanceableProjects: number[];
}

const initialState: TeamState2 = {
  teams: {},

  currentUserId: undefined,

  mine: [],
  instanceableProjects: [],
};

const getOrCreateTeamState = (state: TeamState2, projectId: number): TeamState1 => {
  const teamState = state.teams[projectId];
  if (teamState) {
    return teamState;
  } else {
    const ts: TeamState1 = { status: 'NOT_INITIALIZED', members: {}, roles: {} };
    state.teams[projectId] = ts;
    return ts;
  }
};

const updateTeamMember = (state: TeamState2, member: TeamMember) => {
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
    if (team != null && team.status === 'READY') {
      team.members[mId] = member;
    }
  }
};

const removeTeamMember = (state: TeamState2, memberId: number) => {
  Object.values(state.teams).forEach(team => {
    if (team.members[memberId]) {
      const member = team.members[memberId];

      if (member) {
        const projectId = member.projectId;

        if (projectId) {
          const mineIndex = state.mine.indexOf(projectId);
          if (mineIndex >= 0) {
            state.mine.splice(mineIndex, 1);
          }
        }

        delete team.members[memberId];
      }
    }
  });
};

const updateInstanceMaker = (state: TeamState2, instanceMaker: InstanceMaker) => {
  const projectId = instanceMaker.projectId;

  const userId = instanceMaker.userId;
  if (projectId != null && userId != null && userId === state.currentUserId) {
    if (state.instanceableProjects.indexOf(projectId) == -1) {
      state.instanceableProjects.push(projectId);
    }
  }
};

const updateRole = (state: TeamState2, role: TeamRole) => {
  const projectId = role.projectId;
  const roleId = role.id;

  if (projectId != null && roleId != null) {
    const team = state.teams[projectId];
    if (team != null && team.status === 'READY') {
      team.roles[roleId] = role;
    }
  }
};

const removeRole = (state: TeamState2, roleId: number) => {
  Object.values(state.teams).forEach(team => {
    if (team.roles[roleId]) {
      delete team.roles[roleId];
    }
  });
};

const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.projects.deleted.forEach(entry => {
          const mineIndex = state.mine.indexOf(entry.id);
          if (mineIndex >= 0) {
            state.mine.splice(mineIndex, 1);
          }

          const instanceableProjectsIndex = state.instanceableProjects.indexOf(entry.id);
          if (instanceableProjectsIndex >= 0) {
            state.instanceableProjects.splice(instanceableProjectsIndex, 1);
          }
        });

        action.payload.members.updated.forEach(item => {
          updateTeamMember(state, item);
        });

        action.payload.members.deleted.forEach(entry => {
          if (entry.id != null) {
            removeTeamMember(state, entry.id);
          }
        });

        action.payload.instanceMakers.updated.forEach(item => {
          updateInstanceMaker(state, item);
        });

        // action.payload.instanceMakers.deleted.forEach(entry => {
        //   if (entry.id != null) {
        //     removeInstanceMaker(state, entry.id);
        //   }
        // });

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

      .addCase(API.getUserProjects.fulfilled, (state, action) => {
        state.mine = action.payload.flatMap(project => (project.id != null ? [project.id] : []));
      })

      .addCase(API.getInstanceableModels.fulfilled, (state, action) => {
        state.instanceableProjects = action.payload.flatMap(project =>
          project.id != null ? [project.id] : [],
        );
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
          ts.status = 'READY';
          if (action.payload) {
            ts.members = mapById(action.payload.members);
            ts.roles = mapById(action.payload.roles);
          }
        }
      }),
});

export default teamSlice.reducer;
