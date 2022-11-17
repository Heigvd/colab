import { Slider, SliderFilledTrack, SliderThumb, SliderTrack, Tooltip } from '@chakra-ui/react';
import { css, cx } from '@emotion/css';
import { faHourglassHalf, faPen, faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HierarchicalPosition, Project, TeamMember } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import { getDisplayName } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadProjectTeam } from '../../../selectors/projectSelector';
import { useCurrentUser } from '../../../selectors/userSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addNotification } from '../../../store/notification';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import {
  borderRadius,
  lightItalicText,
  lightText,
  primaryColor,
  space_L,
  space_M,
  space_S,
  textSmall,
} from '../../styling/style';
import { gridNewLine, titleCellStyle } from './Team';

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
            textSmall,
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
  const { status: currentUserStatus } = useCurrentUser();
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

  const updateDisplayName = React.useCallback(
    (displayName: string) => {
      dispatch(API.updateMember({ ...member, displayName: displayName }));
    },
    [dispatch, member],
  );

  let username = <>"n/a"</>;

  if (member.displayName && member.userId != null) {
    username = (
      <>
        <DiscreetInput
          value={member.displayName || ''}
          placeholder={i18n.authentication.field.username}
          onChange={updateDisplayName}
        />
      </>
    );
  } else if (member.displayName && member.userId == null) {
    username = (
      <span>
        <div className={cx(textSmall, lightItalicText)}>
          <FontAwesomeIcon icon={faHourglassHalf} className={css({ marginRight: space_S })} />
          {i18n.authentication.info.pendingInvitation}...
        </div>
        {member.displayName}
      </span>
    );
  } else if (member.userId == null) {
    username = <span>{i18n.authentication.info.pendingInvitation}</span>;
  } else if (user == 'LOADING' || user == null) {
    username = <InlineLoading />;
  } else if (user == 'ERROR') {
    username = <FontAwesomeIcon icon={faSkullCrossbones} />;
  } else {
    const cn = getDisplayName(user);
    username = (
      <>
        {cn}
        {user.affiliation ? ` (${user.affiliation})` : ''}
        <IconButton icon={faPen} title={i18n.common.edit} onClick={() => updateDisplayName(cn)} />
      </>
    );
  }
  return (
    <>
      <div className={cx(gridNewLine, textSmall, css({ gridColumn: '1 / 3', maxWidth: '300px' }))}>
        {username}
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
            className={css({ backgroundColor: 'var(--secondaryColor)', height: '100%' })}
          />
        </SliderTrack>
        <Tooltip
          hasArrow
          placement="top"
          color="white"
          bg={primaryColor}
          isOpen={showTooltip}
          label={`${prettyPrint(member.position)}`}
          className={css({ padding: space_S, borderRadius: borderRadius })}
        >
          <SliderThumb
            height="17px"
            width="17px"
            borderRadius={'50%'}
            className={css({
              backgroundColor: 'var(--bgColor)',
              border: '1px solid var(--lightGray)',
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
          marginBottom: space_L,
          paddingBottom: space_M,
          borderBottom: '1px solid var(--lightGray)',
          gap: space_S,
        })}
      >
        <div className={cx(titleCellStyle, css({ gridColumnStart: 1, gridColumnEnd: 3 }))}>
          {i18n.team.members}
        </div>
        <div className={cx(titleCellStyle, css({ gridColumnStart: 3, gridColumnEnd: 'end' }))}>
          {i18n.team.rights}
          <Tips
            iconClassName={cx(textSmall, lightText)}
            className={cx(textSmall, css({ fontWeight: 'normal' }))}
          >
            {i18n.team.rightssHelper}
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
