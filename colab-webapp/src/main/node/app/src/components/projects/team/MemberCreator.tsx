/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import React from 'react';
import * as API from '../../../API/api';
import { emailFormat } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import { useTeamMembersForCurrentProject } from '../../../selectors/teamMemberSelector';
import { useAppDispatch } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import { inputStyle } from '../../common/element/Input';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { linkStyle, space_lg, text_sm } from '../../styling/style';

export default function MemberCreator(): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const projectId = useCurrentProjectId();

  const { status: statusMembers, members } = useTeamMembersForCurrentProject();

  const [invite, setInvite] = React.useState('');
  const [error, setError] = React.useState<boolean | string>(false);

  if (statusMembers !== 'READY' || members == null) {
    return <AvailabilityStatusIndicator status={statusMembers} />;
  }

  const isNewMember = (newMail: string) => {
    let isNew = true;
    members.forEach(m => {
      if (m.displayName === newMail) {
        isNew = false;
      }
    });
    return isNew;
  };

  const isValidNewMember =
    invite.length > 0 && invite.match(emailFormat) != null && isNewMember(invite);

  return (
    <OpenCloseModal
      title={i18n.team.inviteNewMember}
      collapsedChildren={
        <Button variant="outline" icon="add" size="sm">
          {i18n.team.inviteNewMember}
        </Button>
      }
      modalBodyClassName={css({ padding: space_lg })}
      showCloseButton
    >
      {() => (
        <>
          <input
            placeholder={i18n.authentication.field.emailAddress}
            type="text"
            onChange={e => setInvite(e.target.value)}
            value={invite}
            className={inputStyle}
          />
          <IconButton
            className={linkStyle}
            icon={'send'}
            title={i18n.common.send}
            isLoading={isValidNewMember}
            withLoader
            onClick={() => {
              if (isValidNewMember) {
                setError(false);
                dispatch(
                  API.sendInvitation({
                    projectId: projectId!,
                    recipient: invite,
                  }),
                ).then(() => {
                  setInvite('');
                  dispatch(
                    addNotification({
                      status: 'OPEN',
                      type: 'INFO',
                      message: `${invite} ${i18n.team.mailInvited}`,
                    }),
                  );
                });
              } else if (!isNewMember(invite)) {
                setError(i18n.team.memberAlreadyExist);
              } else {
                setError(i18n.authentication.error.emailAddressNotValid);
              }
            }}
          />
          {error && (
            <div className={cx(css({ color: 'var(--warning-main)' }), text_sm)}>{error}</div>
          )}
        </>
      )}
    </OpenCloseModal>
  );
}
