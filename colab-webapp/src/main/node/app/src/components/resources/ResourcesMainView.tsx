/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResources } from '../../selectors/resourceSelector';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import Tips, { WIPContainer } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import {
  invertedButtonStyle,
  lightIconButtonStyle,
  lightText,
  space_L,
  space_S,
  textSmall,
} from '../styling/style';
import HidenResourcesKeeper from './HidenResourcesKeeper';
import ResourceCreator from './ResourceCreator';
import { ResourceDisplay } from './ResourceDisplay';
import {
  AccessLevel,
  defaultResourceOwnerShip,
  isReadOnly,
  ResourceAndRef,
  ResourceOwnership,
} from './resourcesCommonType';
import ResourcesList, { TocDisplayCtx, TocMode } from './ResourcesList';

////////////////////////////////////////////////////////////////////////////////////////////////////
// Resource Context
////////////////////////////////////////////////////////////////////////////////////////////////////

interface ResourcesContext {
  resourceOwnership: ResourceOwnership;
  selectedResource: ResourceAndRef | null; // TODO number
  selectResource: (resource: ResourceAndRef | null) => void;
  lastCreatedId: number | null;
  setLastCreatedId: (id: number | null) => void;
  publishNewResource?: boolean;
}

const defaultResourcesContext: ResourcesContext = {
  resourceOwnership: defaultResourceOwnerShip,
  selectedResource: null,
  selectResource: () => {},
  lastCreatedId: null,
  setLastCreatedId: () => {},
  publishNewResource: false,
};

export const ResourcesCtx = React.createContext<ResourcesContext>(defaultResourcesContext);

////////////////////////////////////////////////////////////////////////////////////////////////////

type DisplayMode = 'LIST' | 'ONE_RESOURCE';

////////////////////////////////////////////////////////////////////////////////////////////////////

export function TocDisplayToggler(): JSX.Element {
  // const i18n = useTranslations();
  const { mode, setMode } = React.useContext(TocDisplayCtx);

  const entries: { value: TocMode; label: React.ReactNode }[] = [
    { value: 'CATEGORY', label: <div>cat</div> },
    { value: 'SOURCE', label: <div>src</div> },
    { value: '3_STACKS', label: <div>3</div> },
  ];

  return (
    <WIPContainer>
      <DropDownMenu
        value={mode}
        entries={entries}
        onSelect={entry => setMode(entry.value)}
        //idleHoverStyle="BACKGROUND"
        menuIcon="CARET"
      />
    </WIPContainer>
  );
}

////////////////////////////////////////////////////////////////////////////////////////////////////

interface ResourcesMainViewHeaderProps {
  title: React.ReactNode;
  helpTip?: React.ReactNode;
}

export function ResourcesMainViewHeader({
  title,
  helpTip,
}: ResourcesMainViewHeaderProps): JSX.Element {
  const i18n = useTranslations();

  const { selectedResource, selectResource } = React.useContext(ResourcesCtx);

  const displayMode: DisplayMode = React.useMemo(() => {
    if (selectedResource != null) {
      return 'ONE_RESOURCE';
    }

    return 'LIST';
  }, [selectedResource]);

  const displayList = React.useCallback(() => {
    selectResource(null);
  }, [selectResource]);

  return (
    <>
      {displayMode !== 'LIST' && (
        <IconButton
          icon={faArrowLeft}
          title={i18n.modules.resource.backList}
          onClick={displayList}
          className={lightIconButtonStyle}
        />
      )}

      {title}

      {helpTip && <Tips iconClassName={cx(textSmall, lightText)}>{helpTip}</Tips>}

      {displayMode === 'LIST' && (
        <>
          <ResourceCreator collapsedClassName={lightIconButtonStyle} />
          {/* <TocDisplayToggler /> */}
          {/* Note : we can imagine that a read access level allows to see the ghost resources */}
          <HidenResourcesKeeper
            collapsedClassName={cx(
              css({
                padding: space_S,
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

  const { resourceOwnership, selectedResource, selectResource, lastCreatedId, setLastCreatedId } =
    React.useContext(ResourcesCtx);

  const { activeResources, status } = useAndLoadResources(resourceOwnership);

  // just to see if it changes
  const [currentContext, setCurrentContext] = React.useState<ResourceOwnership>(resourceOwnership);

  const displayMode: DisplayMode = React.useMemo(() => {
    if (selectedResource != null) {
      return 'ONE_RESOURCE';
    }

    return 'LIST';
  }, [selectedResource]);

  React.useEffect(() => {
    if (displayMode === 'LIST') {
      selectResource(null);
    }
  }, [displayMode, selectResource]);

  const showList = React.useCallback(() => {
    selectResource(null);
  }, [selectResource]);

  const showSelectedResource = React.useCallback(
    (resource: ResourceAndRef) => {
      selectResource(resource);
    },
    [selectResource],
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
          className={css({ padding: space_L })}
        >
          <h3>{i18n.modules.resource.noDocumentationYet}</h3>
          {!isReadOnly(accessLevel) && (
            <ResourceCreator
              collapsedClassName={lightIconButtonStyle}
              customButton={
                <Button icon={faPlus} clickable className={invertedButtonStyle}>
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
