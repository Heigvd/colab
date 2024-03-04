/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { addNotification } from '../../store/slice/notificationSlice';
import { putInBinDefaultIcon } from '../../styling/IconDefault';
import DropDownMenu, { entryStyle } from '../common/layout/DropDownMenu';
import { getCardTitle } from './CardTitle';

interface DeletionChoiceCardAndContentProps {
  card: Card;
  cardContent: CardContent;
}

export default function DeletionChoiceCardAndContent({
  card,
  cardContent,
}: DeletionChoiceCardAndContentProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  return (
    <DropDownMenu
      icon={putInBinDefaultIcon}
      buttonLabel={i18n.common.bin.action.moveToBin}
      direction="left"
      className={css({ alignItems: 'stretch' })}
      buttonClassName={entryStyle}
      entries={[
        {
          value: 'putVariantInBin',
          label: i18n.modules.card.theVariant,
          action: () => {
            if (cardContent != null) {
              dispatch(API.putCardContentInBin(cardContent));
              dispatch(
                addNotification({
                  status: 'OPEN',
                  type: 'INFO',
                  message: i18n.common.bin.info.movedToBin.variant(cardContent.title),
                }),
              );
            }
          },
        },
        {
          value: 'putCardInBin',
          label: i18n.modules.card.theCard,
          action: () => {
            dispatch(API.putCardInBin(card));
            dispatch(
              addNotification({
                status: 'OPEN',
                type: 'INFO',
                message: i18n.common.bin.info.movedToBin.card(getCardTitle({ card, i18n })),
              }),
            );
          },
        },
      ]}
    />
  );
}
