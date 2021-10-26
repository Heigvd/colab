/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {css} from '@emotion/css';
import {faCogs, faTrash, faTrashAlt} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import {useDocument} from '../../selectors/documentSelector';
import {useAppDispatch} from '../../store/hooks';
import {Destroyer} from '../common/Destroyer';
import Flex from '../common/Flex';
import OpenCloseModal from '../common/OpenCloseModal';
import WithToolbar from '../common/WithToolbar';
import {useBlock} from '../live/LiveTextEditor';
import {getKey, ResourceAndRef, ResourceCallContext} from './ResourceCommonType';
import ResourceCreator from './ResourceCreator';
import {ResourceSettings} from './ResourceMiniDisplay';

/**
 * List of ResourceAndRef which handles sorting, adding, removing.
 */
// TODO real sort order
function sortResources(a: ResourceAndRef, b: ResourceAndRef): number {
  return (a.targetResource.id || 0) - (b.targetResource.id || 0);
}

const tocEntryStyle = css({
  cursor: 'pointer',
  padding: "10px",
});

export interface ResourcesListProps {
  resourcesAndRefs: ResourceAndRef[];
  contextInfo: ResourceCallContext;
  selectResource: (r: ResourceAndRef) => void
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
    <Flex direction="column">
      <h3>Resources</h3>
      <div>
        {toDisplay.map(category => (
          <div key={category}>
            <h3>{category}</h3>
            <div>
              {categorized.categorized[category]!.sort(sortResources).map(resourceAndRef => (
                <TocEntry
                  key={getKey(resourceAndRef)}
                  resourceAndRef={resourceAndRef}
                  selectResource={selectResource}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div>
        <ResourceCreator contextInfo={contextInfo} categories={categories} />
      </div>
    </Flex>
  );
}


interface TocEntryProps {
  resourceAndRef: ResourceAndRef;
  selectResource: (r: ResourceAndRef) => void;
}

function TocEntry({resourceAndRef, selectResource}: TocEntryProps) {
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
    <WithToolbar
      toolbarPosition="RIGHT_BOTTOM"
      toolbar={
        <>
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
                dispatch(
                  API.removeAccessToResource(resourceAndRef.cardTypeResourceRef!),
                );
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
                dispatch(
                  API.removeAccessToResource(resourceAndRef.cardContentResourceRef!),
                );
              }}
            />
          )}
          <OpenCloseModal
            title='Resource Settings'
            showCloseButton={true}
            collapsedChildren={<FontAwesomeIcon icon={faCogs} />}>
            {
              () =>
                <ResourceSettings {...resourceAndRef} />
            }
          </OpenCloseModal>
        </>
      }
    >
      <div
        title={teaser ? teaser.textData || undefined : i18n.resource.noTeaser}
        className={tocEntryStyle}
        onClick={() => selectResource(resourceAndRef)}
      >
        {resourceAndRef.targetResource.title || i18n.resource.untitled}
      </div>
    </WithToolbar>

  );
}