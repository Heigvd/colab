/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCard, useCardContent } from '../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../store/selectors/projectSelector';
import { p_md } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import { PresenceContext } from '../presence/PresenceContext';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';

////////////////////////////////////////////////////////////////////////////////////////////////////

interface CardWrapperProps {
  kind: 'zoom' | 'edit';
  children: (card: Card, variant: CardContent) => JSX.Element;
  touchMode: 'zoom' | 'edit';
  grow?: number;
  align?: 'center' | 'normal';
  backButtonPath: string;
}

export default function CardWrapper(props: CardWrapperProps): JSX.Element {
  const { id, vId } = useParams<'id' | 'vId'>();
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
      context: props.touchMode,
    });
  }, [touch, cardContentId, cardId, props.touchMode]);

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

  switch (props.kind) {
    case 'zoom':
      return <CardZoomWrapper {...props} card={card} cardContent={cardContent} />;
    case 'edit':
      return <CardEditionWrapper {...props} card={card} cardContent={cardContent} />;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

type CardZoomProps = CardWrapperProps & { card: Card; cardContent: CardContent };

function CardZoomWrapper({
  card,
  cardContent,
  children,
  grow = 1,
  align = 'normal',
}: CardZoomProps): JSX.Element {
  return (
    <>
      <ProjectBreadcrumbs card={card} cardContent={cardContent} />
      <Flex
        direction="column"
        grow={grow}
        align={align}
        className={cx(p_md, css({ alignItems: 'stretch', overflow: 'auto' }))}
      >
        {children(card, cardContent)}
      </Flex>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

type CardEditionProps = CardWrapperProps & { card: Card; cardContent: CardContent };

function CardEditionWrapper({
  card,
  cardContent,
  children,
  grow = 1,
  align = 'normal',
  backButtonPath,
}: CardEditionProps): JSX.Element {
  const navigate = useNavigate();

  return (
    <>
      <Modal
        title={<ProjectBreadcrumbs card={card} cardContent={cardContent} />}
        size="full"
        //TO IMPROVE
        onClose={() => navigate(backButtonPath)}
        showCloseButton
      >
        {() => (
          <>
            <Flex
              direction="column"
              grow={grow}
              align={align}
              className={css({ width: '100%', alignItems: 'stretch', overflow: 'auto' })}
            >
              {children(card, cardContent)}
            </Flex>
          </>
        )}
      </Modal>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////
