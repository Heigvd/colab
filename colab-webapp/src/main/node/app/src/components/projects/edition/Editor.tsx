/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faClone, faCog, faEye, faNetworkWired, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
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
  useProjectRootCard,
  useVariantsOrLoad,
} from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import CardTypeList from '../../cards/cardtypes/CardTypeList';
import ContentSubs from '../../cards/ContentSubs';
import AutoSaveInput from '../../common/AutoSaveInput';
import Clickable from '../../common/Clickable';
import DropDownMenu from '../../common/DropDownMenu';
import Flex from '../../common/Flex';
import IconButton from '../../common/IconButton';
import InlineLoading from '../../common/InlineLoading';
import { invertedThemeMode, space_M } from '../../styling/style';
import Team from '../Team';
import ActivityFlowChart from './ActivityFlowChart';
import Hierarchy from './Hierarchy';

export const depthMax = 2;
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

  const { project, status } = useProjectBeingEdited();
  const navigate = useNavigate();

  const root = useProjectRootCard(project);

  const rootContent = useAppSelector(state => {
    if (entityIs(root, 'Card') && root.id != null) {
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
    if (entityIs(root, 'Card') && root.id != null && rootContent === undefined) {
      dispatch(API.getCardContents(root.id));
    }
  }, [dispatch, root, rootContent]);

  if (status == 'LOADING') {
    return <InlineLoading />;
  } else if (project == null || project.id == null) {
    return (
      <div>
        <i>Error: no project selected</i>
      </div>
    );
  } else if (status != 'READY' || typeof root === 'string' || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <>
        <div
          className={cx(invertedThemeMode, css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `${space_M} ${space_M}` ,
            backgroundColor: 'var(--hoverBgColor)',
          }))}
        >
            <div className={css({ gridColumn: '2/3', placeSelf: 'center', display:'flex'})}>
              <div className={css({marginRight: '30px'})}>
              <AutoSaveInput
                placeholder="unnamed"
                value={project.name || ''}
                onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              />
              </div>
              <DropDownMenu
              icon={faEye}
              valueComp={{value: '', label: ""}}
              entries={[
                {value: './', label: <><IconButton icon={faClone}/> Project</>},
                {value: './hierarchy', label: <><IconButton icon={faNetworkWired}/> Hierarchy</>},
                {value: './flow', label: <><IconButton icon={faProjectDiagram}/> Activity Flow</>},
              ]}
              onSelect={(val)=>{
                val.action != null ? val.action() : navigate(val.value)}}
              buttonClassName={css({textAlign: 'right', alignSelf: 'center', marginLeft: 'auto'})}
              menuIcon="CARET"
            />
            </div>
            <DropDownMenu
              icon={faCog}
              valueComp={{value: '', label: ""}}
              entries={[
                {value: './defs', label: "Card Types"},
                {value: './team', label: "Team"},
              ]}
              onSelect={(val)=>{
                val.action != null ? val.action() : navigate(val.value)}}
              buttonClassName={css({textAlign: 'right', alignSelf: 'center', marginLeft: 'auto'})}
              menuIcon="CARET"
            />
        </div>
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          overflow: 'auto',
        })}
      >
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
                    <ContentSubs showEmptiness={true} depth={depthMax} cardContent={rootContent} />
                  ) : (
                    <InlineLoading />
                  )}
                </div>
              }
            />
          </Routes>
        </Flex>
      </div>
      </>
    );
  }
}
