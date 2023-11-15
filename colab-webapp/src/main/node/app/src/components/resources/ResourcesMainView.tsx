/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResources } from '../../store/selectors/resourceSelector';
import { lightIconButtonStyle, space_sm, space_xl } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import HidenResourcesKeeper from './HidenResourcesKeeper';
import ResourceCreator from './ResourceCreator';
import { ResourceDisplay } from './ResourceDisplay';
import ResourcesList from './ResourcesList';
import {
  AccessLevel,
  ResourceAndRef,
  ResourceOwnership,
  defaultResourceOwnerShip,
  isReadOnly,
} from './resourcesCommonType';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Context
////////////////////////////////////////////////////////////////////////////////////////////////////

export type DisplayMode = 'LIST' | 'ONE_RESOURCE';

interface ResourcesContext {
  resourceOwnership: ResourceOwnership;
  displayMode: DisplayMode | null;
  setDisplayMode: (mode: DisplayMode | null) => void;
  selectedResource: ResourceAndRef | null; // TODO number
  selectResource: (resource: ResourceAndRef | null) => void;
  lastCreatedId: number | null;
  setLastCreatedId: (id: number | null) => void;
  publishNewResource?: boolean;
}

const defaultResourcesContext: ResourcesContext = {
  resourceOwnership: defaultResourceOwnerShip,
  displayMode: 'LIST',
  setDisplayMode: () => {},
  selectedResource: null,
  selectResource: () => {},
  lastCreatedId: null,
  setLastCreatedId: () => {},
  publishNewResource: false,
};

export const ResourcesCtx = React.createContext<ResourcesContext>(defaultResourcesContext);

////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////

interface ResourcesMainViewHeaderProps {
  title?: React.ReactNode;
}

export function ResourcesMainViewHeader({ title }: ResourcesMainViewHeaderProps): JSX.Element {
  const i18n = useTranslations();

  const { displayMode, setDisplayMode, selectResource } = React.useContext(ResourcesCtx);

  const displayList = React.useCallback(() => {
    setDisplayMode('LIST');
    selectResource(null);
  }, [setDisplayMode, selectResource]);

  return (
    <>
      {displayMode !== 'LIST' && (
        <IconButton
          icon={'arrow_back'}
          title={i18n.modules.resource.backList}
          onClick={displayList}
          className={lightIconButtonStyle}
        />
      )}

      {title}

      {displayMode === 'LIST' && (
        <>
          <ResourceCreator collapsedClassName={lightIconButtonStyle} />
          {/* Note : we can imagine that a read access level allows to see the ghost resources */}
          <HidenResourcesKeeper
            collapsedClassName={cx(
              css({
                padding: space_sm,
                '&:hover': { cursor: 'pointer' },
              }),
              lightIconButtonStyle,
            )}
          />
        </>
      )}
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Main component to show resources.
 * It handles a list of resources fetched according to the contextData.
 * If a resource is selected, it is displayed.
 * It can allow to create a resource.
 * It can allow to display and revive a deprecated, refused or residual resource.
 */

interface ResourcesMainPanelProps {
  accessLevel: AccessLevel;
  showVoidIndicator?: boolean;
  showLevels?: boolean;
}

export function ResourcesMainViewPanel({
  accessLevel,
  showVoidIndicator,
  showLevels,
}: ResourcesMainPanelProps): JSX.Element {
  const i18n = useTranslations();

  const {
    resourceOwnership,
    displayMode,
    setDisplayMode,
    selectedResource,
    selectResource,
    lastCreatedId,
    setLastCreatedId,
  } = React.useContext(ResourcesCtx);

  const { activeResources, status } = useAndLoadResources(resourceOwnership);

  // just to see if it changes
  const [currentContext, setCurrentContext] = React.useState<ResourceOwnership>(resourceOwnership);

  const showList = React.useCallback(() => {
    setDisplayMode('LIST');
    selectResource(null);
  }, [setDisplayMode, selectResource]);

  const showSelectedResource = React.useCallback(
    (resource: ResourceAndRef) => {
      setDisplayMode('ONE_RESOURCE');
      selectResource(resource);
    },
    [setDisplayMode, selectResource],
  );

  React.useEffect(() => {
    // show the list if the context changed
    if (resourceOwnership.kind !== currentContext.kind) {
      showList();
    } else if (
      resourceOwnership.kind === 'CardOrCardContent' &&
      currentContext.kind === 'CardOrCardContent' &&
      (resourceOwnership.cardId !== currentContext.cardId ||
        resourceOwnership.cardContentId !== currentContext.cardContentId)
    ) {
      showList();
    } else if (
      resourceOwnership.kind === 'CardType' &&
      currentContext.kind === 'CardType' &&
      resourceOwnership.cardTypeId !== currentContext.cardTypeId
    ) {
      showList();
    }

    setCurrentContext(resourceOwnership);
  }, [resourceOwnership, currentContext, setCurrentContext, showList]);

  // when a resource is just created, select it to display it
  React.useEffect(() => {
    if (lastCreatedId != null) {
      const matchingResource = activeResources.find(
        resource => resource.targetResource.id === lastCreatedId,
      );

      if (matchingResource != null) {
        showSelectedResource(matchingResource);
        setLastCreatedId(null);
      }
    }
  }, [activeResources, showSelectedResource, lastCreatedId, setLastCreatedId]);

  /**
   * Quick Fix: keep selectedResource up-to-date
   * TODO: identify selectedResource by id
   */
  React.useEffect(() => {
    if (selectedResource != null) {
      const found = activeResources.find(
        ar => ar.targetResource.id === selectedResource.targetResource.id,
      );
      if (found && found.targetResource != selectedResource.targetResource) {
        showSelectedResource(found);
      }
    }
  }, [activeResources, selectedResource, showSelectedResource]);

  if (accessLevel === 'DENIED') {
    return <div>{i18n.common.error.accessDenied}</div>;
  }

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  }

  if (displayMode === 'ONE_RESOURCE' && selectedResource) {
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
    <Flex direction="column" align="stretch" grow={1} className={css({ overflow: 'auto' })}>
      {showVoidIndicator && activeResources.length === 0 && (
        <Flex
          justify="center"
          direction="column"
          align="center"
          className={css({ padding: space_xl })}
        >
          <h3>{i18n.modules.resource.noDocumentationYet}</h3>
          {!isReadOnly(accessLevel) && (
            <ResourceCreator
              collapsedClassName={lightIconButtonStyle}
              customButton={
                <Button icon={'add'} kind="outline">
                  {i18n.modules.document.createDocument}
                </Button>
              }
            />
          )}
        </Flex>
      )}

      <ResourcesList
        resources={activeResources}
        selectResource={showSelectedResource}
        readOnly={isReadOnly(accessLevel)}
        showLevels={showLevels}
      />

      {!isReadOnly(accessLevel) && (
        <Flex>
          {/* <ResourceCreator
            contextInfo={contextData}
            collapsedClassName={lightIconButtonStyle}
          /> */}
        </Flex>
      )}
    </Flex>
  );
}
