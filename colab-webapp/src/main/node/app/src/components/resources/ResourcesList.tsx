/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faTrash, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import { dispatch } from '../../store/store';
import { Destroyer } from '../common/Destroyer';
import Flex from '../common/Flex';
import WithToolbar from '../common/WithToolbar';
import { getKey, ResourceAndRef, ResourceCallContext } from './ResourceCommonType';
import ResourceCreator from './ResourceCreator';
import ResourceMiniDisplay from './ResourceMiniDisplay';

/**
 * List of ResourceAndRef which handles sorting, adding, removing.
 */

// TODO real sort order
function sortResources(a: ResourceAndRef, b: ResourceAndRef): number {
  return (a.targetResource.id || 0) - (b.targetResource.id || 0);
}

export interface ResourcesListProps {
  resourcesAndRefs: ResourceAndRef[];
  contextInfo: ResourceCallContext;
}

export default function ResourcesList({
  resourcesAndRefs,
  contextInfo,
}: ResourcesListProps): JSX.Element {
  return (
    <Flex direction="column">
      <h3>Resources</h3>
      <div>
        {resourcesAndRefs.sort(sortResources).map(resourceAndRef => (
          <WithToolbar
            key={getKey(resourceAndRef)}
            toolbarPosition="RIGHT_BOTTOM"
            offsetY={-0.5}
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
            }
          >
            <ResourceMiniDisplay
              targetResource={resourceAndRef.targetResource}
              isDirectResource={resourceAndRef.isDirectResource}
              cardTypeResourceRef={resourceAndRef.cardTypeResourceRef}
              cardResourceRef={resourceAndRef.cardResourceRef}
              cardContentResourceRef={resourceAndRef.cardContentResourceRef}
            />
          </WithToolbar>
        ))}
      </div>
      <div>
        <ResourceCreator contextInfo={contextInfo} />
      </div>
    </Flex>
  );
}
