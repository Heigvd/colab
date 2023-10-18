/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import Flex from '../common/layout/Flex';
import { p_sm, space_sm } from '../../styling/style';
import Button from '../common/element/Button';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';

interface CardEditorDeletedBannerProps {
  cardId: number;
  readOnly?: boolean;
}

const bannerStyle = css({
  padding: '0 ' + space_sm,
  color: 'var(--white)',
  backgroundColor: 'var(--error-main)',
});

const infoStyle = p_sm;

const actionStyle = cx(
  p_sm,
  css({
    gap: space_sm,
  }),
);

const buttonStyle = css({
  backgroundColor: 'var(--error-main)',
  color: 'var(--white)',
  borderColor: 'var(--white)',
});

export function CardEditorDeletedBanner({
  cardId,
  readOnly,
}: CardEditorDeletedBannerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  return (
    <Flex justify="space-between" align="center" className={bannerStyle}>
      <Flex className={infoStyle}>{i18n.common.trash.info.isInTrash.card}</Flex>
      {!readOnly && (
        <Flex className={actionStyle}>
          <Button
            icon="restore_from_trash"
            kind="outline"
            theme="error"
            className={buttonStyle}
            onClick={() => {
              dispatch(API.restoreCardFromTrash(cardId));
            }}
          >
            {i18n.common.trash.action.restore}
          </Button>
          <Button
            icon="delete_forever"
            kind="outline"
            theme="error"
            className={buttonStyle}
            onClick={() => {
              dispatch(API.deleteCardForever(cardId));
            }}
          >
            {i18n.common.trash.action.deleteForever}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
