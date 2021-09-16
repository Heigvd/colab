/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useResource } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';
import { ResourceCallContext, ResourceContextScope } from './ResourceCommonType';
import ResourcesList from './ResourcesList';

/**
 * In this component, we load the resources if necessary and call the ResourceList
 */

export type ResourcesWrapperProps = ResourceCallContext;

export default function ResourcesWrapper(contextInfo: ResourcesWrapperProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { resourcesAndRefs, status } = useResource(contextInfo);

  React.useEffect(() => {
    if (status == 'NOT_INITIALIZED') {
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

  if (status === 'NOT_INITIALIZED') {
    return <InlineLoading />;
  } else if (status === 'LOADING') {
    return <InlineLoading />;
  } else if (resourcesAndRefs == null) {
    return <div>no resource, no display</div>;
  }
  return <ResourcesList resourcesAndRefs={resourcesAndRefs} contextInfo={contextInfo} />;
}
