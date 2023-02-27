/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import { HierarchicalPosition, Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../../selectors/teamSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import Tips from '../../common/element/Tips';
import { lightTextStyle, space_lg, space_sm, space_xl, text_sm, th_sm } from '../../styling/style';
import { gridNewLine } from './Team';
import UserName from './UserName';

const options: HierarchicalPosition[] = ['GUEST', 'INTERNAL', 'LEADER', 'OWNER'];

export function PositionColumns(): JSX.Element {
  const i18n = useTranslations();
  function prettyPrint(position: HierarchicalPosition) {
    switch (position) {
      case 'OWNER':
        return i18n.team.rolesNames.owner;
      case 'LEADER':
        return i18n.team.rolesNames.projectLeader;
      case 'INTERNAL':
        return i18n.team.rolesNames.member;
      case 'GUEST':
        return i18n.team.rolesNames.guest;
    }
  }
  function buildOption(position: HierarchicalPosition) {
    return {
      value: position,
      label: prettyPrint(position),
    };
  }

  return (
    <>
      {options.map(option => (
        <div
          key={buildOption(option).value}
          className={cx(
            text_sm,
            css({ lineHeight: '2em', gridColumn: 'span 2', fontWeight: 'bold' }),
          )}
        >
          {buildOption(option).label}
        </div>
      ))}
    </>
  );
}

export interface MemberWithProjectRightsProps {
  member: TeamMember;
  isTheOnlyOwner: boolean;
}

const MemberWithProjectRights = ({ member, isTheOnlyOwner }: MemberWithProjectRightsProps) => {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { currentUser, status: currentUserStatus } = useCurrentUser();
  const [showTooltip, setShowTooltip] = React.useState(false);
  function prettyPrint(position: HierarchicalPosition) {
    switch (position) {
      case 'OWNER':
        return i18n.team.rolesNames.owner;
      case 'LEADER':
        return i18n.team.rolesNames.projectLeader;
      case 'INTERNAL':
        return i18n.team.rolesNames.member;
      case 'GUEST':
        return i18n.team.rolesNames.guest;
    }
  }
  const changeRights = React.useCallback(
    (newPosition: HierarchicalPosition | undefined) => {
      if (newPosition) {
        if (isTheOnlyOwner) {
          dispatch(
            addNotification({
              status: 'OPEN',
              type: 'WARN',
              message: i18n.team.oneOwnerPerProject,
            }),
          );
        } else {
          dispatch(API.setMemberPosition({ memberId: member.id!, position: newPosition }));
        }
      }
    },
    [dispatch, i18n.team.oneOwnerPerProject, isTheOnlyOwner, member.id],
  );
  React.useEffect(() => {
    if (currentUserStatus == 'NOT_INITIALIZED') {
      // user is not known. Reload state from API
      dispatch(API.reloadCurrentUser());
    }
  }, [currentUserStatus, dispatch]);

  const user = useAppSelector(state => {
    if (member.userId != null) {
      return state.users.users[member.userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  React.useEffect(() => {
    if (member.userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(API.getUser(member.userId));
    }
  }, [member.userId, user, dispatch]);

  return (
    <>
      <div className={cx(gridNewLine, text_sm, css({ gridColumn: '1 / 3', maxWidth: '300px' }))}>
        <UserName user={user} member={member} currentUser={currentUser} />
      </div>
      <Slider
        id="slider"
        defaultValue={options.indexOf(member.position)}
        value={options.indexOf(member.position)}
        style={{ display: 'none' }}
        min={0}
        max={options.length - 1}
        step={1}
        onChange={newPosition => changeRights(options[newPosition])}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        cursor="pointer"
        className={css({ width: '100%', height: '17px', gridColumn: '4 / 10' })}
      >
        <SliderTrack height={'17px'} bg="#bbb">
          <SliderFilledTrack
            className={css({ backgroundColor: 'var(--primary-main)', height: '100%' })}
          />
        </SliderTrack>
        <Tooltip
          hasArrow
          placement="top"
          color="white"
          bg={'var(--primary-main)'}
          isOpen={showTooltip}
          label={`${prettyPrint(member.position)}`}
          className={css({ padding: space_sm })}
        >
          <SliderThumb
            height="17px"
            width="17px"
            borderRadius={'50%'}
            className={css({
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--divider-main)',
              marginTop: '-1px',
              '&:focus-visible': { outline: 'none' },
            })}
          />
        </Tooltip>
      </Slider>
      {/* {options.map(option => (
        <Checkbox
          onChange={newPosition => changeRights(newPosition, option)}
          value={member.position === option}
          key={username + option}
        />
      ))} */}
    </>
  );
};

export default function TeamRights({ project }: { project: Project }): JSX.Element {
  const i18n = useTranslations();
  const projectId = project.id;
  const { members } = useAndLoadProjectTeam(projectId);
  const projectOwners = members.filter(m => m.position === 'OWNER');
  return (
    <>
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length * 2 + 2}, 1fr)`,
          justifyItems: 'center',
          alignItems: 'flex-end',
          '& > div': {
            marginLeft: '5px',
            marginRight: '5px',
          },
          marginBottom: space_xl,
          paddingBottom: space_lg,
          borderBottom: '1px solid var(--divider-main)',
          gap: space_sm,
        })}
      >
        <div className={cx(th_sm, css({ gridColumnStart: 1, gridColumnEnd: 3 }))}>
          {i18n.team.members}
        </div>
        <div className={cx(th_sm, css({ gridColumnStart: 3, gridColumnEnd: 'end' }))}>
          {i18n.team.rights}
          <Tips
            iconClassName={cx(text_sm, lightTextStyle)}
            className={cx(text_sm, css({ fontWeight: 'normal' }))}
          >
            {i18n.team.rightsHelper}
          </Tips>
        </div>
        <div />
        <div />
        <PositionColumns />

        {members.map(member => {
          return (
            <MemberWithProjectRights
              key={member.id}
              member={member}
              isTheOnlyOwner={projectOwners.length < 2 && projectOwners.includes(member)}
            />
          );
        })}
      </div>
    </>
  );
}
