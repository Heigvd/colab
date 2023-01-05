/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadCopyParam, useProject } from '../../../selectors/projectSelector';
import { dispatch } from '../../../store/store';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import Checkbox from '../../common/element/Checkbox';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { paddedContainerStyle, space_L, space_M } from '../../styling/style';
import ProjectModelSharing from '../ProjectModelSharing';

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
          className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
        >
          <div>
            <OpenCloseModal
              title={i18n.modules.project.labels.shareTheProject}
              collapsedChildren={
                <Button clickable>+ {i18n.modules.project.labels.shareTheProject}</Button>
              }
              modalBodyClassName={css({ padding: space_M })}
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

      {/* <Flex direction="column" className={cx(disabledStyle, paddedContainerStyle)}>
        <h3>{i18n.modules.project.labels.connect}</h3>
        <Checkbox
          value={false} //{data.withResources}
          label={i18n.modules.project.labels.keepConnectionBetweenModelAndProject}
          readOnly
          onChange={(_newValue: boolean) => {
            //setData({ ...data, keepConnection: newValue });
          }}
        />
      </Flex> */}
    </>
  );
}
