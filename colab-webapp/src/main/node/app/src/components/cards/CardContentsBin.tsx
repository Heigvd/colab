/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, CardContent, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useCard, useDeletedCardContentsToDisplaySorted } from '../../store/selectors/cardSelector';
import {
  deleteForeverDefaultIcon,
  dropDownMenuDefaultIcon,
  restoreFromBinDefaultIcon,
  viewDetailDefaultIcon,
} from '../../styling/IconDefault';
import {
  binDateColumnStyle,
  binDropDownMenuButtonStyle,
  binDropDownMenuStyle,
  binNameColumnStyle,
  binTBodyStyle,
  binTableStyle,
  space_xl,
} from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import CardEditor from './CardEditor';
import { CardTitle } from './CardTitle';

// Note : CardsBin has the same structure

export default function CardContentsBin(): JSX.Element {
  const i18n = useTranslations();

  const cardContents = useDeletedCardContentsToDisplaySorted();

  return (
    <Flex direction="column" className={css({ padding: space_xl })}>
      {/* align="stretch" */}
      <table className={binTableStyle}>
        <thead>
          <tr>
            <th className={binNameColumnStyle}>{i18n.common.bin.names.card}</th>
            <th className={binNameColumnStyle}>{i18n.common.bin.names.cardContent}</th>
            <th className={binDateColumnStyle}>{i18n.common.bin.dateBinned}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={binTBodyStyle}>
          {cardContents.map(cardContent => (
            <CardContentBinRow key={cardContent.id} cardContent={cardContent} />
          ))}
        </tbody>
      </table>
    </Flex>
  );
}

function CardContentBinRow({ cardContent }: { cardContent: CardContent }): React.ReactElement {
  const i18n = useTranslations();

  const card = useCard(cardContent.cardId);

  return (
    <tr>
      <td>{entityIs(card, 'Card') && <CardTitle card={card} />}</td>
      <td>{cardContent.title}</td>
      <td>
        {cardContent.trackingData?.erasureTime != null
          ? i18n.common.dateFn(cardContent.trackingData.erasureTime)
          : ''}
      </td>
      <td>
        <Flex justify="flex-end">
          <BinDropDownMenu card={card} cardContent={cardContent} />
        </Flex>
      </td>
    </tr>
  );
}

function BinDropDownMenu({
  card,
  cardContent,
}: {
  card: Card | 'LOADING' | undefined;
  cardContent: CardContent;
}): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [showModal, setShowModal] = React.useState<'' | 'deletedCardContent'>('');

  const closeModal = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showDeletedCardModal = React.useCallback(() => {
    setShowModal('deletedCardContent');
  }, [setShowModal]);

  return (
    <>
      {showModal === 'deletedCardContent' && entityIs(card, 'Card') && (
        <Modal
          title={i18n.common.bin.deleted.card}
          showCloseButton
          onClose={closeModal}
          size="full"
        >
          {_collapse => (
            <CardEditor card={card} cardContent={cardContent} preventVariantSelection />
          )}
        </Modal>
      )}
      <DropDownMenu
        icon={dropDownMenuDefaultIcon}
        className={binDropDownMenuStyle}
        buttonClassName={binDropDownMenuButtonStyle}
        entries={[
          {
            value: 'view',
            label: (
              <>
                <Icon icon={viewDetailDefaultIcon} /> {i18n.common.bin.action.view}
              </>
            ),
            action: () => {
              showDeletedCardModal();
            },
          },
          {
            value: 'restore',
            label: (
              <>
                <Icon icon={restoreFromBinDefaultIcon} /> {i18n.common.bin.action.restore}
              </>
            ),
            action: () => {
              dispatch(API.restoreCardContentFromBin(cardContent));
            },
          },
          {
            value: 'deleteForever',
            label: (
              <>
                <Icon icon={deleteForeverDefaultIcon} /> {i18n.common.bin.action.deleteForever}
              </>
            ),
            action: () => {
              dispatch(API.deleteCardContentForever(cardContent));
            },
          },
        ]}
      />
    </>
  );
}
