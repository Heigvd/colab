/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import Flex from '../common/layout/Flex';
import CardThumb from './CardThumb';

interface CardEditorSubCardsProps {
  card: Card;
  cardContent: CardContent;
  //readOnly?: boolean;
}
export default function CardEditorSubCards({
  card,
  cardContent,
}: //readOnly,
CardEditorSubCardsProps): JSX.Element {
  const variants = useVariantsOrLoad(card) || [];

  return (
    <>
      <Flex className={css({ width: '100%', overflow: 'auto', flexGrow: 1 })}>
        <CardThumb
          card={card}
          variant={cardContent}
          variants={variants}
          showSubcards={true}
          depth={2}
          mayOrganize={true}
          showPreview={false}
          withoutHeader={true}
          coveringColor={false}
          showAllSubCards
        />
      </Flex>
    </>
  );
}
