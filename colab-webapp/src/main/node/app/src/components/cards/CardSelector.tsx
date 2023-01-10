/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAllProjectCards } from '../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/element/InlineLoading';

interface CardSelectorProps {
  // cardId or card or none
  value: number | Card | undefined;
  onSelect: (card: Card | undefined) => void;
}

export default function CardSelector({ value, onSelect }: CardSelectorProps): JSX.Element {
  const i18n = useTranslations();
  const { project } = useProjectBeingEdited();
  const dispatch = useAppDispatch();
  const cards = useAllProjectCards();
  const cardStatus = useAppSelector(state => state.cards.status);

  const projectId = project != null ? project.id : undefined;

  React.useEffect(() => {
    if (cardStatus == 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getAllProjectCards(projectId));
    }
  }, [cardStatus, dispatch, projectId]);

  const onSelectCb = React.useCallback(
    (option: { value: Card } | null) => {
      if (option != null) {
        onSelect(option.value);
      } else {
        onSelect(undefined);
      }
    },
    [onSelect],
  );

  if (cardStatus !== 'READY') {
    return <InlineLoading />;
  } else {
    const options = cards.map(card => ({
      label: `${i18n.modules.card.card} ${card.id}`,
      value: card,
    }));
    const cardId = entityIs(value, 'Card') ? value.id : value;
    const currentOption = options.find(o => o.value.id === cardId);
    return (
      <Select
        className={css({ minWidth: '240px' })}
        options={options}
        value={currentOption}
        onChange={onSelectCb}
      />
    );
  }
}
