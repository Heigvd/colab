/*
 * The coLAB project
 * Copyright (C) 2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadCopyParam } from '../../selectors/projectSelector';
import { dispatch } from '../../store/store';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Checkbox from '../common/element/Checkbox';
import Flex from '../common/layout/Flex';
import { paddedContainerStyle } from '../styling/style';

interface ProjectModelSharingParamProps {
  projectId: number;
}

export default function ProjectModelSharingParam({
  projectId,
}: ProjectModelSharingParamProps): JSX.Element {
  const i18n = useTranslations();

  const { copyParam, status } = useAndLoadCopyParam(projectId);

  if (status !== 'READY' || copyParam == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <h2>{i18n.modules.project.labels.sharingParams}</h2>
      <Flex direction="column" className={cx(paddedContainerStyle)}>
        <h3>{i18n.modules.project.labels.include}</h3>
        <Checkbox
          value={copyParam.withRoles || undefined}
          label={i18n.modules.project.labels.roles}
          onChange={(newValue: boolean) => {
            dispatch(API.updateCopyParam({ ...copyParam, withRoles: newValue }));
          }}
        />
        <Checkbox
          value={copyParam.withDeliverables || undefined}
          label={i18n.modules.project.labels.cardContents}
          onChange={(newValue: boolean) => {
            dispatch(API.updateCopyParam({ ...copyParam, withDeliverables: newValue }));
          }}
        />
        <Checkbox
          value={copyParam.withResources || undefined}
          label={i18n.modules.project.labels.documentation}
          onChange={(newValue: boolean) => {
            dispatch(API.updateCopyParam({ ...copyParam, withResources: newValue }));
          }}
        />
      </Flex>
    </>
  );
}
