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
import { ResourceAndRef } from './resourcesCommonType';

interface ResourceSettingsProps {
  resource: ResourceAndRef;
}

export default function ResourceSettings({ resource }: ResourceSettingsProps): JSX.Element {
  const dispatch = useAppDispatch();

  const updatableResource = React.useMemo(() => {
    return API.getResourceToEdit(resource);
  }, [resource]);

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
          tip={
            updatableResource.published
              ? 'Unpublish the resource to make it private for this card'
              : 'Publish the resource to make it available for subcards'
          }
          fieldFooter={
            updatableResource.published
              ? 'A published resource is available for subcards'
              : 'An unpublished resource is private for this card'
          }
        />
      )}
    </>
  );
}
