/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import Tips from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import { marginAroundStyle, space_M, space_S } from '../styling/style';
import { getKey, getTheDirectResource, ResourceAndRef } from './resourcesCommonType';

// TODO UI : allow to have more thant 150px for the texts
// => solution à l'arrache de mettre 300. mais pas pas satisfaisant

/**
 * List of ResourceAndRef grouped by category
 */

// for the moment, the resources are ordered by id (= creation date)
function sortResources(a: ResourceAndRef, b: ResourceAndRef): number {
  return (a.targetResource.title || '').localeCompare(b.targetResource.title || '');
  // return (a.targetResource.id || 0) - (b.targetResource.id || 0);
}

// ********************************************************************************************** //

export interface ResourcesListProps {
  resources: ResourceAndRef[];
  selectResource?: (resource: ResourceAndRef) => void;
  displayResourceItem?: (resource: ResourceAndRef) => React.ReactNode;
}

export default function ResourcesList({
  resources,
  selectResource,
  displayResourceItem,
}: ResourcesListProps): JSX.Element {
  const listsByCategories: Record<string, ResourceAndRef[]> = React.useMemo(() => {
    const reducedByCategory = resources.reduce<Record<string, ResourceAndRef[]>>((acc, current) => {
      const category = getTheDirectResource(current).category || '';

      acc[category] = acc[category] || [];
      acc[category]!.push(current);

      return acc;
    }, {});

    Object.values(reducedByCategory).forEach(list => {
      list.sort(sortResources);
    });

    return reducedByCategory;
  }, [resources]);

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
                />
              ))}
            </Flex>
          </div>
        ))}
    </Flex>
  );
}

// ********************************************************************************************** //

interface TocHeaderProps {
  category: string;
}

function TocHeader({ category }: TocHeaderProps): JSX.Element {
  return (
    <>
      {category && (
        <div className={marginAroundStyle([1, 2, 4], space_M)}>
          <h3
            className={css({
              maxWidth: '300px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexGrow: 1,
            })}
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
}

function TocEntry({ resource, selectResource, displayResource }: TocEntryProps): JSX.Element {
  const i18n = useTranslations();

  const { text: teaser } = useAndLoadTextOfDocument(resource.targetResource.teaserId);

  return (
    <Flex className={tocEntryStyle} justify="space-between">
      {displayResource != null ? (
        displayResource(resource)
      ) : (
        <>
          <Flex
            title={teaser || ''}
            onClick={() => {
              if (selectResource != null) {
                selectResource(resource);
              }
            }}
            grow={1}
            className={css({ padding: space_S + ' ' + space_M })}
          >
            <div
              className={css({
                maxWidth: '300px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexGrow: 1,
              })}
            >
              {resource.targetResource.title || i18n.modules.resource.untitled}
            </div>
          </Flex>
          <Tips tipsType="DEBUG" interactionType="CLICK">
            <div className={css({ fontSize: '0.8em' })}>
              {resource.targetResource && (
                <div>
                  {resource.targetResource.cardId != null && <p> on card </p>}
                  {resource.targetResource.cardContentId != null && <p> on var </p>}
                  {resource.targetResource.abstractCardTypeId != null && <p> on model </p>}
                  <p>- {resource.targetResource.published ? 'is' : 'not'} published </p>
                  <p>- {resource.targetResource.deprecated ? 'is' : 'not'} deprecated </p>
                  <p>- "{resource.targetResource.category}"</p>
                  <br />
                </div>
              )}
              {resource.cardTypeResourceRef && (
                <div>
                  <p>type ref</p>
                  <p>- {resource.cardTypeResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardTypeResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardTypeResourceRef.category}"</p>
                </div>
              )}
              {resource.cardResourceRef && (
                <div>
                  <p>card ref</p>
                  <p>- {resource.cardResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardResourceRef.category}"</p>
                </div>
              )}
              {resource.cardContentResourceRef && (
                <div>
                  <p>var ref</p>
                  <p>- {resource.cardContentResourceRef.residual ? 'is' : 'not'} residual </p>
                  <p>- {resource.cardContentResourceRef.refused ? 'is' : 'not'} refused </p>
                  <p>- "{resource.cardContentResourceRef.category}"</p>
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
