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
import { BlockInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';

// TODO : make it become a form

interface CompletionEditorProps {
  variant: CardContent;
}

export default function CompletionEditor({ variant }: CompletionEditorProps): JSX.Element {
  const dispatch = useAppDispatch();

  return (
    <>
      <BlockInput
        type="range"
        label="Completion level"
        value={String(variant.completionLevel) == '0' ? '0' : String(variant.completionLevel)}
        placeholder="0"
        saveMode="ON_BLUR"
        onChange={newValue =>
          dispatch(
            API.updateCardContent({
              ...variant,
              completionLevel: +newValue,
            }),
          )
        }
        autoFocus={true}
      />
      <Flex align="center">
        <BlockInput
          type="number"
          value={variant.completionLevel == 0 ? undefined : variant.completionLevel}
          saveMode="SIMPLE_FLOWING"
          onChange={newValue =>
            dispatch(
              API.updateCardContent({
                ...variant,
                completionLevel: +newValue,
              }),
            )
          }
          placeholder={'0'}
          autoFocus
          inputDisplayClassName={css({ width: '90px' })}
          min="0"
          max="100"
        />
        %
      </Flex>
    </>
  );
}
