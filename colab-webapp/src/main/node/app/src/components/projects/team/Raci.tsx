import { cx, css } from "@emotion/css";
import { faHourglassHalf, faSkullCrossbones, faPen, faEllipsisV, faEnvelope, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TeamMember, Project } from "colab-rest-client";
import React from "react";
import * as API from '../../../API/api';
import { getDisplayName } from "../../../helper";
import useTranslations from "../../../i18n/I18nContext";
import { useAndLoadProjectTeam } from "../../../selectors/projectSelector";
import { useCurrentUser } from "../../../selectors/userSelector";
import { useAppDispatch, useLoadingState, useAppSelector } from "../../../store/hooks";
import { addNotification } from "../../../store/notification";
import IconButton from "../../common/element/IconButton";
import InlineLoading from "../../common/element/InlineLoading";
import { DiscreetInput } from "../../common/element/Input";
import { ConfirmDeleteModal } from "../../common/layout/ConfirmDeleteModal";
import DropDownMenu from "../../common/layout/DropDownMenu";
import { textSmall, lightItalicText, space_S, lightIconButtonStyle, errorColor, space_L, space_M } from "../../styling/style";
import { gridNewLine, titleCellStyle } from "./Team";

export interface MemberProps {
    member: TeamMember;
    isTheOnlyOwner: boolean;
  }
  
  const Member = ({ member }: MemberProps) => {
    const dispatch = useAppDispatch();
    const i18n = useTranslations();
    const { currentUser, status: currentUserStatus } = useCurrentUser();
    const { isLoading, startLoading, stopLoading } = useLoadingState();
    //const [ open, setOpen ] = React.useState<'COLLAPSED' | 'EXPANDED'>('COLLAPSED');
  
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
  
    /*
    IS IT USEFUL?
    const clearDisplayName = React.useCallback(() => {
      dispatch(API.updateMember({ ...member, displayName: '' }));
    }, [dispatch, member]); */
  
    let username = <>"n/a"</>;
  
    if (member.displayName && member.userId != null) {
      // effective user with custom displayName
      // DN can be edited or cleared
      username = (
        <>
          {/* TODO: Can edit only our name if not owner or PL. */}
          <DiscreetInput
            value={member.displayName || ''}
            placeholder={i18n.authentication.field.username}
            onChange={updateDisplayName}
          />
        </>
      );
    } else if (member.displayName && member.userId == null) {
      // display name with DN but no user depict a pending invitation
      // display name is not editable until user accept invitation
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
      // no user, no dn
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
  
    const [showModal, setShowModal] = React.useState('');
    return (
      <>
        {showModal === 'delete' && (
          <ConfirmDeleteModal
            title={i18n.team.deleteMember}
            message={<p>{i18n.team.sureDeleteMember}</p>}
            onCancel={() => {
              setShowModal('');
            }}
            onConfirm={() => {
              startLoading();
              dispatch(API.deleteMember(member)).then(stopLoading);
            }}
            confirmButtonLabel={i18n.team.deleteMember}
            isConfirmButtonLoading={isLoading}
          />
        )}
        <div className={gridNewLine}>{username}</div>
        {currentUser?.id != member.userId ? (
          <DropDownMenu
            icon={faEllipsisV}
            valueComp={{ value: '', label: '' }}
            buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
            onSelect={value => setShowModal(value.value)}
            entries={[
              ...(member.userId == null
                ? [
                    {
                      value: 'resend',
                      label: (
                        <>
                          <FontAwesomeIcon icon={faEnvelope} />{' '}
                          {i18n.modules.team.actions.resendInvitation}
                        </>
                      ),
                      action: () => {
                        if (member.projectId && member.displayName) {
                          dispatch(
                            API.sendInvitation({
                              projectId: member.projectId,
                              recipient: member.displayName,
                            }),
                          ).then(() =>
                            dispatch(
                              addNotification({
                                status: 'OPEN',
                                type: 'INFO',
                                message: i18n.modules.team.actions.invitationResent,
                              }),
                            ),
                          );
                        }
                      },
                    },
                  ]
                : []),
              {
                value: 'delete',
                label: (
                  <>
                    <FontAwesomeIcon icon={faTrash} color={errorColor} /> {i18n.common.delete}
                  </>
                ),
              },
            ]}
          />
        ) : (
          <FontAwesomeIcon icon={faUser} title={i18n.team.me} />
        )}
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
              <Member
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