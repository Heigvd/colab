/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAndLoadResourceCategories } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import SelectInput from '../common/element/SelectInput';
import { ResourceAndRef } from './resourcesCommonType';

interface ResourceCategorySelectorProps {
  resource: ResourceAndRef;
}

export default function ResourceCategorySelector({
  resource,
}: ResourceCategorySelectorProps): JSX.Element {
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
            value={updatableResource.category || undefined}
            isClearable={true}
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
