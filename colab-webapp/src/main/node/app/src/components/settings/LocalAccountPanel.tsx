/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { LocalAccount } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { space_md } from '../../styling/style';
import { LabeledInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import ChangePasswordPanel from './LocalAccountPasswordPanel';

export interface LocalAccountProps {
  account: LocalAccount;
}

export default function LocalAccount({ account }: LocalAccountProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex direction="column" gap={space_md}>
      <LabeledInput
        value={account.email}
        label={i18n.authentication.label.account}
        readOnly
        onChange={() => {
          /* never change the username */
        }}
      />
      <ChangePasswordPanel account={account} />
    </Flex>
  );
}
