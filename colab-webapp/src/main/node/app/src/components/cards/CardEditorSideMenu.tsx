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
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useAndLoadNbDirectActiveResources } from '../../store/selectors/resourceSelector';
import { putInTrashDefaultIcon } from '../../styling/IconDefault';
import { currentProjectLinkTarget, PutInTrashShowOnClickModal } from '../common/PutInTrashModal';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
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
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const variants = useVariantsOrLoad(card) || [];
  const hasVariants = variants.length > 1 && cardContent != null;

  // const contents = useVariantsOrLoad(card);

  // const variantPager = computeNav(contents, cardContent.id);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: cardContent.id,
    hasSeveralVariants: hasVariants,
  };

  const { nb: nbDirectResources } = useAndLoadNbDirectActiveResources(resourceOwnership);

  return (
    <>
      <Flex
        direction="column"
        justify="space-between"
        className={css({
          borderLeft: '1px solid var(--divider-main)',
        })}
      >
        <SideCollapsibleMenu
          defaultOpenKey={(nbDirectResources || 0) > 0 ? 'resources' : undefined}
        />

        <PutInTrashShowOnClickModal
          title={i18n.common.trash.info.deletionCompleted.card}
          message={i18n.common.trash.info.canBeFoundInTrash.feminine}
          trashPath={currentProjectLinkTarget}
          onCloseModal={() => {
            // if (hasVariants) {
            //     navigate(`../card/${card.id}/v/${variantPager?.next.id}`);
            // } else {
            navigate('../');
            // }
          }}
          collapsedChildren={
            <IconButton
              icon={putInTrashDefaultIcon}
              title={i18n.modules.card.deleteCard}
              isLoading={isLoading}
              onClick={() => {
                startLoading();
                // if (hasVariants) {
                //   dispatch(API.deleteCardContent(cardContent)).then(() => {
                //     stopLoading();
                //   });
                // } else {
                if (card.id != null) {
                  dispatch(API.putCardInTrash(card.id)).then(() => {
                    stopLoading();
                  });
                }
                // }
              }}
            />
          }
        />
      </Flex>
    </>
  );
}
