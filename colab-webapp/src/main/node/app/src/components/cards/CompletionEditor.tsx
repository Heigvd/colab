/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { CardContent } from 'colab-rest-client';
import { debounce } from 'lodash';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { BlockInput } from '../common/element/Input';
import Flex from '../common/layout/Flex';

// TODO : make it become a form

interface CompletionEditorProps {
  variant: CardContent;
}

export default function CompletionEditor({ variant }: CompletionEditorProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const [value, setValue] = React.useState(variant.completionLevel ?? 0);

  const debouncedOnChange = React.useMemo(() => {
    return debounce((value: number) => {
      dispatch(
        API.updateCardContent({
          ...variant,
          completionLevel: value,
        }),
      );
    }, 250);
  }, [dispatch, variant]);

  const onInternalChange = React.useCallback(
    (v: string) => {
      const nValue = +v;
      if (!Number.isNaN(nValue)) {
        setValue(nValue);
        debouncedOnChange(nValue);
      }
    },
    [debouncedOnChange],
  );

  return (
    <>
      <BlockInput
        type="range"
        label={i18n.modules.card.completion}
        value={value}
        placeholder="0"
        onChange={onInternalChange}
        autoFocus={true}
        saveMode="SILLY_FLOWING"
      />
      <Flex align="center">
        <BlockInput
          type="number"
          value={value}
          saveMode="SILLY_FLOWING"
          onChange={onInternalChange}
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
