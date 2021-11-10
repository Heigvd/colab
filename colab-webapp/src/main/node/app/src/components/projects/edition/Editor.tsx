/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as API from '../../../API/api';
import { sortCardContents } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import {
  Ancestor,
  useAncestors,
  useCard,
  useCardContent,
  useVariantsOrLoad,
} from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import CardTypeList from '../../cards/cardtypes/CardTypeList';
import ContentSubs from '../../cards/ContentSubs';
import Clickable from '../../common/Clickable';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import { SecondLevelLink } from '../../common/Link';
import Team from '../Team';
import ActivityFlowChart from './ActivityFlowChart';
import Hierarchy from './Hierarchy';

const Ancestor = ({ card, content }: Ancestor): JSX.Element => {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (typeof card === 'number') {
      dispatch(API.getCard(card));
    }

    if (typeof content === 'number') {
      dispatch(API.getCardContent(content));
    }
  }, [card, content, dispatch]);

  if (entityIs(card, 'Card') && card.rootCardProjectId != null) {
    return (
      <>
        <Clickable
          onClick={() => {
            navigate('..');
          }}
        >
          project
        </Clickable>
        &nbsp;&gt;&nbsp;
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    const t = match ? match[1] || 'card' : 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
        >
          {card.title ? card.title : i18n.card.untitled}/{content.title ? content.title : ''}
        </Clickable>
        &nbsp;&gt;&nbsp;
      </>
    );
  } else {
    return <InlineLoading />;
  }
};

/**
 * use default cardContent
 */
export function useDefaultVariant(cardId: number): 'LOADING' | CardContent {
  const dispatch = useAppDispatch();
  const card = useCard(cardId);

  const variants = useVariantsOrLoad(card !== 'LOADING' ? card : undefined);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (card === 'LOADING' || card == null || variants == null) {
    return 'LOADING';
  } else if (variants.length === 0) {
    return 'LOADING';
  } else {
    return sortCardContents(variants)[0]!;
  }
}

/**
 * Fetch card id from route and redirect to default variant
 */
const DefaultVariantDetector = (): JSX.Element => {
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
  grow?: number;
  align?: 'center' | 'normal';
}

const CardWrapper = ({ children, grow = 1, align = 'normal' }: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);

  React.useEffect(() => {
    if (card === undefined && cardId) {
      dispatch(API.getCard(cardId));
    }
  }, [card, cardId, dispatch]);

  if (
    card == null ||
    card === 'LOADING' ||
    project == null ||
    content == null ||
    content === 'LOADING'
  ) {
    return <InlineLoading />;
  } else {
    return (
      <>
        <div>
          {ancestors.map((ancestor, x) => (
            <Ancestor key={x} card={ancestor.card} content={ancestor.content} />
          ))}
        </div>
        <Flex direction="column" grow={grow} align={align}>
          {children(card, content)}
        </Flex>
      </>
    );
  }
};

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { project, status } = useProjectBeingEdited();

  const root = useAppSelector(state => {
    if (project != null && project.rootCardId != null) {
      const rootState = state.cards.cards[project.rootCardId];
      if (rootState) {
        return rootState.card;
      }
    } else {
      return null;
    }
  });

  const rootContent = useAppSelector(state => {
    if (root != null && root.id != null) {
      const card = state.cards.cards[root.id];
      if (card != null) {
        if (card.contents === undefined) {
          return undefined;
        } else if (card.contents === null) {
          return null;
        } else {
          const contents = Object.values(card.contents);
          if (contents.length === 0) {
            return null;
          } else {
            return state.cards.contents[contents[0]!]!.content;
          }
        }
      }
    }
  });

  React.useEffect(() => {
    if (root != null && root.id != null && rootContent === undefined) {
      dispatch(API.getCardContents(root.id));
    }
  }, [dispatch, root, root?.id, rootContent]);

  if (status == 'LOADING') {
    return <InlineLoading />;
  } else if (project == null || project.id == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY' || root == null || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <div
          className={css({
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <h3>Edit project "{project.name}"</h3>
          <nav>
            <SecondLevelLink to="">Project</SecondLevelLink>
            <SecondLevelLink to="hierarchy">Hierarchy</SecondLevelLink>
            <SecondLevelLink to="flow">Activity Flow</SecondLevelLink>
            <SecondLevelLink to="defs">Card Types</SecondLevelLink>
            <SecondLevelLink to="team">Team</SecondLevelLink>
          </nav>
          <IconButton
            iconSize="2x"
            onClick={() => {
              // make sure to go back to projects page before closing project
              // to avoid infinite loop
              navigate('/projects');
              dispatch(API.closeCurrentProject());
            }}
            icon={faTimes}
          />
        </div>
        <Flex direction="column" grow={1}>
          <Routes>
            <Route path="team" element={<Team project={project} />} />
            <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
            <Route path="flow" element={<ActivityFlowChart />} />
            <Route path="defs" element={<CardTypeList />} />
            <Route path="card/:id" element={<DefaultVariantDetector />} />
            <Route
              path="card/:id/v/:vId/*"
              element={
                <CardWrapper grow={0} align="center">
                  {card => <CardThumbWithSelector depth={2} card={card} />}
                </CardWrapper>
              }
            />
            <Route path="edit/:id" element={<DefaultVariantDetector />} />
            <Route
              path="edit/:id/v/:vId/*"
              element={
                <CardWrapper>
                  {(card, variant) => <CardEditor card={card} variant={variant} showSubcards />}
                </CardWrapper>
              }
            />
            <Route
              path="*"
              element={
                <div>
                  {rootContent != null ? (
                    <ContentSubs showEmptiness={true} depth={2} cardContent={rootContent} />
                  ) : (
                    <InlineLoading />
                  )}
                </div>
              }
            />
          </Routes>
        </Flex>
      </div>
    );
  }
}
