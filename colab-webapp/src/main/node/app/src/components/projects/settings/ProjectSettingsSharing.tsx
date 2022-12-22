/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useProject } from '../../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import Checkbox from '../../common/element/Checkbox';
import Flex from '../../common/layout/Flex';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import {
  disabledStyle,
  lightItalicText,
  paddedContainerStyle,
  space_L,
  space_M,
} from '../../styling/style';
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
          <SharingParams />
        </Flex>
      </Flex>
    </Flex>
  );
}

// interface SharingParamsProps {
//   projectId: number;
// }
// projectId={projectId}/>
/*{projectId}:SharingParamsProps*/
function SharingParams(): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      <h2>{i18n.modules.project.labels.sharingParams}</h2>
      <Flex className={lightItalicText}>For now, the parameters cannot be changed</Flex>
      <Flex direction="column" className={cx(disabledStyle, paddedContainerStyle)}>
        <h3>{i18n.modules.project.labels.include}</h3>
        <Checkbox
          value={true} //{data.withRoles}
          label={i18n.modules.project.labels.roles}
          readOnly
          onChange={(_newValue: boolean) => {
            //setData({ ...data, withRoles: newValue });
          }}
        />
        <Checkbox
          value={true} //{data.withDeliverables}
          label={i18n.modules.project.labels.cardContents}
          readOnly
          onChange={(_newValue: boolean) => {
            // setData({ ...data, withDeliverables: newValue });
          }}
        />
        <Checkbox
          value={true} //{data.withResources}
          label={i18n.modules.project.labels.documentation}
          readOnly
          onChange={(_newValue: boolean) => {
            //setData({ ...data, withResources: newValue });
          }}
        />
      </Flex>
      <Flex direction="column" className={cx(disabledStyle, paddedContainerStyle)}>
        <h3>{i18n.modules.project.labels.connect}</h3>
        <Checkbox
          value={false} //{data.withResources}
          label={i18n.modules.project.labels.keepConnectionBetweenModelAndProject}
          readOnly
          onChange={(_newValue: boolean) => {
            //setData({ ...data, withResources: newValue });
          }}
        />
      </Flex>
    </>
  );
}
