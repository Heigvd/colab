/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/element/Button';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_M } from '../styling/style';

export interface ProjectModelSharingLinkProps {
  projectId: number;
}

export function ProjectModelSharingLink({ projectId }: ProjectModelSharingLinkProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [link, setLink] = React.useState<string>();

  React.useEffect(() => {
    dispatch(API.createSharingLink({ projectId })).then(action => {
      if (action.meta.requestStatus === 'fulfilled' && entityIs(action.payload, 'JsonableString')) {
        setLink(action.payload.string || '');
      } else {
        setLink('');
      }
    });
  }, [dispatch, projectId]);

  return <Flex>{link}</Flex>;
}

export interface ProjectModelSharingLinkModalProps {
  projectId: number;
}

export default function ProjectModelSharingLinkModal({
  projectId,
}: ProjectModelSharingLinkModalProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <div>
      <OpenCloseModal
        title={i18n.modules.project.labels.shareTheProject}
        collapsedChildren={<Button clickable>{i18n.modules.project.labels.withALink}</Button>}
        modalBodyClassName={css({ padding: space_M })}
        widthMax
        showCloseButton
      >
        {() => <ProjectModelSharingLink projectId={projectId} />}
      </OpenCloseModal>
    </div>
  );
}
