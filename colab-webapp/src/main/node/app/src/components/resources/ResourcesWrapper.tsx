/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useResources } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { ResourceAndRef, ResourceCallContext, ResourceContextScope } from './ResourceCommonType';
import { ResourceDisplay } from './ResourceDisplay';
import ResourcesList from './ResourcesList';

/**
 * In this component, we load the resources if necessary and call the ResourceList
 */

export type ResourcesWrapperProps = ResourceCallContext;

export default function ResourcesWrapper(contextInfo: ResourcesWrapperProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { resourcesAndRefs, status } = useResources(contextInfo);
  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED' && contextInfo.accessLevel !== 'DENIED') {
      if (
        contextInfo.kind === ResourceContextScope.CardOrCardContent &&
        contextInfo.cardContentId != null
      ) {
        dispatch(API.getResourceChainForCardContentId(contextInfo.cardContentId));
      } else if (
        contextInfo.kind === ResourceContextScope.CardType &&
        contextInfo.cardTypeId != null
      ) {
        dispatch(API.getResourceChainForAbstractCardTypeId(contextInfo.cardTypeId));
      } else {
        // error
        // TODO see what to do
      }
    }
  }, [status, dispatch, contextInfo]);

  const showTOC = React.useCallback(() => selectResource(null), []);

  if (contextInfo.accessLevel === 'DENIED') {
    return (
      <ResourcesList
        resourcesAndRefs={resourcesAndRefs}
        contextInfo={contextInfo}
        selectResource={selectResource}
      />
    );
  } else if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else if (resourcesAndRefs == null) {
    return <div>no resource, no display</div>;
  }

  if (selectedResource != null) {
    // show selected resource
    return <ResourceDisplay resourceAndRef={selectedResource} onClose={showTOC} />;
  } else {
    // no selected resource : show table of content
    return (
      <ResourcesList
        resourcesAndRefs={resourcesAndRefs}
        contextInfo={contextInfo}
        selectResource={selectResource}
      />
    );
  }
}
