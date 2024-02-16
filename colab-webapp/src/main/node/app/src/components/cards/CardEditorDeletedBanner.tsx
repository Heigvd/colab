/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useIsAnyAncestorDeleted } from '../../store/selectors/cardSelector';
import { isAlive } from '../../store/storeHelper';
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
  cardContent: CardContent;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// component

export function CardEditorDeletedBanner({
  card,
  cardContent,
}: CardEditorDeletedBannerProps): JSX.Element {
  const isAnyAncestorDead = useIsAnyAncestorDeleted(card);

  if (!isAlive(card) || !isAlive(cardContent)) {
    return <SelfDeadBanner card={card} cardContent={cardContent} />;
  } else if (isAnyAncestorDead) {
    return <AnyAncestorDeadBanner />;
  }

  return <></>;
}

export function SelfDeadBanner({ card, cardContent }: CardEditorDeletedBannerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const canChangeDeletionStatus = useCanCardDeletionStatusBeChanged({ card });

  const handleCardDeletion = !isAlive(card);
  const handleCardContentDeletion = isAlive(card) && !isAlive(cardContent);

  return (
    <Flex justify="space-between" align="center" className={deletedBannerStyle}>
      <Flex className={deletedBannerInfoStyle}>
        {handleCardDeletion && i18n.common.bin.info.isInBin.card}{' '}
        {handleCardContentDeletion && i18n.common.bin.info.isInBin.variant}
      </Flex>
      {canChangeDeletionStatus && (
        <Flex className={deletedBannerActionStyle}>
          <Button
            icon={restoreFromBinDefaultIcon}
            kind="outline"
            theme="error"
            className={deletedBannerButtonStyle}
            onClick={() => {
              if (handleCardDeletion) {
                dispatch(API.restoreCardFromBin(card));
              }
              if (handleCardContentDeletion) {
                dispatch(API.restoreCardContentFromBin(cardContent));
              }
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
              if (handleCardDeletion) {
                dispatch(API.deleteCardForever(card));
              }
              if (handleCardContentDeletion) {
                dispatch(API.deleteCardContentForever(cardContent));
              }
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
