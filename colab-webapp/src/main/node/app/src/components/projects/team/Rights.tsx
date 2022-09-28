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
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { errorColor, lightItalicText, space_L, space_M, space_S, textSmall } from '../../styling/style';
import { gridNewLine, titleCellStyle } from './Team';
import Select from 'react-select';

export function PositionSelector({
    value,
    onChange,
    isMyRights,
  }: {
    value: HierarchicalPosition;
    onChange: (value: HierarchicalPosition) => void;
    isMyRights: boolean;
  }): JSX.Element {
    const i18n = useTranslations();
    const [open, setOpen] = React.useState<boolean>(false);
    const onChangeCb = React.useCallback(
      (option: { value: HierarchicalPosition } | null) => {
        if (option != null) {
          onChange(option.value);
          setOpen(false);
        }
      },
      [onChange],
    );
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
    const options = [
      buildOption('OWNER'),
      buildOption('LEADER'),
      buildOption('INTERNAL'),
      buildOption('GUEST'),
    ];
    const currentValue = buildOption(value);
  
    return (
      <div>
        {isMyRights && (
          <OpenCloseModal
            title={i18n.team.changeOwnRights}
            collapsedChildren={<></>}
            status={open ? 'EXPANDED' : 'COLLAPSED'}
          >
            {collapse => (
              <Flex direction="column" align="stretch" grow={1}>
                <Flex grow={1} direction="column">
                  {i18n.team.sureChangeOwnRights}
                </Flex>
                <Flex justify="flex-end">
                  <Button
                    title={i18n.common.cancel}
                    onClick={() => {
                      collapse();
                      setOpen(false);
                    }}
                    invertedButton
                  >
                    {i18n.common.cancel}
                  </Button>
                  <Button
                    title={i18n.common.change}
                    onClick={() => {
                      collapse();
                    }}
                    className={css({
                      backgroundColor: errorColor,
                      marginLeft: space_M,
                    })}
                  >
                    {i18n.common.change}
                  </Button>
                </Flex>
              </Flex>
            )}
          </OpenCloseModal>
        )}
        <Select
          className={css({ minWidth: '160px' })}
          options={options}
          value={currentValue}
          onChange={onChangeCb}
          onMenuOpen={() => setOpen(true)}
        />
      </div>
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

  const changeRights = React.useCallback(
    (newPosition: HierarchicalPosition) => {
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
      <div className={gridNewLine}>{username}</div>
      <PositionSelector
        value={member.position}
        onChange={newPosition => changeRights(newPosition)}
        isMyRights={currentUser?.id === member.userId}
      />
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
          gridTemplateColumns: `repeat(2, max-content)`,
          justifyItems: 'center',
          alignItems: 'center',
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
        <div className={titleCellStyle}>
          {i18n.team.members}
        </div>
        <div className={titleCellStyle}>
          {i18n.team.rights}
        </div>
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
