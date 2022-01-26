/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faEllipsisH, faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useDocument } from '../../selectors/documentSelector';
import { useAppDispatch } from '../../store/hooks';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import OpenCloseModal from '../common/OpenCloseModal';
import { useBlock } from '../live/LiveTextEditor';
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
  padding: space_S,
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
      <Flex grow={1} direction="column" align="stretch" className={css({ padding: space_M, overflow: 'auto' })}>
        {contextInfo.accessLevel === 'DENIED' ? (
          <div>ACCESS DENIED</div>
        ) : (
          toDisplay.map(category => (
            <div key={category} className={marginAroundStyle([3], space_S)}>
              <h3 className={marginAroundStyle([1], space_M)}>{category}</h3>
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

  const docId = resourceAndRef.targetResource.documentId;
  const document = useDocument(docId);

  React.useEffect(() => {
    if (docId != null && document == null) {
      dispatch(API.getDocument(docId));
    }
  }, [docId, document, dispatch]);

  const teaser = useBlock(resourceAndRef.targetResource.teaserId);

  return (
    <Flex
      title={teaser ? teaser.textData || undefined : i18n.resource.noTeaser}
      className={tocEntryStyle}
      onClick={() => selectResource(resourceAndRef)}
    >
      <div
        className={css({
          width: '120px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginRight: space_S,
          flexGrow: 1,
        })}
      >
        {resourceAndRef.targetResource.title || i18n.resource.untitled}
      </div>

      <OpenCloseModal
        title="Resource Settings"
        showCloseButton={true}
        collapsedChildren={
          <FontAwesomeIcon
            icon={faEllipsisH}
            className={lightIconButtonStyle}
            title="Resource settings"
          />
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
    </Flex>
  );
}
