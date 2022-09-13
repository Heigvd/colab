/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Toggler from '../common/element/Toggler';
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

  return (
    <>
      {entityIs(updatableResource, 'Resource') && (
        <Toggler
          label={i18n.common.published}
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
              ? i18n.modules.resource.unpublishMakePrivate
              : i18n.modules.resource.publishMakeAvailableSubs
          }
          footer={
            updatableResource.published
              ? i18n.modules.resource.publishedInfo
              : i18n.modules.resource.unpublishedInfo
          }
        />
      )}
    </>
  );
}
