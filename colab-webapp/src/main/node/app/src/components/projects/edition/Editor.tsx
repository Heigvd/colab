/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faBookOpen,
  faChevronRight,
  faCog,
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
import Admin from '../../admin/Admin';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import ProjectCardTypeList from '../../cards/cardtypes/ProjectCardTypeList';
import ContentSubs from '../../cards/ContentSubs';
import IconButton from '../../common/element/IconButton';
import IllustrationDisplay, {
  IllustrationIconDisplay,
} from '../../common/element/IllustrationDisplay';
import InlineLoading from '../../common/element/InlineLoading';
import { mainLinkActiveClass, mainMenuLink, MainMenuLink } from '../../common/element/Link';
import Clickable from '../../common/layout/Clickable';
import Flex from '../../common/layout/Flex';
import Monkeys from '../../debugger/monkey/Monkeys';
import { UserDropDown } from '../../MainNav';
import Settings from '../../settings/Settings';
import Picto from '../../styling/Picto';
import {
  fullPageStyle,
  invertedThemeMode,
  linkStyle,
  space_L,
  space_M,
  space_S,
} from '../../styling/style';
import Presence from '../presence/Presence';
import { PresenceContext, usePresenceContext } from '../presence/PresenceContext';
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

function parentPathFn() {
  return '../';
}

function cardThumbFactory(card: Card) {
  return <CardThumbWithSelector depth={2} card={card} />;
}
const Ancestor = ({ card, content, last }: Ancestor): JSX.Element => {
  const i18n = useTranslations();
  const navigate = useNavigate();
  //const location = useLocation();
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
          {i18n.common.project}
        </Clickable>
        <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />
      </>
    );
  } else if (entityIs(card, 'Card') && entityIs(content, 'CardContent')) {
    //const match = location.pathname.match(/(edit|card)\/\d+\/v\/\d+/);
    //const t = match ? match[1] || 'card' : 'card';
    const t = 'card';

    return (
      <>
        <Clickable
          onClick={() => {
            navigate(`../${t}/${content.cardId}/v/${content.id}`);
          }}
          clickableClassName={cx(linkStyle, breadCrumbsStyle)}
        >
          {card.title ? card.title : i18n.modules.card.untitled}
        </Clickable>
        {!last && <FontAwesomeIcon icon={faChevronRight} size="xs" className={breadCrumbsStyle} />}
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
    return variants[0]!;
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
  touchMode: 'zoom' | 'edit';
  grow?: number;
  align?: 'center' | 'normal';
}

const CardWrapper = ({
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
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);

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
    project == null ||
    content == null ||
    content === 'LOADING'
  ) {
    return <InlineLoading />;
  } else {
    return (
      <>
        <Flex className={css({ paddingBottom: '10px', marginTop: '-10px' })}>
          {/* <IconButton
            icon={faArrowLeft}
            title={backButtonTitle}
            iconColor="var(--darkGray)"
            onClick={() => navigate(backButtonPath(card, content))}
            className={css({ marginRight: space_M })}
          /> */}
          {ancestors.map((ancestor, x) => (
            <Ancestor key={x} card={ancestor.card} content={ancestor.content} />
          ))}
          <Ancestor card={card} content={content} last />
          {/* TODO bouton navigation carte*/}
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
  const i18n = useTranslations();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  return (
    <>
      <div
        className={cx(
          invertedThemeMode,
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `0 ${space_M}`,
            //backgroundColor: 'var(--hoverBgColor)',
          }),
        )}
      >
        <Flex align="center">
          <Clickable
            title={i18n.common.action.backToProjects}
            onClick={event => {
              event.preventDefault();
              navigate('../../');
              dispatch(API.closeCurrentProject());
            }}
          >
            <Picto
              className={css({
                height: '22px',
                width: 'auto',
                paddingRight: space_M,
                paddingTop: '0px',
                paddingBottom: '0px',
                paddingLeft: space_S,
              })}
            />
          </Clickable>
          <Flex
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              borderRight: '1px solid var(--lightGray)',
              marginRight: space_S,
            })}
            wrap="nowrap"
          >
            <MainMenuLink
              end
              to={`/editor/${project.id}`}
              className={active =>
                active.isActive || location.pathname.match(/^\/editor\/\d+\/(edit|card)/)
                  ? mainLinkActiveClass
                  : mainMenuLink
              }
            >
              <FontAwesomeIcon
                icon={faGrip}
                title={i18n.common.views.view + ' ' + i18n.common.views.board}
              />
            </MainMenuLink>
            <MainMenuLink to="./hierarchy">
              <FontAwesomeIcon
                icon={faNetworkWired}
                title={i18n.common.views.view + ' ' + i18n.common.views.hierarchy}
              />
            </MainMenuLink>
            <MainMenuLink to="./flow">
              <FontAwesomeIcon
                icon={faProjectDiagram}
                title={i18n.common.views.view + ' ' + i18n.common.views.activityFlow}
              />
            </MainMenuLink>
          </Flex>
          <MainMenuLink to="./project-documentation">
            <FontAwesomeIcon
              icon={faBookOpen}
              title={i18n.modules.project.settings.resources.label}
            />
          </MainMenuLink>
        </Flex>
        <div
          className={css({
            gridColumn: '2/3',
            placeSelf: 'center',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Flex
            onClick={() => setShowProjectDetails(showProjectDetails => !showProjectDetails)}
            title={i18n.common.action.showProjectDetails}
            className={cx(mainMenuLink, css({ textTransform: 'initial', margin: `0 ${space_S}` }))}
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
                {project.name || i18n.modules.project.actions.newProject}
              </div>
            </Flex>
          </Flex>
        </div>
        <Flex align="center">
          <Presence projectId={project.id!} />
          <Monkeys />
          <IconButton
            onClick={() => navigate('./project-settings/general')}
            title={i18n.common.settings}
            icon={faCog}
            className={css({ textAlign: 'right', alignSelf: 'center', marginLeft: 'auto' })}
          />
          <UserDropDown />
        </Flex>
      </div>
    </>
  );
}

function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
  const { touch } = React.useContext(PresenceContext);

  React.useEffect(() => {
    touch({});
  }, [touch]);

  return (
    <div>
      {rootContent != null ? (
        <ContentSubs showEmptiness={true} depth={depthMax} cardContent={rootContent} />
      ) : (
        <InlineLoading />
      )}
    </div>
  );
}

export default function Editor(): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { project, status } = useProjectBeingEdited();

  const root = useProjectRootCard(project);
  const [showProjectDetails, setShowProjectDetails] = React.useState(false);

  const presenceContext = usePresenceContext();

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
        <i>{i18n.modules.project.info.noProjectSelected}</i>
      </div>
    );
  } else if (status != 'READY' || typeof root === 'string' || root.id == null) {
    return <InlineLoading />;
  } else {
    return (
      <PresenceContext.Provider value={presenceContext}>
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
                    <p>
                      {i18n.common.createdBy}: {project.trackingData?.createdBy}
                    </p>
                    <p>
                      {i18n.common.createdAt}:{' '}
                      {i18n.common.datetime(project.trackingData?.creationDate)}
                    </p>
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
              <Route path="settings/*" element={<Settings />} />
              <Route path="project-settings/*" element={<ProjectSettings project={project} />} />
              <Route path="admin/*" element={<Admin />} />
              <Route path="team" element={<Team project={project} />} />
              <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChart />} />
              <Route path="project-documentation/*" element={<ProjectCardTypeList />} />
              <Route path="card/:id" element={<DefaultVariantDetector />} />
              {/* Zooom on a card */}
              <Route
                path="card/:id/v/:vId/*"
                element={
                  <CardWrapper
                    grow={0}
                    align="center"
                    backButtonPath={parentPathFn}
                    backButtonTitle={i18n.common.action.backProjectRoot}
                    touchMode="zoom"
                  >
                    {cardThumbFactory}
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
                    backButtonTitle={i18n.common.action.backCardView}
                    touchMode="edit"
                  >
                    {(card, variant) => <CardEditor card={card} variant={variant} showSubcards />}
                  </CardWrapper>
                }
              />
              {/* All cards. Root route */}
              <Route path="*" element={<RootView rootContent={rootContent} />} />
            </Routes>
          </Flex>
        </Flex>
      </PresenceContext.Provider>
    );
  }
}
