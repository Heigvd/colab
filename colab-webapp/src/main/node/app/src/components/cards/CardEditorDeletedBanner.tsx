/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { isCardAlive, useIsAnyAncestorDeleted } from '../../store/selectors/cardSelector';
import { deleteForeverDefaultIcon, restoreFromBinDefaultIcon } from '../../styling/IconDefault';
import {
  deletedBannerActionStyle,
  deletedBannerButtonStyle,
  deletedBannerInfoStyle,
  deletedBannerStyle,
} from '../../styling/style';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import { useCanCardDeletionStatusBeChanged } from './cardRightsHooks';

////////////////////////////////////////////////////////////////////////////////////////////////////
// props

interface CardEditorDeletedBannerProps {
  card: Card;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// component

export function CardEditorDeletedBanner({ card }: CardEditorDeletedBannerProps): JSX.Element {
  const isAnyAncestorDead = useIsAnyAncestorDeleted(card);

  if (!isCardAlive(card)) {
    return <SelfDeadBanner card={card} />;
  } else if (isAnyAncestorDead) {
    return <AnyAncestorDeadBanner />;
  }

  return <></>;
}

export function SelfDeadBanner({ card }: CardEditorDeletedBannerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const canChangeDeletionStatus = useCanCardDeletionStatusBeChanged({ card });

  return (
    <Flex justify="space-between" align="center" className={deletedBannerStyle}>
      <Flex className={deletedBannerInfoStyle}>{i18n.common.bin.info.isInBin.card}</Flex>
      {canChangeDeletionStatus && (
        <Flex className={deletedBannerActionStyle}>
          <Button
            icon={restoreFromBinDefaultIcon}
            kind="outline"
            theme="error"
            className={deletedBannerButtonStyle}
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
            className={deletedBannerButtonStyle}
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
    <Flex justify="space-between" align="center" className={deletedBannerStyle}>
      <Flex className={deletedBannerInfoStyle}>{i18n.common.bin.info.isInBin.card}</Flex>
    </Flex>
  );
}
