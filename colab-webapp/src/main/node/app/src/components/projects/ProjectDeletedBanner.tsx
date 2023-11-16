/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { isProjectAlive } from '../../store/selectors/projectSelector';
import { deleteForeverDefaultIcon, restoreFromBinDefaultIcon } from '../../styling/IconDefault';
import {
  deletedBannerActionStyle,
  deletedBannerButtonStyle,
  deletedBannerInfoStyle,
  deletedBannerStyle,
} from '../../styling/style';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import { useCanProjectDeletionStatusBeChanged } from './projectRightsHooks';

////////////////////////////////////////////////////////////////////////////////////////////////////
// props

interface ProjectDeletedBannerProps {
  project: Project;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
// component

export function ProjectDeletedBanner({ project }: ProjectDeletedBannerProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const canChangeDeletionStatus = useCanProjectDeletionStatusBeChanged();

  if (!isProjectAlive(project)) {
    return (
      <Flex justify="space-between" align="center" className={deletedBannerStyle}>
        <Flex className={deletedBannerInfoStyle}>{i18n.common.bin.info.isInBin.project}</Flex>
        {canChangeDeletionStatus && (
          <Flex className={deletedBannerActionStyle}>
            <Button
              icon={restoreFromBinDefaultIcon}
              kind="outline"
              theme="error"
              className={deletedBannerButtonStyle}
              onClick={() => {
                dispatch(API.restoreProjectFromBin(project));
              }}
            >
              {i18n.common.bin.action.restore}
            </Button>
            <Button
              icon={deleteForeverDefaultIcon}
              kind="outline"
              theme="error"
              className={deletedBannerButtonStyle}
              onClick={() => {
                dispatch(API.deleteProjectForever(project));
              }}
            >
              {i18n.common.bin.action.deleteForever}
            </Button>
          </Flex>
        )}
      </Flex>
    );
  }

  return <></>;
}
