/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import { emailFormat } from '../../helper';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { useTeamMembers } from '../../store/selectors/teamMemberSelector';
import { addNotification } from '../../store/slice/notificationSlice';
import { space_lg, text_sm } from '../../styling/style';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { inputStyle } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';

export default function TeamMemberCreator(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const projectId = useCurrentProjectId();

  const { status: statusMembers, members } = useTeamMembers();

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [emailAddress, setEmailAddress] = React.useState<string>('');

  const [error, setError] = React.useState<null | 'memberAlreadyExists' | 'emailAddressNotValid'>(
    null,
  );

  const isNewMember: boolean = React.useMemo(() => {
    return members.find(m => m.displayName === emailAddress) == null;
  }, [members, emailAddress]);

  const isValidEmailAddress: boolean = React.useMemo(() => {
    return emailAddress.length > 0 && emailAddress.match(emailFormat) != null;
  }, [emailAddress]);

  const isValidNewMember: boolean = isValidEmailAddress && isNewMember;

  const onSend = React.useCallback(() => {
    if (isValidNewMember) {
      setError(null);
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
      setError('memberAlreadyExists');
    } else {
      setError('emailAddressNotValid');
    }
  }, [
    isValidNewMember,
    isNewMember,
    startLoading,
    dispatch,
    projectId,
    emailAddress,
    stopLoading,
    i18n.team.mailInvited,
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
                setError(null);
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
          {error && (
            <div className={cx(css({ color: 'var(--warning-main)' }), text_sm)}>
              {error === 'memberAlreadyExists'
                ? i18n.team.memberAlreadyExists
                : i18n.authentication.error.emailAddressNotValid}
            </div>
          )}
        </>
      )}
    </OpenCloseModal>
  );
}
