/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import Flex from '../common/Flex';
import PublicEntranceContainer from './PublicEntranceContainer';

export default function ResetPasswordSent(): JSX.Element {
  const i18n = useTranslations();

  return (
    <PublicEntranceContainer>
      <Flex direction="column">
        <h3>{i18n.common.label.checkYourMailbox}</h3>
        <p>{i18n.authentication.info.resetPasswordSent}</p>
      </Flex>
    </PublicEntranceContainer>
  );
}
