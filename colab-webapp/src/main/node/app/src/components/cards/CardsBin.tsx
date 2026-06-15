/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useAllDeletedProjectCardsSorted,
  useDefaultVariant,
  useParentCardButNotRoot,
} from '../../store/selectors/cardSelector';
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
  binParentColumnStyle,
  binTBodyStyle,
  binTableStyle,
  space_md,
} from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import CardEditor from './CardEditor';
import { CardTitle } from './CardTitle';

// TODO : see if scroll can be only on tbody
// TODO : opaque color on header

// TODO : "Empty bin" action

// Note : CardContentsBin has the same structure

export default function CardsBin(): JSX.Element {
  const i18n = useTranslations();

  const cards = useAllDeletedProjectCardsSorted();

  return (
    <Flex direction="column" className={css({ padding: space_md })}>
      {/* align="stretch" */}
      <table className={binTableStyle}>
        <thead>
          <tr>
            <th className={binNameColumnStyle}>{i18n.common.bin.names.card}</th>
            <th className={binDateColumnStyle}>{i18n.common.bin.dateBinned}</th>
            <th className={binParentColumnStyle}>{i18n.common.bin.originalParent}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={binTBodyStyle}>
          {cards.map(card => (
            <CardBinRow key={card.id} card={card} />
          ))}
        </tbody>
      </table>
    </Flex>
  );
}

function CardBinRow({ card }: { card: Card }): JSX.Element {
  const i18n = useTranslations();

  const parentCard = useParentCardButNotRoot(card.id);

  return (
    <tr>
      <td>
        <CardTitle card={card} />
      </td>
      <td>
        {card.trackingData?.erasureTime != null
          ? i18n.common.dateFn(card.trackingData.erasureTime)
          : ''}
      </td>
      <td>{parentCard != null ? <CardTitle card={parentCard} /> : ''}</td>
      <td>
        <Flex justify="flex-end">
          <BinDropDownMenu card={card} />
        </Flex>
      </td>
    </tr>
  );
}

function BinDropDownMenu({ card }: { card: Card }): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const defaultCardContent = useDefaultVariant(card.id || 0);

  const [showModal, setShowModal] = React.useState<'' | 'deletedCard'>('');

  const closeModal = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showDeletedCardModal = React.useCallback(() => {
    setShowModal('deletedCard');
  }, [setShowModal]);

  return (
    <>
      {showModal === 'deletedCard' && entityIs(defaultCardContent, 'CardContent') && (
        <Modal
          title={i18n.common.bin.deleted.card}
          showCloseButton
          onClose={closeModal}
          size="full"
        >
          {_collapse => <CardEditor card={card} cardContent={defaultCardContent} />}
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
              dispatch(API.restoreCardFromBin(card));
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
              dispatch(API.deleteCardForever(card));
            },
          },
        ]}
      />
    </>
  );
}
