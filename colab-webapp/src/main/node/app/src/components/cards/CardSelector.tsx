/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import Select from 'react-select';
import * as API from '../../API/api';
import { useAllProjectCards } from '../../selectors/cardSelector';
import { useProjectBeingEdited } from '../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import InlineLoading from '../common/InlineLoading';

interface Props {
  // cardId or card or none
  value: number | Card | undefined;
  onSelect: (card: Card | undefined) => void;
}

export default function CardSelector({ value, onSelect }: Props): JSX.Element {
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
      label: `card ${card.id}`,
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