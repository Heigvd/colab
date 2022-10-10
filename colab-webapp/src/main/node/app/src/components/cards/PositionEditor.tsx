/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, GridPosition } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Form from '../common/element/Form';

// TODO : do something against not number input

interface PositionEditorProps {
  card: Card;
}

export default function PositionEditor({ card }: PositionEditorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  return (
    <Form<GridPosition>
      fields={[
        { key: 'x', label: 'x', placeholder: '1', type: 'text', isMandatory: true },
        { key: 'y', label: 'y', placeholder: '1', type: 'text', isMandatory: true },
        {
          key: 'width',
          label: i18n.modules.card.positioning.width,
          placeholder: '1',
          type: 'text',
          isMandatory: true,
        },
        {
          key: 'height',
          label: i18n.modules.card.positioning.height,
          placeholder: '1',
          type: 'text',
          isMandatory: true,
        },
      ]}
      value={{
        x: card.x ?? 1,
        y: card.y ?? 1,
        width: card.width ?? 1,
        height: card.height ?? 1,
      }}
      onSubmit={fields => {
        if (card && card.id) {
          dispatch(API.changeCardPosition({ cardId: card.id, newPosition: { ...fields } }));
          navigate('../');
        }
      }}
      submitLabel={i18n.common.save}
    />
  );
}
