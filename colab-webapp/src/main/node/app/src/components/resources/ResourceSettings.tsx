/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResourceCategories } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import SelectInput from '../common/element/SelectInput';
import { ResourceAndRef } from './resourcesCommonType';

interface ResourceSettingsProps {
  resource: ResourceAndRef;
}

export default function ResourceSettings({ resource }: ResourceSettingsProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const updatableResource = React.useMemo(() => {
    return API.getResourceToEdit(resource);
  }, [resource]);

  const { categories } = useAndLoadResourceCategories();

  const allCategories = React.useMemo(() => {
    return categories.map(cat => ({ label: cat, value: cat }));
  }, [categories]);

  const onChangeCategory = React.useCallback(
    (newValue: string | null | undefined) => {
      dispatch(
        API.changeResourceCategory({
          resourceOrRef: updatableResource,
          categoryName: newValue || '',
        }),
      );
    },
    [dispatch, updatableResource],
  );

  return (
    <>
      {entityIs(updatableResource, 'Resource') && (
        <>
          <SelectInput
            label={i18n.modules.resource.category}
            value={updatableResource.category || undefined}
            isMulti={false}
            canCreateOption={true}
            options={allCategories}
            onChange={onChangeCategory}
            className={css({ minWidht: '60%', width: '100%' })}
          />
        </>
      )}
    </>
  );
}
