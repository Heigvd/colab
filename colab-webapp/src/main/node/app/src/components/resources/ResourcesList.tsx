/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadTextOfDocument } from '../../selectors/documentSelector';
import Flex from '../common/layout/Flex';
import { lightIconButtonStyle, marginAroundStyle, oneLineEllipsis, space_M, space_S } from '../styling/style';
import { getKey, ResourceAndRef, ResourceCallContext } from './ResourceCommonType';
import ResourceCreator from './ResourceCreator';

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
  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

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

  // hack to show uncategorized in a discreet group at the beginning
  if (categorized.raw.length > 0) {
    toDisplay.splice(0, 0, '');
    categorized.categorized[''] = categorized.raw;
  }

  React.useEffect(() => {
    if (lastCreated) {
      resourcesAndRefs.forEach(resource => {
        if (resource.targetResource.id === lastCreated) {
          selectResource(resource);
          setLastCreated(null);
        }
      });
    }
  }, [lastCreated, resourcesAndRefs, selectResource, setLastCreated]);

  return (
    <Flex direction="column" align="stretch" grow={1}>
      <Flex
        grow={1}
        direction="column"
        align="stretch"
        className={css({ overflow: 'auto', paddingRight: '2px' })}
      >
        {contextInfo.accessLevel === 'DENIED' ? (
          <div>ACCESS DENIED</div>
        ) : (
          toDisplay.map(category => (
            <div key={category} className={marginAroundStyle([3], space_S)}>
              {category && (
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
              )}

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
      {contextInfo.accessLevel === 'WRITE' && (
        <ResourceCreator
          contextInfo={contextInfo}
          className={lightIconButtonStyle}
          onCreated={setLastCreated}
        />
      )}
    </Flex>
  );
}

interface TocEntryProps {
  resourceAndRef: ResourceAndRef;
  selectResource: (r: ResourceAndRef) => void;
}

function TocEntry({ resourceAndRef, selectResource }: TocEntryProps) {
  const i18n = useTranslations();

  const { text: teaser } = useAndLoadTextOfDocument(resourceAndRef.targetResource.teaserId);

  return (
    <Flex
      title={teaser || ''}
      className={tocEntryStyle}
      onClick={() => selectResource(resourceAndRef)}
    >
      <div
        className={cx(css({
          minWidth: '50px',
          flexGrow: 1,
        }), oneLineEllipsis)}
      >
        {resourceAndRef.targetResource.title || i18n.modules.resource.untitled}
      </div>
    </Flex>
  );
}
