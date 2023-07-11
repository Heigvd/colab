/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import { useVariantsOrLoad } from '../../store/selectors/cardSelector';
import { useAndLoadNbActiveResources } from '../../store/selectors/resourceSelector';
import IconButton from '../common/element/IconButton';
import ConfirmDeleteOpenCloseModal from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import SideCollapsibleMenu from '../common/layout/SideCollapsibleMenu';
import { ResourceOwnership } from '../resources/resourcesCommonType';
import { computeNav } from './VariantSelector';

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

  const contents = useVariantsOrLoad(card);

  const variantPager = computeNav(contents, cardContent.id);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardOrCardContent',
    cardId: card.id || undefined,
    cardContentId: cardContent.id,
    hasSeveralVariants: hasVariants,
  };

  const { nb } = useAndLoadNbActiveResources(resourceOwnership);

  return (
    <>
      <Flex
        direction="column"
        justify="space-between"
        className={css({
          borderLeft: '1px solid var(--divider-main)',
        })}
      >
        <SideCollapsibleMenu defaultOpenKey={(nb || 0) > 0 ? 'resources' : undefined} />

        <ConfirmDeleteOpenCloseModal
          buttonLabel={
            <IconButton
              icon={'delete'}
              title={i18n.modules.card.deleteCardVariant()}
              onClick={() => {}}
              className={cx(css({ color: 'var(--error-main)' }))}
            />
          }
          confirmButtonLabel={i18n.modules.card.deleteCardVariant(hasVariants)}
          message={<p>{i18n.modules.card.confirmDeleteCardVariant(hasVariants)}</p>}
          onConfirm={() => {
            startLoading();
            if (hasVariants) {
              dispatch(API.deleteCardContent(cardContent)).then(() => {
                navigate(`../card/${card.id}/v/${variantPager?.next.id}`);
                stopLoading();
              });
            } else {
              dispatch(API.deleteCard(card)).then(() => {
                navigate('../');
                stopLoading();
              });
            }
          }}
          title={i18n.modules.card.deleteCardVariant(hasVariants)}
          isConfirmButtonLoading={isLoading}
        />
      </Flex>
    </>
  );
}
