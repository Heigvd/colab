/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useAndLoadNbDirectActiveResources } from '../../store/selectors/resourceSelector';
import SideCollapsibleMenu from '../common/layout/SideCollapsibleMenu';
import { ResourceOwnership } from '../resources/resourcesCommonType';

interface CardEditorSideMenuProps {
  card: Card;
  cardContent: CardContent;
  // readOnly?: boolean;
}

export default function CardEditorSideMenu({
  card,
  cardContent,
}: // readOnly,
CardEditorSideMenuProps): JSX.Element {
  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && cardContent != null;

  // const contents = useVariantsOrLoad(card);

  // const variantPager = computeNav(contents, cardContent.id);

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: cardContent.id,
    hasSeveralVariants: hasVariants,
  };

  const { nb: nbDirectResources } = useAndLoadNbDirectActiveResources(resourceOwnership);

  return (
    <SideCollapsibleMenu
      defaultOpenKey={(nbDirectResources || 0) > 0 ? 'resources' : undefined}
      className={css({
        borderLeft: '1px solid var(--divider-main)',
      })}
    />
  );
}
