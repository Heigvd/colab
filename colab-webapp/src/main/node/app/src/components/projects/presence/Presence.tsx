/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { TeamMember, UserPresence } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../../i18n/I18nContext';
import { usePresence } from '../../../selectors/presenceSelector';
import { useAndLoadProjectTeam } from '../../../selectors/projectSelector';
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

function hoverPos(hover: false | [number, number]): string | undefined {
  if (hover) {
    return cx(
      normalThemeMode,
      css({
        background: 'var(--bgColor)',
        zIndex: 6,
        position: 'fixed',
        padding: space_M,
        border: '1px solid grey',
        borderRadius: '6px',
        top: hover[1],
        left: hover[0],
      }),
    );
  }
}

function PresenceIcon({ presence, member }: PresenceIconProps): JSX.Element {
  const displayName = member?.displayName || 'Anonymous';
  const letter = (displayName && displayName[0]) || 'A';
  const i18n = useTranslations();

  const [hover, setHover] = React.useState<false | [number, number]>(false);

  //  const debug = `
  //  card: ${presence.cardId}
  //  content: ${presence.cardContentId}
  //  doc: ${presence.documentId} [${presence.selectionStart || 0} ; ${presence.selectionEnd || 0} ]
  //  `;

  const tooltip = i18n.modules.presence.date(displayName, presence.date);

  const navigate = useNavigate();

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

  const enterCb = React.useCallback((e: React.MouseEvent) => {
    setHover([e.clientX, e.clientY]);
  }, []);

  const leaveCb = React.useCallback(() => setHover(false), []);

  return (
    <>
      <div
        className={presenceIconStyle(getUserColor(presence))}
        onClick={onClickCb}
        onMouseEnter={enterCb}
        onMouseLeave={leaveCb}
      >
        {letter}
      </div>

      {hover !== false ? <div className={hoverPos(hover)}>{tooltip}</div> : null}
    </>
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
