/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Illustration, Project } from 'colab-rest-client';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProject } from '../../selectors/projectSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import ButtonWithLoader from '../common/element/ButtonWithLoader';
import { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import { space_M, space_S } from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';

interface ProjectModelExtractorProps {
  projectId: number | null | undefined;
}

export interface ModelCreationData {
  justConvert: boolean;
  withRoles: boolean;
  withDeliverables: boolean;
  withDocuments: boolean;
  name: string;
  description: string;
  illustration: Illustration;
  guests: string[];
  simpleProject: Project | null;
}

const defaultData: ModelCreationData = {
  justConvert: true,
  withRoles: true,
  withDeliverables: true,
  withDocuments: true,
  name: '',
  description: '',
  illustration: { ...defaultProjectIllustration },
  guests: [],
  simpleProject: null,
};

type ProgressionStatus = 'parameters' | 'fillBasisData';

export function ProjectModelExtractor({ projectId }: ProjectModelExtractorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const [status, setStatus] = React.useState<ProgressionStatus>('parameters');

  const [data, setData] = React.useState<ModelCreationData>({ ...defaultData });

  const [showBackButton, setShowBackButton] = React.useState<boolean>(false);
  const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
  const [showCreateButton, setShowCreateButton] = React.useState<boolean>(false);

  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  React.useEffect(() => {
    if (status === 'parameters') {
      setShowBackButton(false);
      setShowNextButton(true);
      setShowCreateButton(false);
    } else if (status === 'fillBasisData') {
      setShowBackButton(true);
      setShowNextButton(false);
      setShowCreateButton(true);
    } else {
      setShowBackButton(false);
      setShowNextButton(false);
      setShowCreateButton(false);
    }
  }, [status]);

  const resetCb = React.useCallback(() => {
    setStatus('parameters');

    setReadOnly(false);

    data.guests.splice(0, data.guests.length);
    setData({ ...defaultData });
  }, [data.guests]);

  const oneStepBackCb = React.useCallback(() => {
    if (!readOnly && status === 'fillBasisData') {
      setStatus('parameters');
    }
  }, [readOnly, status]);

  const oneStepForwardCb = React.useCallback(() => {
    if (!readOnly && status === 'parameters') {
      setStatus('fillBasisData');
    }
  }, [readOnly, status]);

  const { status: projectStatus, project } = useAndLoadProject(projectId || undefined);

  // const formFields: Field<FormData>[] = [
  //   {
  //     key: 'withRoles',
  //     label: i18n.modules.project.labels.extractRoles,
  //     type: 'boolean',
  //     showAs: 'checkbox',
  //     isMandatory: true,
  //   },
  //   {
  //     key: 'withDeliverables',
  //     label: i18n.modules.project.labels.extractDeliverables,
  //     type: 'boolean',
  //     showAs: 'checkbox',
  //     isMandatory: true,
  //   },
  //   {
  //     key: 'withDocuments',
  //     label: i18n.modules.project.labels.extractDocuments,
  //     type: 'boolean',
  //     showAs: 'checkbox',
  //     isMandatory: true,
  //   },
  //   {
  //     key: 'justConvert',
  //     label: i18n.modules.project.labels.keepTheSimpleProject,
  //     type: 'boolean',
  //     showAs: 'checkbox',
  //     isMandatory: true,
  //   },
  // ];

  return projectStatus !== 'READY' || !project ? (
    <AvailabilityStatusIndicator status={projectStatus} />
  ) : (
    <>
      <Modal
        title={
          <span>
            {i18n.modules.project.actions.extractAModelFromProject} <b>{project?.name || ''}</b>
          </span>
        }
        showCloseButton
        onClose={() => {
          navigate('/models');
        }}
        className={css({
          '&:hover': { textDecoration: 'none' },
          display: 'flex',
          width: '800px',
          height: '580px',
        })}
        modalBodyClassName={css({
          alignItems: 'stretch',
        })}
        footer={close => (
          <Flex
            justify={'flex-end'}
            grow={1}
            className={css({ padding: space_M, columnGap: space_S })}
          >
            <Button
              invertedButton
              onClick={() => {
                if (!readOnly) {
                  resetCb();
                  close();
                }
              }}
            >
              {i18n.common.cancel}
            </Button>

            {showBackButton && (
              <Button invertedButton onClick={oneStepBackCb}>
                {i18n.common.back}
              </Button>
            )}

            {showNextButton && <Button onClick={oneStepForwardCb}>{i18n.common.next}</Button>}

            {showCreateButton && (
              <ButtonWithLoader
                onClick={() => {
                  if (!readOnly) {
                    setReadOnly(true);
                    startLoading();
                    dispatch(API.updateProject({ ...project, type: 'MODEL' })).then(() => {
                      resetCb();
                      close();
                      navigate('/models');
                      // window.open(`#/editor/${payload.payload}`, '_blank');
                      stopLoading();
                    });
                  }
                }}
                isLoading={isLoading}
              >
                {i18n.modules.project.actions.createModel +
                  ' - for the moment just set type to MODEL'}
              </ButtonWithLoader>
            )}
          </Flex>
        )}
      >
        {() => {
          return (
            <>
              <WIPContainer>
                {status === 'parameters' ? (
                  <ProjectModelParameters />
                ) : (
                  <ProjectModelDataInitialization />
                )}
              </WIPContainer>
            </>
          );
        }}
      </Modal>
    </>
  );
}

function ProjectModelParameters(): JSX.Element {
  const i18n = useTranslations();
  return (
    <>
      <h2>Paramètres du projet</h2>
      <h3>Extract</h3>
      <ul>
        <li>roles</li>
        <li>card contents</li>
        <li>documentation</li>
      </ul>
      <h3>{i18n.modules.project.labels.keepTheSimpleProject}</h3>
    </>
  );
}

function ProjectModelDataInitialization(): JSX.Element {
  return (
    <>
      <h2>Données du projet</h2>
      <ul>
        <li>name</li>
        <li>description</li>
        <li>illustration</li>
      </ul>
    </>
  );
}
