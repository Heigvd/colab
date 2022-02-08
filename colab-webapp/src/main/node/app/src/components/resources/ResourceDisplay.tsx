/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css, cx } from '@emotion/css';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import Flex from '../common/Flex';
import IconButton from '../common/IconButton';
import { DocumentEditorWrapper } from '../documents/DocumentEditorWrapper';
import { lightIconButtonStyle, paddingAroundStyle, space_M, space_S } from '../styling/style';
import { ResourceAndRef } from './ResourceCommonType';

export interface ResourceDisplayProps {
  resourceAndRef: ResourceAndRef;
  onClose: () => void;
}

export function ResourceDisplay({ resourceAndRef, onClose }: ResourceDisplayProps): JSX.Element {
  const i18n = useTranslations();

  const targetResourceId = resourceAndRef.targetResource.id;

  const allowEdition = resourceAndRef.isDirectResource;

  return (
    <Flex
      align="stretch"
      direction="column"
      grow={1}
      className={paddingAroundStyle([2, 3, 4], space_M)}
    >
      <Flex direction="column">
        <IconButton
          icon={faArrowLeft}
          title="Back"
          onClick={onClose}
          className={cx(lightIconButtonStyle, css({ paddingBottom: space_S }))}
        />
        <div>
          <h2>{resourceAndRef.targetResource.title || i18n.resource.untitled}</h2>
        </div>
      </Flex>
      {targetResourceId && (
        <DocumentEditorWrapper
          context={{ kind: 'PartOfResource', resourceId: targetResourceId }}
          allowEdition={allowEdition}
        />
      )}
    </Flex>
  );
}
