/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslations from '../../i18n/I18nContext';
import { space_lg } from '../../styling/style';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import PublicEntranceContainer from './PublicEntranceContainer';

export default function ResetPasswordSent(): JSX.Element {
  const i18n = useTranslations();
  const navigate = useNavigate();

  return (
    <PublicEntranceContainer>
      <Flex direction="column">
        <h3>{i18n.authentication.info.checkYourMailbox}</h3>
        <p className={css({ textAlign: 'left' })}>{i18n.authentication.info.resetPasswordSent}</p>
        <Button onClick={() => navigate('/')} className={css({ marginTop: space_lg })}>
          {i18n.common.action.backToHome}
        </Button>
      </Flex>
    </PublicEntranceContainer>
  );
}
