/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResources } from '../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Flex from '../common/layout/Flex';
import { lightIconButtonStyle, space_S } from '../styling/style';
import HidenResourcesKeeper from './HidenResourcesKeeper';
import ResourceCreator from './ResourceCreator';
import { ResourceDisplay } from './ResourceDisplay';
import {
  AccessLevel,
  isReadOnly,
  ResourceAndRef,
  ResourceCallContext,
} from './resourcesCommonType';
import ResourcesList from './ResourcesList';

/**
 * Main component to show resources.
 * It handles a list of resources fetched according to the contextData.
 * If a resource is selected, it is displayed.
 * It can allow to create a resource.
 * It can allow to display and revive a deprecated, refused or residual resource.
 */

interface ResourcesMainViewProps {
  contextData: ResourceCallContext;
  accessLevel: AccessLevel;
}

export default function ResourcesMainView({
  contextData,
  accessLevel,
}: ResourcesMainViewProps): JSX.Element {
  const i18n = useTranslations();

  const { activeResources, ghostResources, status } = useAndLoadResources(contextData);

  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);

  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

  const showList = React.useCallback(() => selectResource(null), []);

  // when a resource is just created, select it to display it
  React.useEffect(() => {
    if (lastCreated != null) {
      const matchingResource = activeResources.find(
        resource => resource.targetResource.id === lastCreated,
      );

      if (matchingResource != null) {
        selectResource(matchingResource);
        setLastCreated(null);
      }
    }
  }, [lastCreated, activeResources, selectResource, setLastCreated]);

  if (accessLevel === 'DENIED') {
    return <div>{i18n.common.error.accessDenied}</div>;
  }

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (selectedResource) {
    // show selected resource
    return (
      <ResourceDisplay
        resource={selectedResource}
        readOnly={isReadOnly(accessLevel)}
        goBackToList={showList}
      />
    );
  }

  // nothing selected : show the list with some actions
  return (
    <Flex direction="column" align="stretch" grow={1}>
      <ResourcesList resources={activeResources} selectResource={selectResource} />

      {!isReadOnly(accessLevel) && (
        <Flex>
          <ResourceCreator
            contextInfo={contextData}
            onCreated={setLastCreated}
            className={lightIconButtonStyle}
          />

          {ghostResources != null && ghostResources.length > 0 && (
            // note : we can imagine that a read access level allows to see the ghost resources
            <>
              <span
                className={css({
                  width: '1px',
                  height: '100%',
                  backgroundColor: 'var(--lightGray)',
                })}
              />
              <HidenResourcesKeeper
                resources={ghostResources}
                collapsedClassName={cx(
                  css({
                    borderTop: '1px solid var(--lightGray)',
                    padding: space_S,
                    '&:hover': { backgroundColor: 'var(--lightGray)', cursor: 'pointer' },
                  }),
                  lightIconButtonStyle,
                )}
              />
            </>
          )}
        </Flex>
      )}
    </Flex>
  );
}
