/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppDispatch } from "../../store/hooks";
import * as React from 'react';
import OpenCloseModal from "../common/layout/OpenCloseModal";
import useTranslations from "../../i18n/I18nContext";
import Button from "../common/element/Button";
import Flex from "../common/layout/Flex";
import { css } from "@emotion/css";
import { space_lg, space_sm } from "../../styling/style";
import { useCurrentTeamMember, useIsCurrentTeamMemberOwner, useTeamMembers } from "../../store/selectors/teamMemberSelector";
import { useNavigate } from "react-router-dom";
import * as API from '../../API/api';

export default function ProjectLeaver(): JSX.Element {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const i18n = useTranslations();

    const teamMembers = useTeamMembers();
    const currentTeamMember = useCurrentTeamMember();
    const isCurrentMemberOwner = useIsCurrentTeamMemberOwner();

    const [canLeave, setCanLeave] = React.useState<boolean>(false)
    const [leaveStatus, setLeaveStatus] = React.useState<string>('');

    const onModalOpen = React.useCallback(() => {
        if (!isCurrentMemberOwner) {
            setCanLeave(true);
            setLeaveStatus(i18n.team.sureLeaveProject)
        } else if (teamMembers.members.length === 1) {
            setCanLeave(true);
            setLeaveStatus(i18n.team.sureLeaveProjectDelete)
        } else {
            setCanLeave(false);
            setLeaveStatus(i18n.team.notAllowedLeaveProjectOwner)
        }

    }, [i18n.team.notAllowedLeaveProjectOwner, i18n.team.sureLeaveProject, i18n.team.sureLeaveProjectDelete, isCurrentMemberOwner, teamMembers.members.length])

    const onLeave = React.useCallback(() => {
        if (currentTeamMember.status === 'READY') {
            dispatch(API.deleteMember(currentTeamMember.member!)).then(() => (
                navigate('/')
            ));
        }
    }, [currentTeamMember.member, currentTeamMember.status, dispatch, navigate])

    return (
        <OpenCloseModal
            title={'Leave project'}
            collapsedChildren={
                <Button
                    size="sm"
                    icon="group_remove"
                    theme="error"
                    onClick={onModalOpen}
                >
                    {i18n.team.leaveProject}
                </Button>
            }
            showCloseButton
            footer={(close) => (
                <Flex
                    justify={'flex-end'}
                    grow={1}
                    className={css({ padding: space_lg, columnGap: space_sm })}
                >
                    <Button
                        kind="outline"
                        onClick={close}
                    >
                        {i18n.common.cancel}
                    </Button>
                    {canLeave &&
                        <Button
                            theme="error"
                            onClick={onLeave}
                        >
                            {i18n.common.confirm}
                        </Button>
                    }
                </Flex>
            )}
        >
            {() => (
                <Flex align='center' grow={1}>
                    {leaveStatus}
                </Flex>
            )}
        </OpenCloseModal>
    )
}