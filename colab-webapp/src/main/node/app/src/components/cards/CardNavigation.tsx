/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../API/api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useCard, useCardContent, useDefaultVariant } from '../../store/selectors/cardSelector';
import { selectCurrentProject } from '../../store/selectors/projectSelector';
import { p_md } from '../../styling/style';
import InlineLoading from '../common/element/InlineLoading';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import { PresenceContext } from '../presence/PresenceContext';
import ProjectBreadcrumbs from '../projects/ProjectBreadcrumbs';

/**
 * Fetch card id from route and redirect to default variant
 */
export const DefaultVariantDetector = (): JSX.Element => {
  const { id } = useParams<'id'>();
  const cardId = +id!;

  const variant = useDefaultVariant(cardId);

  if (entityIs(variant, 'CardContent')) {
    return <Navigate to={`v/${variant.id}`} />;
  } else {
    return <InlineLoading />;
  }
};

interface CardWrapperProps {
  children: (card: Card, variant: CardContent) => JSX.Element;
  touchMode: 'zoom' | 'edit';
  grow?: number;
  align?: 'center' | 'normal';
  backButtonPath: string;
}

export const CardWrapper = ({
  children,
  grow = 1,
  align = 'normal',
  touchMode,
}: CardWrapperProps): JSX.Element => {
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
      context: touchMode,
    });
  }, [touch, cardContentId, cardId, touchMode]);

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
  } else {
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
};

export const CardEditWrapper = ({
  children,
  grow = 1,
  align = 'normal',
  touchMode,
  backButtonPath,
}: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const card = useCard(cardId);
  const cardContent = useCardContent(cardContentId);

  const { project: currentProject } = useAppSelector(selectCurrentProject);

  const { touch } = React.useContext(PresenceContext);

  React.useEffect(() => {
    touch({
      cardId: cardId,
      cardContentId: cardContentId,
      context: touchMode,
    });
  }, [touch, cardContentId, cardId, touchMode]);

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
  } else {
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
};
