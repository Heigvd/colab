/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations, { useLanguage } from '../../i18n/I18nContext';
import { useProjectRootCard } from '../../selectors/cardSelector';
import { useAndLoadNbDocuments } from '../../selectors/documentSelector';
import { useCurrentProjectId } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import Tips from '../common/element/Tips';
import Collapsible from '../common/layout/Collapsible';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  lightIconButtonStyle,
  oneLineEllipsis,
  space_lg,
  space_sm,
} from '../styling/style';
import { ResourceCategoryModal } from './ResourceDisplay';
import {
  getKey,
  getTheDirectResource,
  ResourceAndRef,
  useResourceAccessLevelForCurrentUser,
} from './resourcesCommonType';
import { ResourcesCtx } from './ResourcesMainView';
import TargetResourceSummary from './summary/TargetResourceSummary';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource TOC Context
////////////////////////////////////////////////////////////////////////////////////////////////////

export type TocMode = 'CATEGORY' | 'SOURCE' | '3_STACKS';

export interface TocDisplayContext {
  mode: TocMode;
  setMode: (newMode: TocMode) => void;
}

export const TocDisplayCtx = React.createContext<TocDisplayContext>({
  mode: 'CATEGORY',
  setMode: () => {},
});

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * List of ResourceAndRef grouped by category
 */

// for the moment, the resources are ordered by id (= creation date)
function sortResources(lang: string) {
  return (a: ResourceAndRef, b: ResourceAndRef): number => {
    return (a.targetResource.title || '').localeCompare(b.targetResource.title || '', lang, {
      numeric: true,
    });
    // return (a.targetResource.id || 0) - (b.targetResource.id || 0);
  };
}

type StackType = 'OWN' | 'INHERITED' | 'PROJECT'; //'CARD' | 'THEME' | 'INHERITED' | 'PROJECT' | 'MODEL' | 'OUTSIDE';

// function stackKeyOrder(c: string) {
//   switch (c) {
//     case 'CARD':
//       return 1;
//     case 'PROJECT':
//       return 2;
//     case 'MODEL':
//       return 3;
//     default:
//       return 4;
//   }
// }

// function sortStacks(a: string, b: string): number {
//   const aO = stackKeyOrder(a);
//   const bO = stackKeyOrder(b);

//   return aO - bO;
// }

// ********************************************************************************************** //

export interface ResourcesListProps {
  resources: ResourceAndRef[];
  selectResource?: (resource: ResourceAndRef) => void;
  displayResourceItem?: (resource: ResourceAndRef) => React.ReactNode;
  showLocationIcon?: boolean;
  showLevels?: boolean;
  readOnly?: boolean;
}

// function ResourcesListSimple({
//   resources,
//   selectResource,
//   displayResourceItem,
//   showLocationIcon = true,
//   readOnly,
// }: ResourcesListProps): JSX.Element {
//   const lang = useLanguage();

//   return (
//     <Flex
//       direction="column"
//       align="stretch"
//       grow={1}
//       className={css({ overflow: 'auto', paddingRight: '2px' })}
//     >
//       {resources.sort(sortResources(lang)).map(resource => (
//         <TocEntry
//           key={getKey(resource)}
//           resource={resource}
//           selectResource={selectResource}
//           displayResource={displayResourceItem}
//           showLocationIcon={showLocationIcon}
//           readOnly={readOnly}
//         />
//       ))}
//     </Flex>
//   );
// }

function ResourcesListByCategory({
  resources,
  selectResource,
  displayResourceItem,
  showLocationIcon = true,
  readOnly,
}: ResourcesListProps): JSX.Element {
  const lang = useLanguage();

  const listsByCategories: Record<string, ResourceAndRef[]> = React.useMemo(() => {
    const reducedByCategory = resources.reduce<Record<string, ResourceAndRef[]>>((acc, current) => {
      const category = getTheDirectResource(current).category || '';

      acc[category] = acc[category] || [];
      acc[category]!.push(current);

      return acc;
    }, {});

    Object.values(reducedByCategory).forEach(list => {
      list.sort(sortResources(lang));
    });

    return reducedByCategory;
  }, [resources, lang]);

  return (
    <Flex
      direction="column"
      align="stretch"
      grow={1}
      className={css({ overflow: 'auto', paddingRight: '2px' })}
    >
      {Object.keys(listsByCategories)
        .sort()
        .map(category => (
          <div key={category}>
            <TocHeader category={category} />

            <Flex direction="column" align="stretch">
              {listsByCategories[category]!.map(resource => (
                <TocEntry
                  key={getKey(resource)}
                  resource={resource}
                  selectResource={selectResource}
                  displayResource={displayResourceItem}
                  showLocationIcon={showLocationIcon}
                  readOnly={readOnly}
                />
              ))}
            </Flex>
          </div>
        ))}
    </Flex>
  );
}

const resourcesStackLabelStyle = css({
  fontWeight: 'bold',
  backgroundColor: 'var(--hoverBgColor)',
  marginTop: 0,
  paddingLeft: space_lg,
  fontSize: '0.8rem',
  textTransform: 'uppercase',
});

function ResourcesListBy3Stacks({
  resources,
  selectResource,
  displayResourceItem,
}: //readOnly,
ResourcesListProps): JSX.Element {
  const i18n = useTranslations();
  const lang = useLanguage();

  const { resourceOwnership } = React.useContext(ResourcesCtx);

  const currentProjectId = useCurrentProjectId();
  const root = useProjectRootCard(currentProjectId);

  // function useIsInCurrentProject1(abstractCardTypeId: number) {

  //   const { cardType } = useAndLoadCardType(abstractCardTypeId);
  //   const projectId = cardType?.projectId;

  //   const { project: currentProject } = useProjectBeingEdited();

  //   return projectId === currentProject?.id;
  // };

  // const isInCurrentProject= React.useCallback((abstractCardTypeId: number) => {

  //   const { cardType } = useAndLoadCardType(abstractCardTypeId);
  //   const projectId = cardType?.projectId;

  //   const { project: currentProject } = useProjectBeingEdited();

  //   return projectId === currentProject?.id;
  // }, []);
  const bySources: Record<string, ResourceAndRef[]> = React.useMemo(() => {
    function get3StackKey(current: ResourceAndRef): StackType {
      // if (current.isDirectResource) {
      //   if (current.targetResource.cardId != null || current.targetResource.cardContentId != null) {
      //     return 'CARD';
      //   }

      //   return 'THEME';
      // }

      if (current.targetResource.cardId != null || current.targetResource.cardContentId != null) {
        if (current.isDirectResource) {
          return 'OWN';
        }

        if (entityIs(root, 'Card') && current.targetResource.cardId === root.id) {
          return 'PROJECT';
        }
      }

      // if (current.targetResource.cardId != null || current.targetResource.cardContentId != null) {

      return 'INHERITED';
      // }

      // return 'THEME';

      // if (
      //   current.targetResource.abstractCardTypeId != null &&
      //   useIsInCurrentProject(current.targetResource.abstractCardTypeId)
      // ) {
      //   return 'PROJECT';
      // }

      // return 'MODEL';
    }

    const reducedBySource = resources.reduce<Record<string, ResourceAndRef[]>>((acc, current) => {
      const sourceKey = get3StackKey(current);

      acc[sourceKey] = acc[sourceKey] || [];
      acc[sourceKey]!.push(current);

      return acc;
    }, {});

    Object.values(reducedBySource).forEach(list => {
      list.sort(sortResources(lang));
    });

    return reducedBySource;
  }, [resources, root, lang]);

  return (
    <Flex
      direction="column"
      align="stretch"
      grow={1}
      className={css({ overflow: 'auto', paddingRight: '2px' })}
    >
      {bySources['OWN'] ? (
        <Collapsible
          label={
            resourceOwnership.kind === 'CardType'
              ? i18n.modules.resource.info.source.theme
              : i18n.modules.resource.info.source.card
          }
          open
          labelClassName={resourcesStackLabelStyle}
        >
          <ResourcesListByCategory
            resources={bySources['OWN']}
            selectResource={selectResource}
            displayResourceItem={displayResourceItem}
            showLocationIcon={false}
          />
        </Collapsible>
      ) : (
        <></>
      )}
      {bySources['INHERITED'] ? (
        <div>
          <Collapsible
            label={i18n.modules.resource.info.source.inherited}
            open
            labelClassName={resourcesStackLabelStyle}
          >
            <ResourcesListByCategory
              resources={bySources['INHERITED']}
              selectResource={selectResource}
              displayResourceItem={displayResourceItem}
              showLocationIcon={false}
            />
          </Collapsible>
        </div>
      ) : (
        <></>
      )}
      {bySources['PROJECT'] ? (
        <div>
          <Collapsible
            label={i18n.modules.resource.info.source.project}
            open
            labelClassName={resourcesStackLabelStyle}
          >
            <ResourcesListByCategory
              resources={bySources['PROJECT']}
              selectResource={selectResource}
              displayResourceItem={displayResourceItem}
              showLocationIcon={false}
            />
          </Collapsible>
        </div>
      ) : (
        <></>
      )}
      {/* //   {bySources['CARD'] ? (
    //     <div className={marginAroundStyle([3], space_S)}>
    //       <Collapsible label="Card" open>
    //         <ResourcesListByCategory
    //           resources={bySources['CARD']}
    //           selectResource={selectResource}
    //           displayResourceItem={displayResourceItem}
    //           showLocationIcon={false}
    //         />
    //       </Collapsible>
    //     </div>
    //   ) : (
    //     <></>
    //   )}
    //   {bySources['THEME'] ? (
    //     <div className={marginAroundStyle([3], space_S)}>
    //       <Collapsible label="Theme" open>
    //         <ResourcesListByCategory
    //           resources={bySources['THEME']}
    //           selectResource={selectResource}
    //           displayResourceItem={displayResourceItem}
    //           showLocationIcon={false}
    //         />
    //       </Collapsible>
    //     </div>
    //   ) : (
    //     <></>
    //   )}
    //   {bySources['PROJECT'] ? (
    //     <div className={marginAroundStyle([3], space_S)}>
    //       <Collapsible label="Project" open>
    //         <ResourcesListByCategory
    //           resources={bySources['PROJECT']}
    //           selectResource={selectResource}
    //           displayResourceItem={displayResourceItem}
    //           showLocationIcon={false}
    //         />
    //       </Collapsible>
    //     </div>
    //   ) : (
    //     <></>
    //   )}
    //   {bySources['MODEL'] ? (
    //     <div className={marginAroundStyle([3], space_S)}>
    //       <Collapsible label="Model" open>
    //         <ResourcesListByCategory
    //           resources={bySources['MODEL']}
    //           selectResource={selectResource}
    //           displayResourceItem={displayResourceItem}
    //           showLocationIcon={false}
    //         />
    //       </Collapsible>
    //     </div>
    //   ) : (
    //     <></>
    //   )}
    //   {bySources['OUTSIDE'] ? (
    //     <div className={marginAroundStyle([3], space_S)}>
    //       <Collapsible label="From outer space" open>
    //         <ResourcesListSimple
    //           resources={bySources['OUTSIDE']}
    //           selectResource={selectResource}
    //           displayResourceItem={displayResourceItem}
    //           showLocationIcon={false}
    //         />
    //       </Collapsible>
    //     </div>
    //   ) : (
    //     <></>
    //   )} */}
    </Flex>
  );
}

function getSourceKey(current: ResourceAndRef) {
  return (
    `ct-${current.targetResource.abstractCardTypeId || 'Z'}` +
    `card-${current.targetResource.cardId || 'Z'}` +
    `cardC-${current.targetResource.cardContentId || 'Z'}`
  );
}

// not an export. just to avoid linter help
export function ResourcesListBySource({
  resources,
  selectResource,
  displayResourceItem,
  readOnly,
}: ResourcesListProps): JSX.Element {
  const lang = useLanguage();

  const bySources: Record<string, ResourceAndRef[]> = React.useMemo(() => {
    const reducedBySource = resources.reduce<Record<string, ResourceAndRef[]>>((acc, current) => {
      const sourceKey = getSourceKey(current);

      acc[sourceKey] = acc[sourceKey] || [];
      acc[sourceKey]!.push(current);

      return acc;
    }, {});

    Object.values(reducedBySource).forEach(list => {
      list.sort(sortResources(lang));
    });

    return reducedBySource;
  }, [resources, lang]);

  return (
    <Flex
      direction="column"
      align="stretch"
      grow={1}
      className={css({ overflow: 'auto', paddingRight: '2px' })}
    >
      {Object.keys(bySources)
        .sort()
        .map(source => (
          <div key={source}>
            <Collapsible
              open
              label={
                <div>
                  <h3
                    className={cx(
                      css({
                        minWidth: '50px',
                        flexGrow: 1,
                      }),
                      oneLineEllipsis,
                    )}
                  >
                    <TargetResourceSummary resource={bySources[source]![0]!} showText="short" />
                  </h3>
                </div>
              }
            >
              <ResourcesListByCategory
                resources={bySources[source]!}
                selectResource={selectResource}
                displayResourceItem={displayResourceItem}
                showLocationIcon={false}
                readOnly={readOnly}
              />
            </Collapsible>
          </div>
        ))}
    </Flex>
  );
}

export default function ResourcesList(props: ResourcesListProps): JSX.Element {
  //const { mode } = React.useContext(TocDisplayCtx);

  return (
    <Flex direction="column" align="stretch" grow={1}>
      {props.showLevels ? (
        <ResourcesListBy3Stacks {...props} />
      ) : (
        <ResourcesListByCategory {...props} />
      )}
      {/* {mode === 'CATEGORY' ? (
        <ResourcesListByCategory {...props} />
      ) : mode === '3_STACKS' ? ( 
      <ResourcesListBy3Stacks {...props} />
      ) : (
        <ResourcesListBySource {...props} />
      )} */}
    </Flex>
  );
}

// ********************************************************************************************** //

interface TocHeaderProps {
  category: React.ReactNode;
}

function TocHeader({ category }: TocHeaderProps): JSX.Element {
  return (
    <>
      {category && (
        <div
          className={cx(
            css({
              minWidth: '50px',
              flexGrow: 1,
              textTransform: 'uppercase',
              marginBottom: 0,
              marginTop: space_sm,
              marginLeft: space_lg,
              marginRight: space_lg,
              borderBottom: '1px solid var(--lightGray)',
              fontWeight: 'bold',
              fontSize: '0.75rem',
            }),
            oneLineEllipsis,
          )}
        >
          {category}
        </div>
      )}
    </>
  );
}

// ********************************************************************************************** //

const tocEntryStyle = css({
  cursor: 'pointer',
  //padding: space_S + ' ' + space_M,
  color: 'var(--pictoGrey)',
  '&:hover': {
    backgroundColor: 'var(--hoverBgColor)',
    color: 'var(--fgColor)',
  },
});

interface TocEntryProps {
  resource: ResourceAndRef;
  selectResource?: (resource: ResourceAndRef) => void;
  displayResource?: (resource: ResourceAndRef) => React.ReactNode;
  showLocationIcon: boolean;
  readOnly?: boolean;
}

function TocEntry({
  resource,
  selectResource,
  displayResource,
  //showLocationIcon,
  readOnly,
}: TocEntryProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [showCategorySelector, setCategorySelector] = React.useState(false);

  const { resourceOwnership } = React.useContext(ResourcesCtx);

  // const { text: teaser } = useAndLoadTextOfDocument(resource.targetResource.teaserId);

  const { nb: nbDocs } = useAndLoadNbDocuments({
    kind: 'PartOfResource',
    ownerId: resource.targetResource.id || 0,
  });
  const accesLevel = useResourceAccessLevelForCurrentUser(resource.targetResource);

  const effectiveReadOnly = readOnly || accesLevel !== 'WRITE'; // !forceWrite && (readOnly || !resource.isDirectResource);

  // const { project } = useProjectBeingEdited();
  // const rootCard = useProjectRootCard(project);

  return (
    <Flex className={tocEntryStyle} justify="space-between">
      {displayResource != null ? (
        displayResource(resource)
      ) : (
        <>
          <Flex
            align="center"
            onClick={() => {
              if (selectResource != null) {
                selectResource(resource);
              }
            }}
            grow={1}
            className={cx(
              css({ padding: '3px ' + space_lg }),
              { [css({ color: 'var(--darkGray)' })]: effectiveReadOnly },
              { [css({ color: 'var(--darkGray)' })]: !effectiveReadOnly },
            )}
          >
            <div
              className={cx(
                css({
                  minWidth: '50px',
                  flexGrow: 1,
                }),
                oneLineEllipsis,
              )}
            >
              {effectiveReadOnly && (
                 <Icon
                  icon={'visibility'}
                  opsz="xs"
                  className={css({ marginRight: '3px' })}
                  color="var(--lightGray)"
                />
              )}
              {resource.targetResource.published && resource.isDirectResource && (
                 <Icon
                  icon={'subdirectory_arrow_right'}
                  opsz="xs"
                  className={css({ marginRight: '3px' })}
                  color="var(--lightGray)"
                />
              )}
              {/* {showLocationIcon && (
                <>
                  <TargetResourceSummary resource={resource} />{' '}
                </>
              )} */}
              {/* <Tooltip
                tooltipClassName={css({
                  width: '400px',
                  height: '600px',
                  overflow: 'hidden',
                  padding: '20px',
                })}
                tooltip={
                  <Flex direction="column" align="stretch">
                    <h3>{resource.targetResource.title}</h3>
                    <Flex className={css({ paddingBottom: '5px' })}>
                      <em>
                        <TargetResourceSummary resource={resource} showText="full" />
                      </em>
                    </Flex>
                    <div
                      className={css({ marginBottom: '5px', borderBottom: '1px solid lightgrey' })}
                    />
                    {teaser && (
                      <div
                        className={css({
                          marginBottom: '5px',
                          borderBottom: '1px solid lightgrey',
                        })}
                      >
                        {teaser}
                      </div>
                    )}
                    <DocumentPreview
                      docOwnership={{
                        kind: 'PartOfResource',
                        ownerId: resource.targetResource.id!,
                      }}
                    />
                  </Flex>
                }
              > */}
              {resource.targetResource.title || i18n.modules.resource.untitled}
              {nbDocs < 1 && <i className={css({ fontWeight: 200 })}> - {i18n.common.empty}</i>}
              {/* </Tooltip> */}
            </div>

            {/* {!resource.targetResource.published &&
              (resource.targetResource.abstractCardTypeId != null ||
                (resource.targetResource.cardId != null &&
                  entityIs(rootCard, 'Card') &&
                  resource.targetResource.cardId === rootCard.id)) && (
                 <Icon
                  icon={faPersonDigging}
                  title={i18n.modules.resource.unpublishedInfoType}
                  className={iconStyle}
                />
              )} */}

            {/* {nbDocs < 1 && (
               <Icon
                icon={'remove'}
                title={i18n.modules.resource.info.noContent}
                className={iconStyle}
              />
            )} */}
            <DropDownMenu
              icon={'more_vert'}
              valueComp={{ value: '', label: '' }}
              buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_sm }))}
              entries={[
                ...(!effectiveReadOnly && resource.isDirectResource
                  ? [
                      {
                        value: 'categorySelector',
                        label: (
                          <>
                             <Icon icon={'settings'} /> {i18n.modules.resource.category}
                          </>
                        ),
                        action: () => setCategorySelector(true),
                      },
                    ]
                  : []),
                ...(!readOnly && resource.isDirectResource && resource.targetResource.id // TODO see conditions
                  ? [
                      {
                        value: 'publishStatus',
                        label: (
                          <>
                             <Icon icon={'subdirectory_arrow_right'} />
                            {resource.targetResource.published
                              ? i18n.modules.resource.actions.makePrivate
                              : i18n.modules.resource.actions.shareWithChildren}
                          </>
                        ),
                        action: () => {
                          if (resource.targetResource.id) {
                            if (resource.targetResource.published) {
                              dispatch(API.unpublishResource(resource.targetResource.id));
                            } else {
                              dispatch(API.publishResource(resource.targetResource.id));
                            }
                          }
                        },
                      },
                    ]
                  : []),
                ...(!resource.isDirectResource && resourceOwnership // TODO voir quelles conditions
                  ? [
                      {
                        value: 'ownCopy',
                        label: (
                          <>
                             <Icon icon={'content-copy'} />{' '}
                            {i18n.modules.resource.actions.makeOwnCopy}
                          </>
                        ),
                        action: () => {
                          dispatch(
                            API.duplicateAndMoveResource({
                              resourceOrRef: resource.targetResource,
                              newParentType:
                                resourceOwnership.kind === 'CardType' ? 'CardType' : 'Card',
                              newParentId:
                                resourceOwnership.kind === 'CardType'
                                  ? resourceOwnership.cardTypeId || 0
                                  : resourceOwnership.cardId || 0,
                            }),
                          );
                        },
                      },
                    ]
                  : []),
                ...(!readOnly
                  ? [
                      {
                        value: 'remove',
                        label: (
                          <>
                             <Icon icon={'inventory_2'} /> {i18n.common.remove}
                          </>
                        ),
                        action: () => {
                          dispatch(API.removeAccessToResource(resource));
                        },
                      },
                    ]
                  : []),
              ]}
            />
          </Flex>

          <Tips tipsType="DEBUG" interactionType="CLICK">
            <div className={css({ fontSize: '0.8em' })}>
              {resource.targetResource && (
                <div>
                  {resource.targetResource.cardId != null && <p> on card </p>}
                  {resource.targetResource.cardContentId != null && <p> on variant </p>}
                  {resource.targetResource.abstractCardTypeId != null && <p> on theme </p>}
                  <p>- {resource.targetResource.published ? 'is' : 'not'} published </p>
                  <p>- {resource.targetResource.deprecated ? 'is' : 'not'} deprecated </p>
                  <p>- "{resource.targetResource.category}"</p>
                  <br />
                </div>
              )}
              {resource.cardTypeResourceRef && (
                <div>
                  <p>theme ref</p>
                  <p>- {resource.cardTypeResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardTypeResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardTypeResourceRef.category}"</p>
                  <br />
                </div>
              )}
              {resource.cardResourceRef && (
                <div>
                  <p>card ref</p>
                  <p>- {resource.cardResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardResourceRef.category}"</p>
                  <br />
                </div>
              )}
              {resource.cardContentResourceRef && (
                <div>
                  <p>variant ref</p>
                  <p>- {resource.cardContentResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardContentResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardContentResourceRef.category}"</p>
                  <br />
                </div>
              )}
            </div>
          </Tips>
          {showCategorySelector && (
            <ResourceCategoryModal resource={resource} onClose={() => setCategorySelector(false)} />
          )}
        </>
      )}
    </Flex>
  );
}

// ********************************************************************************************** //
