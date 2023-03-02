import { css, cx } from '@emotion/css';
import { TeamMember, User } from 'colab-rest-client';
import React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { lightTextStyle, space_sm, text_semibold, text_xs } from '../../styling/style';

export interface UserNameProps {
  user: User | null | 'LOADING' | 'ERROR' | undefined;
  currentUser: User | null;
  member?: TeamMember;
  className?: string;
  readOnly?: boolean;
}

export default function UserName({
  user,
  member,
  currentUser,
  className,
  readOnly,
}: UserNameProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const updateDisplayName = React.useCallback(
    (displayName: string) => {
      if (user && user != 'LOADING' && user != 'ERROR') {
        dispatch(API.updateUser({ ...user, commonname: displayName }));
      }
    },
    [dispatch, user],
  );

  if (member?.displayName && user == null) {
    return (
      <Flex align="center" className={cx(text_xs, lightTextStyle, className)}>
        <Icon
          icon={'hourglass_top'}
          opsz="xs"
          className={css({ marginRight: space_sm })}
          title={i18n.authentication.info.pendingInvitation + '...'}
        />
        {member?.displayName}
      </Flex>
    );
  } else if (user == 'LOADING' || user == null) {
    return <InlineLoading />;
  } else if (user == 'ERROR') {
    return <Icon icon={'skull'} />;
  } else {
    return (
      <Flex className={cx(text_xs, className)}>
        {currentUser?.id === member?.userId ? (
          <DiscreetInput
            value={user.commonname || undefined}
            placeholder={i18n.authentication.field.username}
            onChange={updateDisplayName}
            inputDisplayClassName={cx(text_xs, text_semibold, className)}
            readOnly={readOnly}
          />
        ) : (
          <>
            {user.commonname} || <p className={lightTextStyle}>No username</p>
          </>
        )}
      </Flex>
    );
  }
}
