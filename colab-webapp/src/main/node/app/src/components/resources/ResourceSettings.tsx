/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Toggler from '../common/Form/Toggler';
import { getTheDirectResource, ResourceAndRef } from './resourcesCommonType';

interface ResourceSettingsProps {
  resource: ResourceAndRef;
}

export default function ResourceSettings({ resource }: ResourceSettingsProps): JSX.Element {
  const dispatch = useAppDispatch();

  const updatableResource = getTheDirectResource(resource);

  return (
    <>
      {entityIs(updatableResource, 'Resource') && (
        <Toggler
          label="Published"
          value={updatableResource.published}
          onChange={() => {
            if (updatableResource.id) {
              updatableResource.published
                ? dispatch(API.unpublishResource(updatableResource.id))
                : dispatch(API.publishResource(updatableResource.id));
            }
          }}
          tip="chat"
          fieldFooter={updatableResource.published ? '' : ''}
        />
      )}
    </>
  );
}
