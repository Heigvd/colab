/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import { useAndLoadCopyParam, useProject } from '../../../store/selectors/projectSelector';
import { space_lg, space_xl } from '../../../styling/style';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import Checkbox from '../../common/element/Checkbox';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import ProjectModelSharing from '../models/ProjectModelSharing';

export interface ProjectSettingsModelSharingProps {
  projectId: number;
}

export default function ProjectSettingsModelSharing({
  projectId,
}: ProjectSettingsModelSharingProps): JSX.Element {
  const i18n = useTranslations();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <Flex direction="column" className={css({ alignSelf: 'stretch' })}>
      <Flex className={css({ alignSelf: 'stretch' })}>
        <Flex
          direction="column"
          align="stretch"
          className={css({ width: '45%', minWidth: '45%', marginRight: space_xl })}
        >
          <div>
            <OpenCloseModal
              title={i18n.modules.project.labels.shareTheProject}
              collapsedChildren={<Button>+ {i18n.modules.project.labels.shareTheProject}</Button>}
              modalBodyClassName={css({ padding: space_lg })}
              showCloseButton
            >
              {close => (
                <>{project.id && <ProjectModelSharing projectId={project.id} onClose={close} />}</>
              )}
            </OpenCloseModal>
          </div>
        </Flex>
        <Flex
          direction="column"
          align="stretch"
          justify="flex-end"
          className={css({ width: '55%' })}
        >
          <SharingParams projectId={projectId} />
        </Flex>
      </Flex>
    </Flex>
  );
}

interface SharingParamsProps {
  projectId: number;
}

function SharingParams({ projectId }: SharingParamsProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { copyParam, status } = useAndLoadCopyParam(projectId);

  if (status !== 'READY' || copyParam == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <h2>{i18n.modules.project.labels.sharingParams}</h2>
      <Flex direction="column">
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
