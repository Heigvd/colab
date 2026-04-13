/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useParams } from 'react-router-dom';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCard, useCardContent } from '../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../store/selectors/projectSelector';
import { p_md, space_xs } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import { PresenceContext } from '../presence/PresenceContext';

////////////////////////////////////////////////////////////////////////////////////////////////////

interface CardWrapperProps {
  children: (card: Card, variant: CardContent) => JSX.Element;
  grow?: number;
  align?: 'center' | 'normal';
  //backButtonPath: string;
}

export default function CardWrapper({
  children,
  grow,
  align,
}: //backButtonPath,
CardWrapperProps): JSX.Element {
  const { cardId: id, vId } = useParams<'cardId' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();

  const card = useCard(cardId);
  const cardContent = useCardContent(cardContentId);

  const { project: currentProject } = useAppSelector(selectCurrentProject);

  const { touch } = React.useContext(PresenceContext);

  React.useEffect(() => {
    touch({
      cardId: cardId,
      cardContentId: cardContentId,
    });
  }, [touch, cardContentId, cardId]);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (
    card == null ||
    card === 'LOADING' ||
    currentProject == null ||
    cardContent == null ||
    cardContent === 'LOADING'
  ) {
    return <InlineLoading />;
  }

  return (
    <>
      <Flex
        direction="column"
        grow={grow}
        align={align}
        className={cx(p_md, css({ paddingTop: space_xs, alignItems: 'stretch', overflow: 'auto' }))}
      >
        {children(card, cardContent)}
      </Flex>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
