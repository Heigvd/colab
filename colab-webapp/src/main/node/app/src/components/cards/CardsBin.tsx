/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useAllDeletedProjectCardsSorted,
  useParentCardButNotRoot,
} from '../../store/selectors/cardSelector';
import { deleteForeverDefaultIcon, restoreFromBinDefaultIcon } from '../../styling/IconDefault';
import { lightIconButtonStyle, space_sm, space_xl, text_xs } from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { CardTitle } from './CardTitle';

// TODO : see if scroll can be only on tbody
// TODO : see which width must take the table

// TODO : on double click : show card

// TODO : see what to do with variants

// TODO : "Empty bin" action

export function CardsBin(): JSX.Element {
  const i18n = useTranslations();

  const cards = useAllDeletedProjectCardsSorted().map(cad => cad.card);

  return (
    <Flex direction="column" className={css({ padding: space_xl })}>
      {/* align="stretch" */}
      <table
        className={cx(
          text_xs,
          css({
            textAlign: 'left',
            borderCollapse: 'collapse',
            'tbody tr:hover': {
              backgroundColor: 'var(--gray-100)',
            },
            'tr:hover .hoverButton': {
              pointerEvents: 'auto',
              visibility: 'visible',
            },
            thead: {
              position: 'sticky',
              top: 0,
              boxShadow: '0px 1px var(--divider-main)',
              background: 'var(--bg-primary)',
            },
            th: {
              padding: space_sm,
            },
            td: {
              padding: space_sm,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            },
          }),
        )}
      >
        <thead>
          <tr>
            <th className={css({ minWidth: '12em' })}>{i18n.common.bin.name}</th>
            <th className={css({ minWidth: '10em' })}>{i18n.common.bin.dateBinned}</th>
            <th className={css({ minWidth: '12em' })}>{i18n.common.bin.originalParent}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={css({ overflow: 'scroll' })}>
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

  return (
    <DropDownMenu
      icon={'more_vert'}
      valueComp={{ value: '', label: '' }}
      className={css({ justifyContent: 'flex-end', alignSelf: 'flex-end' })}
      buttonClassName={cx(lightIconButtonStyle)}
      entries={[
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
  );
}
