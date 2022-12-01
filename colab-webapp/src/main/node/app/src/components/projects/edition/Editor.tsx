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
  faHouse,
  faNetworkWired,
  faPen,
  faProjectDiagram,
  faStar,
  faTableCells,
  faTableCellsLarge,
  faUserGroup,
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
  useAndLoadSubCards,
  useCard,
  useCardContent,
  useProjectRootCard,
  useVariantsOrLoad,
} from '../../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Admin from '../../admin/Admin';
import CardCreator from '../../cards/CardCreator';
import CardEditor from '../../cards/CardEditor';
import CardThumbWithSelector from '../../cards/CardThumbWithSelector';
import ContentSubs from '../../cards/ContentSubs';
import Checkbox from '../../common/element/Checkbox';
import IconButton from '../../common/element/IconButton';
import { IllustrationIconDisplay } from '../../common/element/IllustrationDisplay';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import { mainLinkActiveClass, mainMenuLink, MainMenuLink } from '../../common/element/Link';
import Tips, { TipsCtx } from '../../common/element/Tips';
import Clickable from '../../common/layout/Clickable';
import Flex from '../../common/layout/Flex';
import Monkeys from '../../debugger/monkey/Monkeys';
import { UserDropDown } from '../../MainNav';
import Settings from '../../settings/Settings';
import {
  fullPageStyle,
  greyIconButtonChipStyle,
  invertedThemeMode,
  lightIconButtonStyle,
  linkStyle,
  modelBGColor,
  paddingAroundStyle,
  space_L,
  space_M,
  space_S,
  successColor,
} from '../../styling/style';
import DocumentationTab from '../DocumentationTab';
import Presence from '../presence/Presence';
import { PresenceContext, usePresenceContext } from '../presence/PresenceContext';
import { defaultProjectIllustration } from '../ProjectCommon';
import { ProjectSettings } from '../ProjectSettings';
import Team from '../team/Team';
import ActivityFlowChart from './activityFlow/ActivityFlowChart';
import Hierarchy from './hierarchy/Hierarchy';

export const depthMax = 2;
const modelPictoCornerStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '5px 7px 7px 5px',
  borderRadius: '0 0 50% 0',
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

const Ancestor = ({ card, content, last, className }: Ancestor): JSX.Element => {
  const i18n = useTranslations();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();

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
            navigate(`../${location.pathname.includes('hierarchy') ? 'hierarchy' : ''}`);
          }}
          clickableClassName={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {i18n.common.project}
        </Clickable>
        <FontAwesomeIcon
          icon={faChevronRight}
          size="xs"
          className={cx(breadCrumbsStyle, className)}
        />
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
          clickableClassName={cx(linkStyle, breadCrumbsStyle, className)}
        >
          {card.title ? card.title : i18n.modules.card.untitled}
        </Clickable>
        {!last && (
          <FontAwesomeIcon
            icon={faChevronRight}
            size="xs"
            className={cx(breadCrumbsStyle, className)}
          />
        )}
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
  const navigate = useNavigate();

  const card = useCard(cardId);
  const content = useCardContent(cardContentId);

  const parentId = card != null && card != 'LOADING' ? card.parentId : undefined;

  const { project } = useProjectBeingEdited();

  const ancestors = useAncestors(parentId);
  const location = useLocation();

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
        <Flex className={css({padding: space_S + ' ' + space_L})} justify="space-between">
          <Flex align="center">
            {ancestors.map((ancestor, x) => (
              <Ancestor
                key={x}
                card={ancestor.card}
                content={ancestor.content}
                className={cx({
                  [css({ color: 'var(--primaryColor)' })]: project.type === 'MODEL',
                })}
              />
            ))}
            <Ancestor
              card={card}
              content={content}
              last
              className={cx({ [css({ color: 'var(--primaryColor)' })]: project.type === 'MODEL' })}
            />
          </Flex>
          <IconButton
            title="toggle view edit"
            icon={location.pathname.includes('card') ? faPen : faTableCellsLarge}
            onClick={() => {
              navigate(
                `../${location.pathname.includes('hierarchy') ? 'hierarchy': ''}/${location.pathname.includes('card') ? 'edit' : 'card'}/${content.cardId}/v/${
                  content.id
                }`,
              );
            }}
            className={lightIconButtonStyle}
          />
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
}

function EditorNav({ project }: EditorNavProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const location = useLocation();

  const tipsConfig = React.useContext(TipsCtx);

  return (
    <>
      <div
        className={cx(
          invertedThemeMode,
          css({
            display: 'inline-grid',
            gridTemplateColumns: '1fr 3fr 1fr',
            flexGrow: 0,
            padding: `0 ${space_M} 0 0`,
          }),
        )}
      >
        <Flex align="center">
          <MainMenuLink to={`/`} className={mainMenuLink}>
            {/* TODO : close current project - check if it really works (local + send to server) */}
            <span
              title={i18n.common.action.backToProjects}
              onClickCapture={() => {
                dispatch(API.closeCurrentProject());
              }}
            >
              <FontAwesomeIcon
                icon={faHouse}
                size="lg"
                onClick={() => {
                  dispatch(API.closeCurrentProject());
                }}
              />
            </span>
          </MainMenuLink>
          <Flex
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              padding: '0 ' + space_S,
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
          <Flex
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              padding: '0 ' + space_S,
            })}
            wrap="nowrap"
          >
            <MainMenuLink to="./docs">
              <FontAwesomeIcon
                icon={faBookOpen}
                title={i18n.modules.project.settings.resources.label}
              />
            </MainMenuLink>
          </Flex>
          <Flex
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              padding: '0 ' + space_S,
            })}
            wrap="nowrap"
          >
            <MainMenuLink
              to="./team"
              className={active =>
                active.isActive || location.pathname.match(/^\/editor\/\d+\/team/)
                  ? mainLinkActiveClass
                  : mainMenuLink
              }
            >
              <FontAwesomeIcon icon={faUserGroup} title={i18n.team.teamManagement} />
            </MainMenuLink>
          </Flex>
          <Flex
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              padding: '0 ' + space_S,
            })}
            wrap="nowrap"
          >
            <MainMenuLink to="./project-settings">
              <FontAwesomeIcon title={i18n.modules.project.labels.projectSettings} icon={faCog} />
            </MainMenuLink>
          </Flex>
        </Flex>
        <div
          className={css({
            gridColumn: '2/3',
            placeSelf: 'center',
            display: 'flex',
            alignItems: 'center',
          })}
        >
          <Flex className={cx(css({ textTransform: 'initial', margin: `0 ${space_S}` }))}>
            <Flex align="center">
              <Flex
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
              <DiscreetInput
                value={project.name || i18n.modules.project.actions.newProject}
                placeholder={i18n.modules.project.actions.newProject}
                onChange={newValue => dispatch(API.updateProject({ ...project, name: newValue }))}
              />
            </Flex>
          </Flex>
        </div>
        <Flex align="center" justify="flex-end">
          <Presence projectId={project.id!} />
          <Monkeys />
          <Tips tipsType="FEATURE_PREVIEW">
            <Flex>
              <Checkbox
                label={i18n.tips.label.feature_preview}
                value={tipsConfig.FEATURE_PREVIEW.value}
                onChange={tipsConfig.FEATURE_PREVIEW.set}
                className={css({ display: 'inline-block', marginRight: space_S })}
              />
            </Flex>
          </Tips>
          <UserDropDown />
        </Flex>
      </div>
    </>
  );
}

function RootView({ rootContent }: { rootContent: CardContent | null | undefined }) {
  const { touch } = React.useContext(PresenceContext);
  const [organize, setOrganize] = React.useState(false);

  React.useEffect(() => {
    touch({});
  }, [touch]);

  return (
    <div
      className={css({ display: 'flex', flexGrow: '1', flexDirection: 'column', height: '100%', padding: space_L })}
    >
      {rootContent != null ? (
        <>
          <CardCreatorAndOrganize
            rootContent={rootContent}
            organize={{ organize: organize, setOrganize: setOrganize }}
          />

          <ContentSubs
            minCardWidth={150}
            showEmptiness={true}
            depth={depthMax}
            cardContent={rootContent}
            organize={organize}
          />
        </>
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
        <Flex
          direction="column"
          align="stretch"
          grow={1}
          className={cx(fullPageStyle, { [modelBGColor]: project.type === 'MODEL' })}
        >
          <EditorNav project={project} />
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({
              overflow: 'auto',
              position: 'relative',
            })}
          >
            {project.type === 'MODEL' && (
              <Flex
                align="center"
                justify="center"
                className={cx(modelPictoCornerStyle, invertedThemeMode)}
                title={i18n.modules.project.info.isAModel}
              >
                {/*             {isAdminModel ? (
              <FontAwesomeIcon icon={faGlobe} color="white" size="sm" />
            ) : ( */}
                <FontAwesomeIcon icon={faStar} size="xs" />
              </Flex>
            )}

            <Routes>
              <Route path="settings/*" element={<Settings />} />
              <Route path="project-settings/*" element={<ProjectSettings project={project} />} />
              <Route path="admin/*" element={<Admin />} />
              <Route path="team/*" element={<Team project={project} />} />
              <Route path="hierarchy" element={<Hierarchy rootId={root.id} />} />
              <Route path="flow" element={<ActivityFlowChart />} />
              <Route path="docs/*" element={<DocumentationTab project={project} />} />
              <Route path="card/:id" element={<DefaultVariantDetector />} />
              {/* Zooom on a card */}
              <Route
                path="card/:id/v/:vId/*"
                element={
                  <CardWrapper
                    grow={1}
                    backButtonPath={parentPathFn}
                    backButtonTitle={i18n.common.action.backProjectRoot}
                    touchMode="zoom"
                  >
                    {card => <CardThumbWithSelector depth={2} card={card} mayOrganize className={paddingAroundStyle([2, 3, 4], space_L)}/>}
                  </CardWrapper>
                }
              />
              {/* Edit cart, send to default variant */}
              <Route path="edit/:id" element={<DefaultVariantDetector />} />
              
              {/* Edit card */}
              <Route
                path={`/edit/:id/v/:vId/*`}
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
              <Route
                path="hierarchy/card/:id/v/:vId/*"
                element={
                  <CardWrapper
                    grow={1}
                    backButtonPath={parentPathFn}
                    backButtonTitle={i18n.common.action.backProjectRoot}
                    touchMode="zoom"
                  >
                    {card => <CardThumbWithSelector depth={2} card={card} mayOrganize className={paddingAroundStyle([2, 3, 4], space_L)}/>}
                  </CardWrapper>
                }
              />
              <Route path="hierarchy/edit/:id" element={<DefaultVariantDetector />} />
              <Route
                path="hierarchy/edit/:id/v/:vId/*"
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
interface CardCreatorAndOrganizeProps {
  rootContent: CardContent;
  organize: {
    organize: boolean;
    setOrganize: React.Dispatch<React.SetStateAction<boolean>>;
  };
}
function CardCreatorAndOrganize({ rootContent, organize }: CardCreatorAndOrganizeProps) {
  const i18n = useTranslations();
  const subCards = useAndLoadSubCards(rootContent.id);
  return (
    <>
      {subCards && subCards.length > 0 && (
        <Flex
          gap={space_S}
          wrap="nowrap"
          justify="flex-end"
          align="center"
          className={css({ marginTop: '-10px', paddingRight: space_S })}
        >
            <IconButton
              className={cx(
                greyIconButtonChipStyle,
                css({ alignSelf: 'flex-end' }),
                organize.organize &&
                  css({
                    backgroundColor: successColor,
                    color: 'var(--bgColor)',
                    border: successColor,
                  }),
              )}
              title={i18n.modules.card.positioning.toggleText}
              icon={faTableCells}
              onClick={() => organize.setOrganize(e => !e)}
            />
          <CardCreator parentCardContent={rootContent} className={greyIconButtonChipStyle} />
        </Flex>
      )}
    </>
  );
}
