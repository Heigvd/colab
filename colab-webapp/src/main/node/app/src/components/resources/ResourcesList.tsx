/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faCopy, faEllipsisV, faTurnDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations, { useLanguage } from '../../i18n/I18nContext';
import { useAndLoadNbDocuments } from '../../selectors/documentSelector';
import { dispatch } from '../../store/store';
import Tips from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import {
  lightIconButtonStyle,
  marginAroundStyle,
  oneLineEllipsis,
  space_M,
  space_S,
} from '../styling/style';
import {
  getKey,
  getTheDirectResource,
  ResourceAndRef,
  ResourceCallContext,
} from './resourcesCommonType';
import { TocDisplayCtx } from './ResourcesMainView';
import TargetResourceSummary from './summary/TargetResourceSummary';

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

// ********************************************************************************************** //

export interface ResourcesListProps {
  resources: ResourceAndRef[];
  selectResource?: (resource: ResourceAndRef) => void;
  displayResourceItem?: (resource: ResourceAndRef) => React.ReactNode;
  showLocationIcon?: boolean;
  contextData?: ResourceCallContext;
}

function ResourcesListByCategory({
  resources,
  selectResource,
  displayResourceItem,
  showLocationIcon = true,
  contextData,
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
          <div key={category} className={marginAroundStyle([3], space_S)}>
            <TocHeader category={category} />

            <Flex direction="column" align="stretch">
              {listsByCategories[category]!.map(resource => (
                <TocEntry
                  key={getKey(resource)}
                  resource={resource}
                  selectResource={selectResource}
                  displayResource={displayResourceItem}
                  showLocationIcon={showLocationIcon}
                  contextData={contextData}
                />
              ))}
            </Flex>
          </div>
        ))}
    </Flex>
  );
}

function getSourceKey(current: ResourceAndRef) {
  return (
    `ct-${current.targetResource.abstractCardTypeId || 'Z'}` +
    `card-${current.targetResource.cardId || 'Z'}` +
    `cardC-${current.targetResource.abstractCardTypeId || 'Z'}`
  );
}

function ResourcesListBySource({
  resources,
  selectResource,
  displayResourceItem,
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
          <div key={source} className={marginAroundStyle([3], space_S)}>
            <TocHeader
              category={
                <TargetResourceSummary resource={bySources[source]![0]!} showText="short" />
              }
            />

            <Flex className={css({ marginLeft: space_S })} direction="column" align="stretch">
              <ResourcesListByCategory
                resources={bySources[source]!}
                selectResource={selectResource}
                displayResourceItem={displayResourceItem}
                showLocationIcon={false}
              />
            </Flex>
          </div>
        ))}
    </Flex>
  );
}

export default function ResourcesList(props: ResourcesListProps): JSX.Element {
  const { mode } = React.useContext(TocDisplayCtx);

  return (
    <Flex direction="column" align="stretch" grow={1}>
      {mode === 'CATEGORY' ? (
        <ResourcesListByCategory {...props} />
      ) : (
        <ResourcesListBySource {...props} />
      )}
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
        <div className={marginAroundStyle([1, 2, 4], space_M)}>
          <h3
            className={cx(
              css({
                minWidth: '50px',
                flexGrow: 1,
              }),
              oneLineEllipsis,
            )}
          >
            {category}
          </h3>
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
  contextData?: ResourceCallContext;
}

function TocEntry({
  resource,
  selectResource,
  displayResource,
  //showLocationIcon,
  contextData,
}: TocEntryProps): JSX.Element {
  const i18n = useTranslations();

  // const { text: teaser } = useAndLoadTextOfDocument(resource.targetResource.teaserId);

  const { nb: nbDocs } = useAndLoadNbDocuments({
    kind: 'PartOfResource',
    ownerId: resource.targetResource.id || 0,
  });

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
            className={css({ padding: space_S + ' ' + space_M })}
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
              {resource.targetResource.published && <FontAwesomeIcon icon={faTurnDown} size='xs' className={css({marginRight: '3px'})}/>}
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
                <FontAwesomeIcon
                  icon={faPersonDigging}
                  title={i18n.modules.resource.unpublishedInfoType}
                  className={iconStyle}
                />
              )} */}

            {/* {nbDocs < 1 && (
              <FontAwesomeIcon
                icon={faMinus}
                title={i18n.modules.resource.info.noContent}
                className={iconStyle}
              />
            )} */}
            <DropDownMenu
              icon={faEllipsisV}
              valueComp={{ value: '', label: '' }}
              buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
              entries={[
                ...(!resource.isDirectResource && contextData // TODO voir quelles conditions
                  ? [
                      {
                        value: 'ownCopy',
                        label: (
                          <>
                            <FontAwesomeIcon icon={faCopy} />{' '}
                            {i18n.modules.resource.actions.makeOwnCopy}
                          </>
                        ),
                        action: () => {
                          dispatch(
                            API.duplicateAndMoveResource({
                              resourceOrRef: resource.targetResource,
                              newParentType: contextData.kind === 'CardType' ? 'CardType' : 'Card',
                              newParentId:
                                contextData.kind === 'CardType'
                                  ? contextData.cardTypeId || 0
                                  : contextData.cardId || 0,
                            }),
                          );
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
        </>
      )}
    </Flex>
  );
}

// ********************************************************************************************** //
