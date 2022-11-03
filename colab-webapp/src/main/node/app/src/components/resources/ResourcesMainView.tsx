/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResources } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import { SideCollapsibleCTX } from '../cards/SideCollapsiblePanel';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import { WIPContainer } from '../common/element/Tips';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import { invertedButtonStyle, lightIconButtonStyle, space_L } from '../styling/style';
//import HidenResourcesKeeper from './HidenResourcesKeeper';
import ResourceCreator from './ResourceCreator';
import { ResourceDisplay } from './ResourceDisplay';
import {
  AccessLevel,
  isReadOnly,
  ResourceAndRef,
  ResourceCallContext,
} from './resourcesCommonType';
import ResourcesList from './ResourcesList';

export type TocMode = 'CATEGORY' | 'SOURCE' | '3_STACKS';

export interface TocDisplayContext {
  mode: TocMode;
  setMode: (newMode: TocMode) => void;
}

export const TocDisplayCtx = React.createContext<TocDisplayContext>({
  mode: 'CATEGORY',
  setMode: () => {},
});

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
  showVoidIndicator?: boolean;
  publishNew?: boolean;
  showLevels?: boolean;
}

export default function ResourcesMainView({
  contextData,
  accessLevel,
  showVoidIndicator,
  publishNew,
  showLevels,
}: ResourcesMainViewProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { activeResources, status } = useAndLoadResources(contextData);

  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const { setInsideState, setExtraNavFunction } = React.useContext(SideCollapsibleCTX);

  const [lastCreated, setLastCreated] = React.useState<number | null>(null);

  // just to see if it changes
  const [currentContext, setCurrentContext] = React.useState<ResourceCallContext>(contextData);

  const showList = React.useCallback(() => selectResource(null), []);

  React.useEffect(() => {
    if (setExtraNavFunction) setExtraNavFunction(() => showList);
    if (selectedResource && setInsideState) {
      setInsideState(true);
    } else if (setInsideState) {
      setInsideState(false);
    }
  }, [selectedResource, setExtraNavFunction, setInsideState, showList]);

  React.useEffect(() => {
    // show the list if the context changed
    if (contextData.kind !== currentContext.kind) {
      showList();
    } else if (
      contextData.kind === 'CardOrCardContent' &&
      currentContext.kind === 'CardOrCardContent' &&
      (contextData.cardId !== currentContext.cardId ||
        contextData.cardContentId !== currentContext.cardContentId)
    ) {
      showList();
    } else if (
      contextData.kind === 'CardType' &&
      currentContext.kind === 'CardType' &&
      contextData.cardTypeId !== currentContext.cardTypeId
    ) {
      showList();
    }

    setCurrentContext(contextData);
  }, [contextData, currentContext, setCurrentContext, showList]);

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
        selectResource(found);
      }
    }
  }, [activeResources, selectedResource, selectResource]);

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
              contextInfo={contextData}
              onCreated={newId => {
                setLastCreated(newId);
                if (publishNew) {
                  dispatch(API.publishResource(newId));
                }
              }}
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
        selectResource={selectResource}
        contextData={contextData}
        readOnly={isReadOnly(accessLevel)}
        showLevels={showLevels}
      />

      {!isReadOnly(accessLevel) && (
        <Flex>
          {/* <ResourceCreator
            contextInfo={contextData}
            onCreated={setLastCreated}
            collapsedClassName={lightIconButtonStyle}
          /> */}
        </Flex>
      )}
    </Flex>
  );
}
