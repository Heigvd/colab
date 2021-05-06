/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../../API/api';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../../common/IconButton';
import { HashRouter as Router, Route, Switch, useHistory, useParams } from 'react-router-dom';
import { css } from '@emotion/css';
import InlineLoading from '../../common/InlineLoading';
import ContentSubs from '../../cards/ContentSubs';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { SecondLevelLink } from '../../common/Link';
import Hierachy from './Hierachy';
import { useAncestors, useCard, Ancestor } from '../../../selectors/cardSelector';
import { Card, entityIs } from 'colab-rest-client';
import Clickable from '../../common/Clickable';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import CardEditor from '../../cards/CardEditor';
import VariantSelector from '../../cards/VariantSelector';
import CardDefList from '../../cards/carddefs/CardDefList';
import WithToolbar from '../../common/WithToolbar';
import CardCreator from '../../cards/CardCreator';

const Ancestor = ({ card, content }: Ancestor): JSX.Element => {
  const history = useHistory();
  const dispatch = useAppDispatch();

  if (typeof card === 'number') {
    dispatch(API.getCard(card));
  }

  if (typeof content === 'number') {
    dispatch(API.getCardContent(content));
  }

  if (entityIs(card, 'Card') && card.rootCardProjectId != null) {
    return (
      <>
        <Clickable
          onClick={() => {
            history.push('../..');
          }}
        >
          project
        </Clickable>
        &nbsp;&gt;&nbsp;
      </>
    );
  } else if (entityIs(content, 'CardContent')) {
    return (
      <>
        <Clickable
          onClick={() => {
            history.push('' + content.cardId);
          }}
        >
          {content.title ? content.title : 'unnamed card'}
        </Clickable>
        &nbsp;&gt;&nbsp;
      </>
    );
  } else {
    return <InlineLoading />;
  }
};

interface CardWrapperProps {
  children: (card: Card) => JSX.Element;
}

const CardWrapper = ({ children }: CardWrapperProps): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const cardId = +id;

  const dispatch = useAppDispatch();
  const card = useCard(cardId);
  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);

  if (card === undefined) {
    dispatch(API.getCard(cardId));
  }

  if (card == null || card === 'LOADING' || project == null) {
    return <InlineLoading />;
  } else {
    return (
      <>
        {ancestors.map((ancestor, x) => (
          <Ancestor key={x} card={ancestor.card} content={ancestor.content} />
        ))}
        {children(card)}
      </>
    );
  }
};

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const history = useHistory();

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

  if (root != null && root.id != null && rootContent === undefined) {
    dispatch(API.getCardContents(root.id));
  }

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
      <Router basename={`/editor/${project.id}`}>
        <div>
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
              <SecondLevelLink exact to="/">
                Project
              </SecondLevelLink>
              <SecondLevelLink to="/hierarchy">Hierarchy</SecondLevelLink>
              <SecondLevelLink to="/defs">Card Types</SecondLevelLink>
            </nav>
            <IconButton
              iconSize="2x"
              onClick={() => {
                // make sure to go back to projects page before closing project
                // to avoid infinite loop
                history.push('/projects');
                dispatch(API.closeCurrentProject());
              }}
              icon={faTimes}
            />
          </div>
          <Switch>
            <Route exact path="/hierarchy">
              <Hierachy rootId={root.id} />
            </Route>
            <Route exact path="/defs">
              <CardDefList />
            </Route>
            <Route exact path="/card/:id">
              <CardWrapper>{card => <CardThumbWithSelector depth={2} card={card} />}</CardWrapper>
            </Route>
            <Route exact path="/edit/:id">
              <CardWrapper>
                {card => (
                  <VariantSelector card={card}>
                    {(variant, list) => (
                      <CardEditor
                        card={card}
                        variant={variant}
                        variants={list}
                        showSubcards={true}
                      />
                    )}
                  </VariantSelector>
                )}
              </CardWrapper>
            </Route>
            <Route>
              <div>
                {rootContent != null ? (
                  <WithToolbar toolbar={<CardCreator parent={rootContent} />}>
                    <ContentSubs showEmptiness={true} depth={2} cardContent={rootContent} />
                  </WithToolbar>
                ) : (
                  <InlineLoading />
                )}
              </div>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}
