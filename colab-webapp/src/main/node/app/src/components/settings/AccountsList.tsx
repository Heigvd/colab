/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { User } from 'colab-rest-client';
import * as React from 'react';
import { useUserAccounts } from '../../store/selectors/userSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import LocalAccountPanel from './LocalAccountPanel';

interface AccountsListProps {
  user: User;
}

export default function AccountsList({ user }: AccountsListProps): JSX.Element {
  // Note : in fact, it works only for the current user
  // because the front-side does not load account data for another user
  const accounts = useUserAccounts(user.id);

  if (accounts === 'LOADING') {
    return <AvailabilityStatusIndicator status="LOADING" />;
  }

  return (
    <>
      {accounts.map(account => {
        if (account.id != null && +account.id >= 0) {
          return <LocalAccountPanel key={account.id} account={account} />;
        }
      })}
    </>
  );
}
