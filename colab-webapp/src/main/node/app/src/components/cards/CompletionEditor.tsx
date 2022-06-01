/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Input from '../common/Form/Input';

interface CompletionEditorProps {
  variant: CardContent;
}

export default function CompletionEditor({ variant }: CompletionEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <Input
      label="Completion level"
      value={String(variant.completionLevel) == '0' ? undefined : String(variant.completionLevel)}
      placeholder="0"
      onChange={newValue =>
        dispatch(
          API.updateCardContent({
            ...variant,
            completionLevel: +newValue,
          }),
        )
      }
      autofocus={true}
    />
  );
}
