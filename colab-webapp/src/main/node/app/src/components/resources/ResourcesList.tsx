/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faCog, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import OpenCloseModal from '../common/OpenCloseModal';
import WithToolbar from '../common/WithToolbar';
import { lightIconButtonStyle, marginAroundStyle, space_M, space_S } from '../styling/style';
import { getKey, ResourceAndRef, ResourceCallContext } from './ResourceCommonType';
import ResourceCreator from './ResourceCreator';
import { ResourceSettings } from './ResourceMiniDisplay';

/**
 * List of ResourceAndRef which handles sorting, adding, removing.
 */
// TODO real sort order
function sortResources(a: ResourceAndRef, b: ResourceAndRef): number {
  return (a.targetResource.id || 0) - (b.targetResource.id || 0);
}

const tocEntryStyle = css({
  cursor: 'pointer',
  padding: space_S + ' ' + space_M,
  color: 'var(--pictoGrey)',
  '&:hover': {
    backgroundColor: 'var(--hoverBgColor)',
    color: 'var(--fgColor)',
  },
});

export interface ResourcesListProps {
  resourcesAndRefs: ResourceAndRef[];
  contextInfo: ResourceCallContext;
  selectResource: (r: ResourceAndRef) => void;
}
interface Categorized {
  categorized: Record<string, ResourceAndRef[]>;
  raw: ResourceAndRef[];
}

export default function ResourcesList({
  resourcesAndRefs,
  contextInfo,
  selectResource,
}: ResourcesListProps): JSX.Element {
  const categorized = resourcesAndRefs.reduce<Categorized>(
    (acc, current) => {
      const cat =
        (current.cardResourceRef || current.cardContentResourceRef || current.cardTypeResourceRef)
          ?.category || current.targetResource.category;

      if (cat) {
        acc.categorized[cat] = acc.categorized[cat] || [];
        acc.categorized[cat]!.push(current);
      } else {
        acc.raw.push(current);
      }
      return acc;
    },
    {
      categorized: {},
      raw: [],
    },
  );

  const categories = Object.keys(categorized.categorized);

  const toDisplay = [...categories];

  // hack to show uncategorized in the "uncategorized" group
  if (categorized.raw.length > 0) {
    toDisplay.push('uncategorized');
    categorized.categorized['uncategorized'] = categorized.raw;
  }

  return (
    <Flex direction="column" align="stretch">
      <Flex
        className={css({ borderBottom: '1px solid var(--lightGray)', padding: '0 ' + space_M })}
      >
        <h2>Resources</h2>
      </Flex>
      <Flex
        grow={1}
        direction="column"
        align="stretch"
        className={css({ overflow: 'auto', paddingRight: '2px', width: '170px' })}
      >
        {contextInfo.accessLevel === 'DENIED' ? (
          <div>ACCESS DENIED</div>
        ) : (
          toDisplay.map(category => (
            <div key={category} className={marginAroundStyle([3], space_S)}>
              <div className={marginAroundStyle([1, 2, 4], space_M)}>
                <h3
                  className={css({
                    maxWidth: '150px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flexGrow: 1,
                  })}
                  title={category}
                >
                  {category}
                </h3>
              </div>
              <Flex direction="column" align="stretch">
                {categorized.categorized[category]!.sort(sortResources).map(resourceAndRef => (
                  <TocEntry
                    key={getKey(resourceAndRef)}
                    resourceAndRef={resourceAndRef}
                    selectResource={selectResource}
                  />
                ))}
              </Flex>
            </div>
          ))
        )}
        <div className={css({ marginRight: '10px' })}> </div>
      </Flex>
      {contextInfo.accessLevel === 'WRITE' ? (
        <ResourceCreator
          contextInfo={contextInfo}
          categories={categories}
          className={lightIconButtonStyle}
        />
      ) : null}
    </Flex>
  );
}

interface TocEntryProps {
  resourceAndRef: ResourceAndRef;
  selectResource: (r: ResourceAndRef) => void;
}

function TocEntry({ resourceAndRef, selectResource }: TocEntryProps) {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const { text: teaser } = useAndLoadTextOfDocument(resourceAndRef.targetResource.teaserId);

  return (
    <Flex
      title={teaser || ''}
      className={tocEntryStyle}
      onClick={() => selectResource(resourceAndRef)}
    >
      <WithToolbar
        containerClassName={css({ width: '100%' })}
        toolbarPosition="RIGHT_MIDDLE"
        offsetX={-0.5}
        offsetY={0.5}
        toolbar={
          <OpenCloseModal
            title="Resource Settings"
            showCloseButton={true}
            collapsedChildren={
              <IconButton icon={faCog} className={lightIconButtonStyle} title="Resource settings" />
            }
            className={css({ alignSelf: 'flex-end' })}
          >
            {() => (
              <>
                <ResourceSettings {...resourceAndRef} />
                {resourceAndRef.isDirectResource && (
                  <Destroyer
                    title="Delete this resource"
                    icon={faTrashAlt}
                    onDelete={() => {
                      dispatch(API.deleteResource(resourceAndRef.targetResource));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardTypeResourceRef && (
                  <Destroyer
                    title="Refuse at card type level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardTypeResourceRef!));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardResourceRef && (
                  <Destroyer
                    title="Refuse at card level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardResourceRef!));
                    }}
                  />
                )}
                {!resourceAndRef.isDirectResource && resourceAndRef.cardContentResourceRef && (
                  <Destroyer
                    title="Refuse at variant level"
                    icon={faTrash}
                    onDelete={() => {
                      dispatch(API.removeAccessToResource(resourceAndRef.cardContentResourceRef!));
                    }}
                  />
                )}
              </>
            )}
          </OpenCloseModal>
        }
      >
        <div
          className={css({
            maxWidth: '150px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
          })}
        >
          {resourceAndRef.targetResource.title || i18n.resource.untitled}
        </div>
      </WithToolbar>
    </Flex>
  );
}
