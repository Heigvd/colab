/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { entityIs, TeamMember, UserPresence } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../../../API/api';
import { getDisplayName } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { usePresence } from '../../../selectors/presenceSelector';
import { useAndLoadProjectTeam } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Tooltip from '../../common/element/Tooltip';
import Flex from '../../common/layout/Flex';
import { normalThemeMode, space_M } from '../../styling/style';

const presenceIconStyle = (color: string) =>
  cx(
    normalThemeMode,
    css({
      borderRadius: '50%',
      border: `2px solid ${color}`,
      boxShadow: '0 0 1px 0 white',
      width: '20px',
      height: '20px',
      marginRight: '3px',
      cursor: 'pointer',
      textAlign: 'center',
    }),
  );

const triangleWidth = `4px`;
const triangleHeight = `6px`;

export const triangleDown = (color: string) =>
  css({
    width: '1px',
    height: 0,
    position: 'absolute',
    top: 0,
    left: `-${triangleWidth}`,
    borderTop: `${triangleHeight} solid ${color}`,
    borderLeft: `${triangleWidth} solid transparent`,
    borderRight: `${triangleWidth} solid transparent`,
  });

export const triangleRight = (color: string) =>
  css({
    width: 0,
    position: 'absolute',
    top: '-1px',
    borderLeft: `${triangleHeight} solid ${color}`,
    borderTop: `${triangleWidth} solid transparent`,
    borderBottom: `${triangleWidth} solid transparent`,
  });

export const triangleLeft = (color: string) =>
  css({
    width: 0,
    position: 'absolute',
    top: '-1px',
    left: '-5px',
    borderRight: `${triangleHeight} solid ${color}`,
    borderTop: `${triangleWidth} solid transparent`,
    borderBottom: `${triangleWidth} solid transparent`,
  });

export function createCaret(
  top: number,
  left: number,
  height: number,
  color: string,
  direction: 'left' | 'right' | 'down',
): Element {
  const pDiv = document.createElement('DIV');
  pDiv.style.position = 'absolute';
  pDiv.style.top = `${top}px`;
  pDiv.style.left = `${left}px`;
  pDiv.style.width = `1px`;
  pDiv.style.height = `${height}px`;
  pDiv.style.backgroundColor = color;

  const span = document.createElement('SPAN');
  switch (direction) {
    case 'left':
      span.className = triangleLeft(color);
      break;
    case 'right':
      span.className = triangleRight(color);
      break;
    default:
      span.className = triangleDown(color);
      break;
  }
  pDiv.append(span);
  return pDiv;
}

export function getUserColor(presence: UserPresence) {
  // remove "ws-" to extract hex part
  const hexId = presence.wsSessionId.substring(3);
  // convert hex to dec
  const id = parseInt(hexId, 16);

  const mod = id % 5;

  switch (mod) {
    case 0:
      return '#9429FF'; // violet
    case 1:
      return '#FF6B29'; // orange
    case 2:
      return '#29BDFF'; // blue
    case 3:
      return '#29FF96'; // green
    case 4:
      return 'hotpink';
    default:
      return 'black';
  }
}

interface PresenceIconProps {
  presence: UserPresence;
  member: TeamMember | undefined;
}

const tooltipStyle = cx(
  normalThemeMode,
  css({
    background: 'var(--bgColor)',
    zIndex: 6,
    padding: space_M,
    border: '1px solid grey',
    //top: hover[1],
    //left: hover[0],
  }),
);

function PresenceIcon({ presence, member }: PresenceIconProps): JSX.Element {
  const dispatch = useAppDispatch();

  const i18n = useTranslations();

  const navigate = useNavigate();

  const userId = member?.userId;

  const user = useAppSelector(state => {
    if (userId != null) {
      return state.users.users[userId];
    } else {
      // no user id looks like a pending invitation
      return null;
    }
  });

  React.useEffect(() => {
    if (userId != null && user === undefined) {
      // member is linked to a user. This user is not yet known
      // load it
      dispatch(getUser(userId));
    }
  }, [userId, user, dispatch]);

  const displayName =
    member?.displayName || (entityIs(user, 'User') ? getDisplayName(user) : '') || 'Anonymous';

  const letter = (displayName && displayName[0]) || 'A';

  const onClickCb = React.useCallback(() => {
    if (presence.cardId != null && presence.cardContentId != null) {
      navigate(
        `/editor/${presence.projectId}/${presence.context === 'edit' ? 'edit' : 'card'}/${
          presence.cardId
        }/v/${presence.cardContentId}`,
      );
    } else {
      // back to root
      navigate(`/editor/${presence.projectId}`);
    }
  }, [presence, navigate]);

  return (
    <Tooltip
      tooltipClassName={tooltipStyle}
      tooltip={() => <div>{i18n.modules.presence.date(displayName, presence.date)}</div>}
    >
      <div className={presenceIconStyle(getUserColor(presence))} onClick={onClickCb}>
        {letter}
      </div>
    </Tooltip>
  );
}

interface PresenceProps {
  projectId: number;
}

export default function PresenceList({ projectId }: PresenceProps): JSX.Element {
  const presence = usePresence(projectId);

  const { members } = useAndLoadProjectTeam(projectId);

  const mapped = members.reduce<Record<number, TeamMember>>((acc, cur) => {
    acc[cur.id!] = cur;
    return acc;
  }, {});

  if (typeof presence === 'string') {
    return <></>;
  }

  return (
    <Flex>
      {presence.map(p => (
        <PresenceIcon
          key={p.wsSessionId}
          presence={p}
          member={p.teamMemberId ? mapped[p.teamMemberId] : undefined}
        />
      ))}
    </Flex>
  );
}
