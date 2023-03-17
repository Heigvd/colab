/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { createSlice } from '@reduxjs/toolkit';
import { Assignment, IndexEntry } from 'colab-rest-client';
import * as API from '../../API/api';
import { mapById } from '../../helper';
import { processMessage } from '../../ws/wsThunkActions';
import { AvailabilityStatus } from '../store';

export interface AssignmentState {
  /** all the assignments we got so far, by card id and id */
  assignments: Record<
    number,
    {
      status: AvailabilityStatus;
      assignment: {
        [id: number]: Assignment;
      };
    }
  >;

  /** did we load all the assignments of the current project */
  statusAssignmentsForCurrentProject: AvailabilityStatus;
}

const initialState: AssignmentState = {
  assignments: {},

  statusAssignmentsForCurrentProject: 'NOT_INITIALIZED',
};

const getOrCreateState = (state: AssignmentState, cardId: number) => {
  let s = state.assignments[cardId];

  if (s != null) {
    return s;
  }
  s = {
    status: 'NOT_INITIALIZED',
    assignment: {},
  };
  state.assignments[cardId] = s;
  return s;
};

const updateAssignment = (state: AssignmentState, assignment: Assignment) => {
  if (assignment.id != null && assignment.cardId != null) {
    const s = state.assignments[assignment.cardId];
    if (s != null) {
      s.assignment[assignment.id] = assignment;
    }
  }
};

const findStateByAssignmentId = (state: AssignmentState, acId: number) => {
  return Object.values(state.assignments).find(entry => {
    return entry.assignment[acId] != null;
  });
};

const deleteAssignment = (state: AssignmentState, entry: IndexEntry) => {
  if (entry.id != null) {
    const s = findStateByAssignmentId(state, entry.id);
    if (s != null) {
      delete s.assignment[entry.id];
    }
  }
};

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(processMessage.fulfilled, (state, action) => {
        action.payload.assignments.upserted.forEach(assignment =>
          updateAssignment(state, assignment),
        );
        action.payload.assignments.deleted.forEach(assignment =>
          deleteAssignment(state, assignment),
        );
      })

      .addCase(API.getAssignmentsForProject.pending, state => {
        state.statusAssignmentsForCurrentProject = 'LOADING';
      })
      .addCase(API.getAssignmentsForProject.fulfilled, (state, action) => {
        if (action.payload) {
          action.payload.forEach(assignment => {
            if (assignment.cardId && assignment.id) {
              const s = getOrCreateState(state, assignment.cardId);
              s.status = 'READY';
              s.assignment[assignment.id] = assignment;
            }
          });
          state.statusAssignmentsForCurrentProject = 'READY';
        } else {
          state.statusAssignmentsForCurrentProject = 'ERROR';
        }
      })
      .addCase(API.getAssignmentsForProject.rejected, state => {
        state.statusAssignmentsForCurrentProject = 'ERROR';
      })

      .addCase(API.getAssignmentsForCard.pending, (state, action) => {
        if (action.meta.arg != null) {
          const s = getOrCreateState(state, action.meta.arg);
          s.status = 'LOADING';
          s.assignment = [];
        }
      })
      .addCase(API.getAssignmentsForCard.fulfilled, (state, action) => {
        if (action.meta.arg != null) {
          const s = getOrCreateState(state, action.meta.arg);
          if (action.payload) {
            s.status = 'READY';
            s.assignment = mapById(action.payload);
          } else {
            s.status = 'ERROR';
          }
        }
      })
      .addCase(API.getAssignmentsForCard.rejected, (state, action) => {
        if (action.meta.arg != null) {
          const s = getOrCreateState(state, action.meta.arg);
          s.status = 'ERROR';
          s.assignment = [];
        }
      })

      .addCase(API.closeCurrentProject.fulfilled, () => {
        return initialState;
      })
      .addCase(API.signOut.fulfilled, () => {
        return initialState;
      }),
});

export default assignmentSlice.reducer;
