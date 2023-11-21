/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {AvailabilityStatus, ColabState} from "../store";
import {entityIs, InstanceMaker} from "colab-rest-client/dist/ColabClient";
import {selectCurrentProjectId} from "./projectSelector";
import {Language, useLanguage} from "../../i18n/I18nContext";
import {useAppSelector, useFetchListWithArg} from "../hooks";
import * as API from '../../API/api'
import {getDisplayName, sortSmartly} from "../../helper";
import {compareById} from "./selectorHelper";
import {UserAndStatus, useUser} from "./userSelector";

interface InstanceMakersAndStatus {
    status: AvailabilityStatus;
    instanceMakers: InstanceMaker[];
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Sort
////////////////////////////////////////////////////////////////////////////////////////////////////

function compareByPendingVsVerified(a: InstanceMaker, b: InstanceMaker): number {
    if (a.userId == null && b.userId != null) {
        return 1;
    }

    if (a.userId != null && b.userId == null) {
        return -1;
    }

    return 0;
}

function compareByUserName(
    state: ColabState,
    a: InstanceMaker,
    b: InstanceMaker,
    lang: Language,
): number {
    const aUser = a.id ? state.instanceMakers.instanceMakers[a.id] : null;
    const bUser = b.id ? state.instanceMakers.instanceMakers[b.id] : null;

    return sortSmartly(
        getDisplayName(entityIs(aUser, 'User') ? aUser : null, a),
        getDisplayName(entityIs(bUser, 'User') ? bUser : null, b),
        lang,
    );
}

function compareInstanceMakers(state: ColabState, a: InstanceMaker, b: InstanceMaker, lang: Language): number {
    // sort pending at the end
    const byPendingVsVerified = compareByPendingVsVerified(a, b);
    if (byPendingVsVerified != 0) {
        return byPendingVsVerified;
    }

    // then by name
    const byUserName = compareByUserName(state, a, b, lang);
    if (byUserName != 0) {
        return byUserName;
    }

    // then by id to be deterministic
    return compareById(a, b);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select status
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectStatusInstanceMakersForCurrentProject(state: ColabState): AvailabilityStatus {
    return state.instanceMakers.statusInstanceMakersForCurrentProject;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Select data
////////////////////////////////////////////////////////////////////////////////////////////////////

function selectInstanceMakers(state: ColabState): InstanceMaker[] {
    return Object.values(state.instanceMakers.instanceMakers).flatMap(instanceMaker =>
        entityIs(instanceMaker, 'InstanceMaker') ? [instanceMaker] : [],
    )
}

function selectInstanceMakersOfCurrentProject(state: ColabState): InstanceMaker[] {
    const currentProjectId = selectCurrentProjectId(state);

    if (currentProjectId == null) {
        return [];
    }

    return selectInstanceMakers(state).filter(im => im.projectId === currentProjectId);
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch for current project
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useInstanceMakers(): InstanceMakersAndStatus {
    const lang = useLanguage();

    const currentProjectId = useAppSelector(selectCurrentProjectId);

    const { status, data } = useFetchListWithArg<InstanceMaker, number | null | undefined>(
        selectStatusInstanceMakersForCurrentProject,
        selectInstanceMakersOfCurrentProject,
        API.getInstanceMakersForProject,
        currentProjectId,
    );

    const sortedData = useAppSelector(state =>
        data
            ? data.sort((a, b) => {
                return compareInstanceMakers(state, a, b, lang);
            })
            : data,
    );

    if (currentProjectId == null) {
        return { status: 'ERROR', instanceMakers: [] };
    }

    return { status, instanceMakers: sortedData || [] };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch the user of a instanceMaker
////////////////////////////////////////////////////////////////////////////////////////////////////

export function useUserByInstanceMaker(instanceMaker: InstanceMaker): UserAndStatus {
    const userId = instanceMaker.userId;

    const user = useUser(userId || 0);

    if (userId != null) {
        return user;
    } else {
        // no user id. It is a pending invitation
        return { status: 'READY', user: null };
    }
}