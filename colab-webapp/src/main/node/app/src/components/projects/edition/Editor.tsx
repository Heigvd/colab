/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faChevronRight,
  faClone,
  faCog,
  faEye,
  faGrip,
  faNetworkWired,
  faProjectDiagram,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, entityIs, Project } from 'colab-rest-client';
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
import ProjectCardTypeList from '../../cards/cardtypes/ProjectCardTypeList';
import ContentSubs from '../../cards/ContentSubs';
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import IllustrationDisplay, {
  IllustrationIconDisplay,
} from '../../common/element/IllustrationDisplay';
import InlineLoading from '../../common/element/InlineLoading';
import Clickable from '../../common/layout/Clickable';
import DropDownMenu from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import { UserDropDown } from '../../MainNav';
import {
  fullPageStyle,
  invertedThemeMode,
  linkStyle,
  space_L,
  space_M,
  space_S,
} from '../../styling/style';
import { defaultProjectIllustration } from '../ProjectCommon';
import { ProjectSettings } from '../ProjectSettings';
import Team from '../Team';
import ActivityFlowChart from './ActivityFlowChart';
import Hierarchy from './Hierarchy';

export const depthMax = 2;
const descriptionStyle = {
  backgroundColor: 'var(--fgColor)',
  color: 'var(--bgColor)',
  gap: space_L,
  transition: 'all 1s ease',
  overflow: 'visible',
  fontSize: '0.9em',
  flexGrow: 0,
};
const openDetails = css({
  ...descriptionStyle,
  maxHeight: '1000px',
  padding: space_L,
});
const closeDetails = css({
  ...descriptionStyle,
  maxHeight: '0px',
  padding: '0 ' + space_L,
  overflow: 'hidden',
});

const breadCrumbsStyle = css({
  fontSize: '.8em',
  color: 'var(--darkGray)',
  margin: '0 ' + space_S,
  alignSelf: 'center',
});
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
          clickableClassName={cx(linkStyle, breadCrumbsStyle)}
        >
          project
        </Clickable>
        <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />
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
          clickableClassName={cx(linkStyle, breadCrumbsStyle)}
        >
          {card.title ? card.title : i18n.card.untitled}
        </Clickable>
        <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />
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
  backButtonPath: (card: Card, variant: CardContent) => string;
  backButtonTitle: string;
  grow?: number;
  align?: 'center' | 'normal';
}

const CardWrapper = ({
  children,
  grow = 1,
  align = 'normal',
  backButtonPath,
  backButtonTitle,
}: CardWrapperProps): JSX.Element => {
  const { id, vId } = useParams<'id' | 'vId'>();
  const cardId = +id!;
  const cardContentId = +vId!;

  const dispatch = useAppDispatch();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);
  const navigate = useNavigate();

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
        <Flex className={css({ paddingBottom: space_M })}>
          <IconButton
            icon={faArrowLeft}
            title={backButtonTitle}
            iconColor="var(--darkGray)"
            onClick={() => navigate(backButtonPath(card, content))}
            className={css({ marginRight: space_M })}
          />
          {ancestors.map((ancestor, x) => (
            <Ancestor key={x} card={ancestor.card} content={ancestor.content} />
          ))}
        </Flex>
        <Flex
          direction="column"
          grow={grow}
          align={align}
          className={css({ width: '100%', alignItems: 'stretch' })}
        >
          {children(card, content)}
        </Flex>
      </>
    );
  }
};

interface EditorNavProps {
  project: Project;
  setShowProjectDetails: (value: React.SetStateAction<boolean>) => void;
}

function EditorNav({ project, setShowProjectDetails }: EditorNavProps): JSX.Element {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  return (
    <>
      <div
        className={cx(
          invertedThemeMode,
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `${space_S} ${space_M}`,
            //backgroundColor: 'var(--hoverBgColor)',
          }),
        )}
      >
        <IconButton
          icon={faGrip}
          title="Back to projects"
          onClick={events => {
            events.preventDefault();
            navigate('../../');
            dispatch(API.closeCurrentProject());
          }}
          className={css({ display: 'flex', alignItems: 'center' })}
        />
        <div
          className={css({
            gridColumn: '2/3',
            placeSelf: 'center',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Button
            onClick={() => setShowProjectDetails(showProjectDetails => !showProjectDetails)}
            title="Show project details"
            className={css({ padding: '2px' })}
          >
            <Flex align="stretch">
              <Flex
                align="center"
                className={css({
                  backgroundColor: project.illustration?.iconBkgdColor,
                  padding: '3px 5px',
                  borderRadius: '3px',
                })}
              >
                <IllustrationIconDisplay
                  illustration={
                    project.illustration ? project.illustration : defaultProjectIllustration
                  }
                  iconColor="#fff"
                />
              </Flex>
              <div className={css({ padding: '0 ' + space_S })}>
                {project.name || 'New project'}
              </div>
            </Flex>
          </Button>
          <DropDownMenu
            icon={faEye}
            valueComp={{ value: '', label: '' }}
            entries={[
              {
                value: 'board',
                label: (
                  <>
                    <FontAwesomeIcon icon={faClone} /> Board
                  </>
                ),
                action: () => navigate('./'),
              },
              {
                value: 'hierarchy',
                label: (
                  <>
                    <FontAwesomeIcon icon={faNetworkWired} /> Hierarchy
                  </>
                ),
                action: () => navigate('./hierarchy'),
              },
              {
                value: 'flow',
                label: (
                  <>
                    <FontAwesomeIcon icon={faProjectDiagram} /> Activity Flow
                  </>
                ),
                action: () => navigate('./flow'),
              },
            ]}
            buttonClassName={css({ textAlign: 'right', alignSelf: 'center', marginLeft: 'auto' })}
            menuIcon="CARET"
          />
        </div>
        <Flex align='center'>
          <IconButton
            onClick={() => navigate('./project-settings')}
            title="Settings"
            icon={faCog}
            className={css({ textAlign: 'right', alignSelf: 'center', marginLeft: 'auto' })}
          />{' '}
          <UserDropDown onlyLogout />{' '}
        </Flex>
      </div>
    </>
  );
}

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useProjectBeingEdited();

  const root = useProjectRootCard(project);
  const [showProjectDetails, setShowProjectDetails] = React.useState(false);

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
    if (window && window.top && window.top.document) {
      if (project) {
        if (project.name) {
          window.top.document.title = 'co.LAB - ' + project?.name;
        }
      } else {
        window.top.document.title = 'co.LAB';
      }
    }
  }, [project, project?.name]);

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
      <Flex direction="column" align="stretch" grow={1} className={fullPageStyle}>
        <EditorNav project={project} setShowProjectDetails={setShowProjectDetails} />
        <Flex className={showProjectDetails ? openDetails : closeDetails}>
          <Flex justify="space-between" grow={1}>
            <Flex gap={space_M}>
              <IllustrationDisplay
                illustration={
                  project.illustration ? project.illustration : defaultProjectIllustration
                }
                className={css({ width: 'auto', padding: space_L, borderRadius: '50%' })}
              />
              <div>
                <div>
                  <h3>{project.name}</h3>
                  {project.description}
                </div>
                <div>
                  <p>Created by: {project.trackingData?.createdBy}</p>
                  <p>Created date: {i18n.common.datetime(project.trackingData?.creationDate)}</p>
                  {/* more infos? Add project team names */}
                </div>
              </div>
            </Flex>
            <IconButton
              icon={faTimes}
              title={i18n.common.close}
              onClick={() => setShowProjectDetails(false)}
            />
          </Flex>
        </Flex>
        <Flex
          direction="column"
          grow={1}
          align="stretch"
          className={css({
            padding: space_L,
            overflow: 'auto',
          })}
        >
          <Routes>
            <Route path="settings" element={<ProjectSettings project={project} />} />
            <Route path="project-settings/*" element={<ProjectSettings project={project} />} />
            <Route path="team" element={<Team project={project} />} />
            <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
            <Route path="flow" element={<ActivityFlowChart />} />
            <Route path="types/*" element={<ProjectCardTypeList />} />
            <Route path="card/:id" element={<DefaultVariantDetector />} />
            {/* Zooom on a card */}
            <Route
              path="card/:id/v/:vId/*"
              element={
                <CardWrapper
                  grow={0}
                  align="center"
                  backButtonPath={() => '../'}
                  backButtonTitle="Back to root project"
                >
                  {card => <CardThumbWithSelector depth={2} card={card} />}
                </CardWrapper>
              }
            />
            {/* Edit cart, send to default variant */}
            <Route path="edit/:id" element={<DefaultVariantDetector />} />
            {/* Edit card */}
            <Route
              path="edit/:id/v/:vId/*"
              element={
                <CardWrapper
                  backButtonPath={(card, variant) => `../card/${card.id}/v/${variant.id}`}
                  backButtonTitle="Back to card view"
                >
                  {(card, variant) => <CardEditor card={card} variant={variant} showSubcards />}
                </CardWrapper>
              }
            />
            {/* All cards. Root route */}
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
      </Flex>
    );
  }
}
