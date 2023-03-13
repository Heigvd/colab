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
import { useTeamMembers } from '../../../selectors/teamMemberSelector';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import { addNotification } from '../../../store/slice/notificationSlice';
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import { inputStyle } from '../../common/element/Input';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { space_lg, text_sm } from '../../styling/style';

export default function MemberCreator(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const projectId = useCurrentProjectId();

  const { status: statusMembers, members } = useTeamMembers();

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [emailAddress, setEmailAddress] = React.useState('');

  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const isNewMember: boolean = React.useMemo(() => {
    members.forEach(m => {
      if (m.displayName === emailAddress) {
        return false;
      }
    });
    return true;
  }, [members, emailAddress]);

  const isValidEmailAddress: boolean = React.useMemo(() => {
    return emailAddress.length > 0 && emailAddress.match(emailFormat) != null;
  }, [emailAddress]);

  const isValidNewMember = isValidEmailAddress && isNewMember;

  const onSend = React.useCallback(() => {
    if (isValidNewMember) {
      setErrorMsg(null);
      startLoading();
      dispatch(
        API.sendInvitation({
          projectId: projectId!,
          recipient: emailAddress,
        }),
      ).then(() => {
        setEmailAddress('');
        stopLoading();
        dispatch(
          addNotification({
            status: 'OPEN',
            type: 'INFO',
            message: `${emailAddress} ${i18n.team.mailInvited}`,
          }),
        );
      });
    } else if (!isNewMember) {
      setErrorMsg(i18n.team.memberAlreadyExist);
    } else {
      setErrorMsg(i18n.authentication.error.emailAddressNotValid);
    }
  }, [
    dispatch,
    emailAddress,
    i18n.authentication.error.emailAddressNotValid,
    i18n.team.mailInvited,
    i18n.team.memberAlreadyExist,
    isNewMember,
    isValidNewMember,
    projectId,
    startLoading,
    stopLoading,
  ]);

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
          <Flex align="center" grow={1}>
            <input
              type="text"
              value={emailAddress}
              placeholder={i18n.authentication.field.emailAddress}
              onChange={e => {
                setEmailAddress(e.target.value);
                setErrorMsg(null);
              }}
              autoFocus
              className={inputStyle}
            />
            <IconButton
              icon={'send'}
              title={i18n.common.send}
              disabled={statusMembers !== 'READY' || members == null}
              withLoader
              isLoading={isLoading}
              onClick={onSend}
            />
          </Flex>
          {errorMsg && (
            <div className={cx(css({ color: 'var(--warning-main)' }), text_sm)}>{errorMsg}</div>
          )}
        </>
      )}
    </OpenCloseModal>
  );
}
