/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { isCardAlive, useIsAnyAncestorDeleted } from '../../store/selectors/cardSelector';
import { p_sm, space_sm } from '../../styling/style';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import { useCanCardDeletionStatusBeChanged } from './cardRightsHooks';
import { deleteForeverDefaultIcon, restoreFromBinDefaultIcon } from '../../styling/IconDefault';

////////////////////////////////////////////////////////////////////////////////////////////////////
// props

interface CardEditorDeletedBannerProps {
  card: Card;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// style

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

////////////////////////////////////////////////////////////////////////////////////////////////////
// component

export function CardEditorDeletedBanner({ card }: CardEditorDeletedBannerProps): JSX.Element {
  const isAnyAncestorDead = useIsAnyAncestorDeleted(card);

  if (!isCardAlive(card)) {
    return <SelfDeadBanner card={card} />
  } else if (isAnyAncestorDead) {
    return <AnyAncestorDeadBanner />
  }

  return <></>;
}

export function SelfDeadBanner({ card }: CardEditorDeletedBannerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const canChangeDeletionStatus = useCanCardDeletionStatusBeChanged({ card });

  return (
    <Flex justify="space-between" align="center" className={bannerStyle}>
      <Flex className={infoStyle}>{i18n.common.bin.info.isInBin.card}</Flex>
      {!canChangeDeletionStatus && (
        <Flex className={actionStyle}>
          <Button
            icon={restoreFromBinDefaultIcon}
            kind="outline"
            theme="error"
            className={buttonStyle}
            onClick={() => {
              dispatch(API.restoreCardFromBin(card));
            }}
          >
            {i18n.common.bin.action.restore}
          </Button>
          <Button
            icon={deleteForeverDefaultIcon}
            kind="outline"
            theme="error"
            className={buttonStyle}
            onClick={() => {
              dispatch(API.deleteCardForever(card));
            }}
          >
            {i18n.common.bin.action.deleteForever}
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export function AnyAncestorDeadBanner(): JSX.Element {
  const i18n = useTranslations();

  return (
    <Flex justify="space-between" align="center" className={bannerStyle}>
      <Flex className={infoStyle}>{i18n.common.bin.info.isInBin.card}</Flex>
    </Flex>);
}
