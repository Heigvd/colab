/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Input from '../common/Form/Input';
import InlineInputNew from '../common/InlineInputNew';

interface CompletionEditorProps {
  variant: CardContent;
}

export default function CompletionEditor({ variant }: CompletionEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <>
      <Input
        type="range"
        label="Completion level"
        value={String(variant.completionLevel) == '0' ? '0' : String(variant.completionLevel)}
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
      <Flex align='center'>
      <InlineInputNew
        value={String(variant.completionLevel) == '0' ? '0' : String(variant.completionLevel)}
        placeholder="0"
        onChange={newValue =>
          dispatch(
            API.updateCardContent({
              ...variant,
              completionLevel: +newValue,
            }),
          )
        }
        className={css({border: '1px solid var(--lightGray)'})}
      /> %</Flex>
    </>
  );
}
