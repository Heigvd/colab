/*
 * The coLAB project
 * Copyright (C) 2022 maxence
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faBan,
  faBook,
  faBookReader,
  faLocationDot,
  faSlash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AbstractCardType,
  AbstractResource,
  Card,
  CardContent,
  entityIs,
  Resource,
  ResourceExternalReference,
  ResourceRef,
} from 'colab-rest-client';
import { clone } from 'lodash';
import * as React from 'react';
import { getRestClient, moveResource } from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadCardType } from '../../../selectors/cardTypeSelector';
import { useAndLoadProjectResourcesStatus } from '../../../selectors/resourceSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { ResourceState } from '../../../store/resource';
import TargetCardTypeSummary from '../../cards/cardtypes/summary/TargetCardTypeSummary';
import { defaultThumbnailStyle } from '../../common/collection/ItemThumbnailsSelection';
import Button from '../../common/element/Button';
import { AsyncButtonWithLoader } from '../../common/element/ButtonWithLoader';
import { BlockInput } from '../../common/element/Input';
import Toggler from '../../common/element/Toggler';
import Flex from '../../common/layout/Flex';
import { modalBody, modalFooter } from '../../common/layout/Modal';
import Hierarchy from '../../projects/edition/Hierarchy';
import { space_M, textSmall } from '../../styling/style';
import { getTheRef, ResourceAndRef } from '../resourcesCommonType';
import TargetResourceSummary from './TargetResourceSummary';

const thumbStyle = cx(
  defaultThumbnailStyle,
  css({
    justifyContent: 'center',
    cursor: 'pointer',
  }),
);

const externalThumbStyle = cx(
  defaultThumbnailStyle,
  css({
    overflow: 'visible',
  }),
);

interface WithResource {
  persisted: 'none' | 'owner' | 'rejected' | 'visible';
  resource: 'none' | 'owner' | 'rejected' | 'visible';
}

interface Type extends WithResource {
  cardType: AbstractCardType;
}

interface Variant extends WithResource {
  cardContent: CardContent;
  subs: CardAndVariant[];
  isSingle: boolean;
}

interface CardAndVariant extends WithResource {
  card: Card;
  contents: Variant[];
}

interface Structure {
  types: Type[];
  root: CardAndVariant | undefined;
  cardIds: number[];
}

interface ResourceOwner {
  abstractCardTypeId?: number | undefined | null;
  cardId?: number | undefined | null;
  cardContentId?: number | undefined | null;
  published: boolean;
}

type OwnerContext = ResourceOwner & {
  setOwner: (owner: ResourceOwner) => void;
  highlightCardType: (cardTypeId: number | undefined) => void;
  pointOfView?: ResourceRef | Resource;
};

const OwnerCtx = React.createContext<OwnerContext>({
  published: false,
  setOwner: () => {},
  highlightCardType: () => {},
});

const color = 'var(--pictoBlue)';

const ownerIcon = <FontAwesomeIcon className="fa-stack-1x" icon={faBook} color={color} />;
const visibleIcon = <FontAwesomeIcon className="fa-stack-1x" icon={faBookReader} color={color} />;

/** Indicates user do not use the resource, but did not explicitly reject it */
const unusedIcon = (
  <FontAwesomeIcon className="fa-stack-1x" icon={faBookReader} color={'lightgrey'} />
);
/** Indicates user explicitly reject the resource */
const rejectedIcon = <FontAwesomeIcon className="fa-stack-1x" icon={faBan} color={color} />;

const circleIcon = <></>; // <FontAwesomeIcon icon={faCircleDot} color={'var(--pictoBlue)'} />;

const ownerIconStack = <FontAwesomeIcon className="fa-stack-1x" icon={faBook} color="grey" />;
const visibleIconStack = (
  <FontAwesomeIcon className="fa-stack-1x" icon={faBookReader} color="grey" />
);
const rejectedIconStack = <FontAwesomeIcon className="fa-stack-1x" icon={faBan} color="grey" />;

const slashIcon = (
  <FontAwesomeIcon className="fa-stack-1x" icon={faSlash} color={'var(--errorColor)'} />
);

const noIcon = <></>;

function getSingleIcon(id: WithResource['resource'], stacked: boolean = false) {
  switch (id) {
    case 'none':
      return noIcon;
    case 'owner':
      return stacked ? ownerIconStack : ownerIcon;
    case 'rejected':
      return stacked ? rejectedIconStack : rejectedIcon;
    case 'visible':
      return stacked ? visibleIconStack : visibleIcon;
  }
}

function Stack({ children }: { children: React.ReactNode }): JSX.Element {
  return <span className="fa-stack">{children}</span>;
}

const youAreHereIcon = (
  <Stack>
    <FontAwesomeIcon className="fa-stack-1x" icon={faLocationDot} color={'var(--errorColor)'} />
  </Stack>
);

function getIcon(node: WithResource): JSX.Element {
  if (node.persisted === 'none') {
    return <Stack>{getSingleIcon(node.resource)}</Stack>;
  } else if (node.resource === 'rejected') {
    return <Stack>{rejectedIcon}</Stack>;
  } else if (node.resource === node.persisted) {
    return <Stack>{getSingleIcon(node.resource)}</Stack>;
  } else if (node.resource === 'owner') {
    return (
      <>
        <Stack>{getSingleIcon(node.persisted)}</Stack>
        {'->'}
        <Stack>{ownerIcon}</Stack>
      </>
    );
  } else if (node.resource === 'visible') {
    if (node.persisted === 'owner') {
      return (
        <>
          <Stack>{ownerIcon}</Stack>
          {'->'}
          <Stack>{visibleIcon}</Stack>
        </>
      );
    } else if (node.persisted === 'rejected') {
      return <Stack>{rejectedIcon}</Stack>;
    } else {
      return <Stack>{visibleIcon}</Stack>;
    }
  } else {
    if (node.persisted === 'rejected') {
      return <Stack>{rejectedIcon}</Stack>;
    } else {
      return (
        <Stack>
          {getSingleIcon(node.persisted, true)}
          {slashIcon}
        </Stack>
      );
    }
  }
}

interface CardTypeDisplayProps {
  cardType: Type;
  onClick: () => void;
}

function CardTypeDisplay({ cardType, onClick }: CardTypeDisplayProps): JSX.Element {
  const owner = React.useContext(OwnerCtx);
  const { highlightCardType, pointOfView } = owner;
  const i18n = useTranslations();
  const allInOne = useAndLoadCardType(cardType.cardType.id);

  const onMouseEnter = React.useCallback(() => {
    highlightCardType(cardType.cardType.id!);
  }, [highlightCardType, cardType.cardType.id]);
  const onMouseLeave = React.useCallback(() => {
    highlightCardType(undefined);
  }, [highlightCardType]);

  return (
    <div
      className={thumbStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {allInOne.cardType && <TargetCardTypeSummary cardType={allInOne.cardType} />}
      {pointOfView?.abstractCardTypeId === cardType.cardType.id && youAreHereIcon}
      {(allInOne.cardType && allInOne.cardType.title) || i18n.modules.cardType.titlePlaceholder}
      {getIcon(cardType)}
      {owner.abstractCardTypeId === cardType.cardType.id && <>{circleIcon}</>}
    </div>
  );
}

interface ProjectDisplayProps {
  onClick: () => void;
  root: CardAndVariant;
}

function ProjectDisplay({ onClick, root }: ProjectDisplayProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <div className={thumbStyle} onClick={onClick}>
      {i18n.modules.project.settings.resources.label}
      {getIcon(root)}
    </div>
  );
}

interface ExternalProjectDisplayProps {
  externalProject: ResourceExternalReference;
}

function ExternalProjectDisplay({ externalProject }: ExternalProjectDisplayProps): JSX.Element {
  // const owner = React.useContext(OwnerCtx);
  // const i18n = useTranslations();
  return (
    <div className={externalThumbStyle}>
      {externalProject.project.name}
      {(() => {
        switch (externalProject.usage) {
          case 'USED':
            return <Stack>{visibleIcon}</Stack>;
          case 'REFUSED':
            return <Stack>{rejectedIcon}</Stack>;
          case 'UNUSED':
            return <Stack>{unusedIcon}</Stack>;
        }
      })()}
    </div>
  );
}

function getPersistedLevel(
  state: ResourceState,
  owner: ResourceOwner,
  target: AbstractResource,
): WithResource['resource'] {
  const ctOwned = owner.abstractCardTypeId != null;
  const cOwned = owner.cardId != null;
  const ccOwned = owner.cardContentId != null;

  const resources = Object.values(state.resources).flatMap(resource => {
    if (entityIs(resource, 'AbstractResource')) {
      if (
        (ctOwned && resource.abstractCardTypeId === owner.abstractCardTypeId) ||
        (cOwned && resource.cardId === owner.cardId) ||
        (ccOwned && resource.cardContentId === owner.cardContentId)
      ) {
        return [resource];
      }
    }
    return [];
  });

  for (const resource of resources) {
    // expand
    let current: AbstractResource | undefined = resource;
    while (current) {
      if (entityIs(current, 'AbstractResource')) {
        if (current.id === target.id) {
          if (entityIs(resource, 'ResourceRef')) {
            if (resource.refused) {
              return 'rejected';
            } else if (resource.residual) {
              return 'none';
            } else {
              return 'visible';
            }
          } else {
            return 'owner';
          }
        } else if (entityIs(current, 'ResourceRef') && current.targetId != null) {
          const p: AbstractResource | string | undefined = state.resources[current.targetId];
          if (entityIs(p, 'AbstractResource')) {
            current = p;
            continue;
          }
        }
      }
      current = undefined;
    }
  }

  return 'none';
}

function buildCardAndVariant(
  card: Card,
  allCards: Card[],
  allCardContents: CardContent[],
): CardAndVariant {
  return {
    card: card,
    resource: 'none',
    persisted: 'none',
    contents: allCardContents
      .filter(content => {
        return content.cardId === card!.id;
      })
      .map((content, _, all) => ({
        cardContent: content,
        resource: 'none',
        persisted: 'none',
        isSingle: all.length === 1,
        subs: allCards
          .filter(c => c.parentId === content.id)
          .map(c => buildCardAndVariant(c, allCards, allCardContents)),
      })),
  };
}

function useStructure(resource: ResourceAndRef, owner: ResourceOwner, all: boolean): Structure {
  return useAppSelector(state => {
    const theRef = getTheRef(resource) || resource.targetResource;

    // first fetch involved cardType(s)
    const cardTypes: AbstractCardType[] = [];
    const cardQueue: Card[] = [];

    if (all) {
      //harvest all card and all types
      const projectId = state.projects.editing;
      cardTypes.push(
        ...Object.values(state.cardType.cardtypes).flatMap(cardType => {
          if (entityIs(cardType, 'AbstractCardType')) {
            if (cardType.projectId === projectId) {
              return cardType;
            }
          }
          return [];
        }),
      );
      cardQueue.push(
        ...Object.values(state.cards.cards).flatMap(cardDetail => {
          if (cardDetail.card) {
            return [cardDetail.card];
          } else {
            return [];
          }
        }),
      );
    } else {
      // from the ref and the owner, fetch involved types and all cards to rootCard
      [theRef, owner].forEach(o => {
        let cardTypeId: number | undefined = o?.abstractCardTypeId || undefined;
        let cardId = o.cardId;
        const cardContentId = o.cardContentId;

        if (cardContentId != null) {
          const contentState = state.cards.contents[cardContentId];

          if (contentState?.content) {
            cardId = contentState.content.cardId;
          }
        }

        if (cardId != null) {
          const cardState = state.cards.cards[cardId];
          if (cardState?.card) {
            if (!cardQueue.includes(cardState.card)) {
              cardQueue.push(cardState.card);
            }
            cardTypeId = cardState.card.cardTypeId || undefined;
          }
        }

        if (cardTypeId != null) {
          const cardType = state.cardType.cardtypes[cardTypeId];
          if (entityIs(cardType, 'AbstractCardType')) {
            if (!cardTypes.includes(cardType)) {
              cardTypes.push(cardType);
            }
          }
        }
      });

      // from the ref and the owner, fetch sub cards
      if (resource.targetResource.published || owner.published) {
        [theRef, owner].forEach(o => {
          if (o.cardContentId || o.cardId) {
            // expands from card only
            const cardContentQueue: number[] = [];
            if (o.cardId != null) {
              const cardState = state.cards.cards[o.cardId];
              if (cardState?.card) {
                cardContentQueue.push(...(cardState.contents || []));
              }
            }

            if (o.cardContentId != null) {
              if (cardContentQueue.includes(o.cardContentId)) {
                cardContentQueue.push(o.cardContentId);
              }
            }
          }
        });
      }

      // Then, queue all cards referencing cardTypes
      cardTypes.forEach(cardType => {
        Object.values(state.cards.cards).forEach(card => {
          if (card.card != null && card.card?.cardTypeId === cardType.id) {
            if (!cardQueue.includes(card.card)) {
              cardQueue.push(card.card);
            }
          }
        });
      });
    }

    // Then, for each card, extract all ancestors
    const cards: Record<number, Card> = {};
    const cardIds: number[] = [];

    let rootCard: Card | undefined = undefined;

    while (cardQueue.length > 0) {
      const card = cardQueue.pop()!;
      if (card.id) {
        if (!cards[card.id]) {
          cards[card.id] = card;
          cardIds.push(card.id);
        }

        if (card.parentId != null) {
          const superContent = state.cards.contents[card.parentId];
          if (superContent?.content != null) {
            const superCardId = superContent.content.cardId;
            const superCard = superCardId != null ? state.cards.cards[superCardId] : undefined;
            if (
              superCard?.card?.id != null &&
              !cards[superCard.card.id] &&
              !cardQueue.includes(superCard.card)
            ) {
              cardQueue.push(superCard.card);
            }
          }
        } else {
          rootCard = card;
        }
      }
    }

    // Eventally extract all variants
    const allCardContents = Object.values(state.cards.contents).flatMap(cc => {
      return cc.content ? [cc.content] : [];
    });

    const root = rootCard
      ? buildCardAndVariant(rootCard, Object.values(cards), allCardContents)
      : undefined;
    if (root) {
      visit(
        root,
        card => {
          card.persisted = getPersistedLevel(
            state.resources,
            {
              cardId: card.card.id,
              published: false,
            },
            resource.targetResource,
          );
        },
        cardContent => {
          cardContent.persisted = getPersistedLevel(
            state.resources,
            {
              cardContentId: cardContent.cardContent.id,
              published: false,
            },
            resource.targetResource,
          );
        },
      );
    }

    return {
      types: cardTypes.map(ct => ({
        cardType: ct,
        resource: 'none',
        persisted: getPersistedLevel(
          state.resources,
          {
            abstractCardTypeId: ct.id,
            published: false,
          },
          resource.targetResource,
        ),
      })),
      root: root,
      cardIds,
    };
  });
}

function visitVariant<T>(
  variant: Variant,
  /** return true to stop */
  cardVisitor?: (card: CardAndVariant) => T | void,
  /** return true to stop */
  variantVisitor?: (variant: Variant) => T | void,
): T | void {
  const r = variantVisitor && variantVisitor(variant);
  if (r) {
    return r;
  }
  for (const card of variant.subs) {
    const r = visit(card, cardVisitor, variantVisitor);
    if (r) {
      return r;
    }
  }
}

function visit<T>(
  root: CardAndVariant,
  /** return true to stop */
  cardVisitor?: (card: CardAndVariant) => T | void,
  /** return true to stop */
  variantVisitor?: (variant: Variant) => T | void,
): T | void {
  const r = cardVisitor && cardVisitor(root);
  if (r) {
    return r;
  }
  for (const variant of root.contents) {
    const r = visitVariant(variant, cardVisitor, variantVisitor);
    if (r) {
      return r;
    }
  }
}

function applyOwnership(structure: Structure, owner: ResourceOwner): Structure {
  const copy = clone(structure);

  if (owner.abstractCardTypeId != null) {
    copy.types
      .filter(type => type.cardType.id === owner.abstractCardTypeId)
      .forEach(type => (type.resource = 'owner'));

    if (owner.published && structure.root) {
      // publish resource is visible by all cards referencing the type
      visit(structure.root, card => {
        // TODO: check rejected
        if (card.card.cardTypeId === owner.abstractCardTypeId) {
          card.resource = 'visible';
          card.contents.forEach(c => (c.resource = 'visible'));
        }
      });
    }
  }

  if (owner.cardId && structure.root) {
    const found = visit(structure.root, card => {
      if (card.card.id === owner.cardId) {
        return card;
      }
    });
    if (found) {
      found.contents.forEach(c => (c.resource = 'visible'));
      // published propagates to sub cards
      if (owner.published) {
        visit(
          found,
          card => {
            card.resource = 'visible';
          },
          variant => {
            variant.resource = 'visible';
          },
        );
      }
      found.resource = 'owner';
    }
  }

  if (owner.cardContentId && structure.root) {
    const found = visit(structure.root, undefined, variant => {
      if (variant.cardContent.id === owner.cardContentId) {
        return variant;
      }
    });
    if (found) {
      if (owner.published) {
        visitVariant(
          found,
          card => {
            card.resource = 'visible';
          },
          variant => {
            variant.resource = 'visible';
          },
        );
      }
      found.resource = 'owner';
    }
  }
  return copy;
}

interface ResourceScopeProps {
  onCancel: () => void;
  resource: ResourceAndRef;
}

export default function ResourceScope({ onCancel, resource }: ResourceScopeProps): JSX.Element {
  const i18n = useTranslations();
  const restClient = getRestClient();
  useAndLoadProjectResourcesStatus();

  const pointOfView = getTheRef(resource) || resource.targetResource;

  const [showAll, setShowAll] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);

  const getInitialOwner = React.useCallback(() => {
    return {
      abstractCardTypeId: resource.targetResource.abstractCardTypeId,
      cardId: resource.targetResource.cardId,
      cardContentId: resource.targetResource.cardContentId,
      published: resource.targetResource.published,
    };
  }, [resource]);

  const [owner, setOwner] = React.useState<ResourceOwner>(getInitialOwner());

  const structure = useStructure(resource, owner, showAll);

  const resetCb = React.useCallback(() => {
    setOwner(getInitialOwner());
  }, [getInitialOwner]);

  applyOwnership(structure, owner);

  const targetId = resource.targetResource.id;
  const [externalRef, setExternalRef] = React.useState<ResourceExternalReference[]>([]);

  React.useEffect(() => {
    if (targetId) {
      restClient.ResourceRestEndpoint.getResourceExternalReferences(targetId!).then(setExternalRef);
    }
  }, [restClient, targetId]);

  const [highlightedCardType, setHighlightedCardType] = React.useState<number | undefined>(
    undefined,
  );

  const highlightStyle = css({
    [`.CardType-${highlightedCardType}`]: {
      boxShadow: '0 0 10px 1px var(--pictoOrange)',
    },
  });

  const dispatch = useAppDispatch();

  const moveCb = React.useMemo(() => {
    const publiChange = owner.published != resource.targetResource.published;
    const ownerChange =
      resource.targetResource.abstractCardTypeId != owner.abstractCardTypeId ||
      resource.targetResource.cardId != owner.cardId ||
      resource.targetResource.cardContentId != owner.cardContentId;

    if (publiChange || ownerChange) {
      return async () => {
        return dispatch(
          moveResource({
            published: owner.published,
            resource: resource.targetResource,
            newParentType:
              owner.cardContentId != null
                ? 'CardContent'
                : owner.cardId != null
                ? 'Card'
                : 'CardType',
            newParentId: (owner.abstractCardTypeId || owner.cardContentId || owner.cardId)!,
          }),
        );
      };
    } else {
      return undefined;
    }
  }, [owner, resource.targetResource, dispatch]);

  return (
    <OwnerCtx.Provider
      value={{
        ...owner,
        setOwner,
        highlightCardType: setHighlightedCardType,
        pointOfView: pointOfView,
      }}
    >
      <Flex className={highlightStyle} overflow="auto" direction="column" align="stretch" grow={1}>
        <Flex className={modalBody} direction="column" align="stretch">
          {/* header */}
          <h2>{resource.targetResource.title || i18n.modules.resource.untitled} </h2>
          <Flex>
            <em>
              <TargetResourceSummary hideIcon resource={resource} showText="full" />
            </em>
          </Flex>
          <div>{i18n.modules.resource.scope.disclaimer}</div>
        </Flex>
        <Flex
          overflow="auto"
          className={modalBody}
          grow={1}
          direction="row"
          gap={space_M}
          align="stretch"
        >
          <Flex direction="column" gap={space_M}>
            {/* body */}
            {structure.root && (
              <>
                <h3>{i18n.modules.project.settings.resources.label}</h3>
                <div className={textSmall}>{i18n.modules.resource.scope.projectDocDesc}</div>
                <Flex gap="5px">
                  <ProjectDisplay
                    root={structure.root}
                    onClick={() => {
                      setOwner(owner => ({
                        cardId: structure.root!.card.id,
                        published: owner.published,
                      }));
                    }}
                  />
                </Flex>
              </>
            )}
            {structure.types.length > 0 && (
              <>
                <h3>{i18n.modules.cardType.cardTypesLongWay}</h3>
                <div className={textSmall}>{i18n.modules.resource.scope.thematicDesc}</div>
                <Flex direction="column" gap="5px" align="stretch">
                  {structure.types.map(cardType => (
                    <CardTypeDisplay
                      key={cardType.cardType.id}
                      cardType={cardType}
                      onClick={() => {
                        setOwner(owner => ({
                          abstractCardTypeId: cardType.cardType.id,
                          published: owner.published,
                        }));
                      }}
                    />
                  ))}
                </Flex>
              </>
            )}
          </Flex>
          <Flex direction="column">
            {structure.root && (
              <>
                <h3>{i18n.modules.resource.scope.mainViewTitle}</h3>
                <div className={textSmall}>{i18n.modules.resource.scope.mainViewDesc}</div>
                <Hierarchy
                  rootId={structure.root.card.id!}
                  enableDragAndDrop={false}
                  showAdd={false}
                  showTools={false}
                  forceZoom={zoom}
                  showOnlyCard={structure.cardIds}
                  onCardClick={card => {
                    setOwner(owner => ({
                      published: owner.published,
                      cardId: card.id,
                    }));
                  }}
                  onContentClick={(card, content) => {
                    const found =
                      structure.root &&
                      visit(structure.root, c => (c.card.id === card.id ? c : undefined));
                    if ((found?.contents?.length ?? 0) > 1) {
                      setOwner(owner => ({
                        published: owner.published,
                        cardContentId: content.id,
                      }));
                    } else {
                      setOwner(owner => ({
                        published: owner.published,
                        cardId: card.id,
                      }));
                    }
                  }}
                  cardDecorator={card => {
                    const ofType =
                      owner.abstractCardTypeId != null &&
                      owner.abstractCardTypeId === card.cardTypeId;
                    //= structure.types.find(ct => ct.cardType.id === card.cardTypeId);

                    let resource: JSX.Element | undefined = undefined;

                    if (structure.root) {
                      const result = visit(structure.root, c =>
                        c.card.id === card.id ? c : undefined,
                      );
                      if (result && result.contents.length > 1) {
                        if (result.resource === 'owner') {
                          resource = <Stack>{ownerIcon}</Stack>;
                        }
                      }
                    }

                    return (
                      <>
                        {card.title}
                        {ofType && circleIcon}
                        {resource}
                      </>
                    );
                  }}
                  variantDecorator={(card, variant) => {
                    let resource: JSX.Element | undefined = noIcon;
                    let youAreHere: JSX.Element | undefined = noIcon;
                    if (structure.root) {
                      const result = visit(structure.root, undefined, v =>
                        v.cardContent.id === variant.id ? v : undefined,
                      );

                      if (result) {
                        resource = getIcon(result);

                        if (result.isSingle) {
                          // single variant hack

                          const c = visit(structure.root, c =>
                            c.card.id === card.id ? c : undefined,
                          );
                          if (c) {
                            resource = getIcon(c);
                          }
                          //if (owner.cardId != null && owner.cardId === card.id) {
                          //resource = ownerIcon;
                          //}
                          if (pointOfView != null && pointOfView.cardId === card.id) {
                            youAreHere = youAreHereIcon;
                          }
                        }
                        if (pointOfView != null && pointOfView.cardContentId === variant.id) {
                          youAreHere = youAreHereIcon;
                        }
                      }
                    }

                    return (
                      <>
                        {youAreHere}
                        {variant.title || ''}
                        {resource}
                      </>
                    );
                  }}
                />
              </>
            )}
          </Flex>
          {externalRef.length > 0 && (
            <Flex direction="column" gap={space_M}>
              <h3>{i18n.modules.resource.scope.alsoUsedByExternalProject}</h3>
              {externalRef.map(ref => {
                return <ExternalProjectDisplay key={ref.project.id} externalProject={ref} />;
              })}
            </Flex>
          )}
        </Flex>{' '}
        {/* end of body */}
        <Flex className={cx(modalFooter, modalBody)} justify="space-between" align="stretch">
          {' '}
          {/* footer */}
          <Flex gap={space_M} align="center">
            <Toggler
              value={showAll}
              onChange={setShowAll}
              label={i18n.modules.resource.scope.showAllCards}
            />
            <BlockInput
              type="range"
              label={i18n.common.zoom}
              value={zoom}
              placeholder="1"
              max="2"
              min="0.5"
              step="0.1"
              onChange={newValue => setZoom(Number(newValue))}
              saveMode="SILLY_FLOWING"
            />
          </Flex>
          <Flex gap={space_M}>
            <Flex direction="column" align="flex-end">
              <Toggler
                label={i18n.common.published}
                value={owner.published}
                onChange={x => setOwner(owner => ({ ...owner, published: x }))}
              />
              <div className={textSmall}>
                {(() => {
                  if (owner.abstractCardTypeId != null) {
                    // shared documentation
                    return owner.published
                      ? i18n.modules.resource.publishedInfoType
                      : i18n.modules.resource.unpublishedInfoType;
                  } else if (owner.cardId != null && owner.cardId === structure.root?.card.id) {
                    // project documentation
                    return owner.published
                      ? i18n.modules.resource.publishedInfoRootCard
                      : i18n.modules.resource.unpublishedInfoType;
                  } else {
                    return owner.published
                      ? i18n.modules.resource.publishedInfo
                      : i18n.modules.resource.unpublishedInfo;
                  }
                })()}
              </div>
            </Flex>

            <Button invertedButton onClick={onCancel}>
              {i18n.modules.resource.scope.cancel}
            </Button>
            <Button invertedButton onClick={resetCb}>
              {i18n.modules.resource.scope.reset}
            </Button>
            <AsyncButtonWithLoader onClick={moveCb}>
              {i18n.modules.resource.scope.confirm}
            </AsyncButtonWithLoader>
          </Flex>
        </Flex>
      </Flex>
    </OwnerCtx.Provider>
  );
}