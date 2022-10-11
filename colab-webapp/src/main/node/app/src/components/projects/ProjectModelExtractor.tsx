/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProject } from '../../selectors/projectSelector';
import Form, { Field } from '../common/element/Form';
import InlineLoading from '../common/element/InlineLoading';
import Tips, { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';

interface ProjectModelExtractorProps {
  projectId: number | null | undefined;
}

interface FormData {
  justConvert: boolean;
  withRoles: boolean;
  withDeliverables: boolean;
  withDocuments: boolean;
}

const defaultValue: FormData = {
  justConvert: true,
  withRoles: true,
  withDeliverables: true,
  withDocuments: true,
};

export function ProjectModelExtractor({ projectId }: ProjectModelExtractorProps): JSX.Element {
  const i18n = useTranslations();
  const project = useAndLoadProject(projectId || undefined);

  const formFields: Field<FormData>[] = [
    {
      key: 'justConvert',
      label: i18n.modules.project.labels.extractNewFromProject,
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
    },
    {
      key: 'withRoles',
      label: i18n.modules.project.labels.extractRoles,
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
    },
    {
      key: 'withDeliverables',
      label: i18n.modules.project.labels.extractDeliverables,
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
    },
    {
      key: 'withDocuments',
      label: i18n.modules.project.labels.extractDocuments,
      type: 'boolean',
      showAs: 'checkbox',
      isMandatory: true,
    },
  ];

  return project == null ? (
    <InlineLoading />
  ) : (
    <>
      <WIPContainer>
        <Tips tipsType="TODO">voir où mettre le nom du projet initial</Tips>
        <Flex direction="column">
          <Form
            fields={formFields}
            value={defaultValue}
            onSubmit={() => undefined}
            submitLabel={i18n.modules.project.actions.createModel}
          />
        </Flex>
      </WIPContainer>
    </>
  );
}
