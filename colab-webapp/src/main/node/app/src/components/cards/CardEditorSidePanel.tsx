/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import SideCollapsiblePanel from '../common/layout/SideCollapsiblePanel';
import { DisplayMode, ResourcesCtx } from '../resources/ResourcesMainView';
import { ResourceAndRef, ResourceOwnership } from '../resources/resourcesCommonType';

interface CardEditorSidePanelProps {
  card: Card;
  cardContent: CardContent;
  // readOnly?: boolean;
}

export default function CardEditorSidePanel({
  card,
  cardContent,
}: //readOnly,
CardEditorSidePanelProps): JSX.Element {
  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && cardContent != null;

  const [resourcesDisplayMode, setResourcesDisplayMode] = React.useState<DisplayMode>('LIST');
  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const [lastCreatedResourceId, setLastCreatedResourceId] = React.useState<number | null>(null);

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: cardContent.id,
    hasSeveralVariants: hasVariants,
  };

  return (
    <>
      <ResourcesCtx.Provider
        value={{
          resourceOwnership,
          displayMode: resourcesDisplayMode,
          setDisplayMode: setResourcesDisplayMode,
          selectedResource,
          selectResource,
          lastCreatedId: lastCreatedResourceId,
          setLastCreatedId: setLastCreatedResourceId,
        }}
      >
        <SideCollapsiblePanel className={css({ overflow: 'hidden' })} />
      </ResourcesCtx.Provider>
    </>
  );
}
