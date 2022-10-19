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
import Checkbox from '../common/element/Checkbox';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import { LabeledInput, LabeledTextArea } from '../common/element/Input';
import Flex from '../common/layout/Flex';
import Modal from '../common/layout/Modal';
import { space_L, space_M, space_S } from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import { ProjectIllustrationMaker } from './ProjectIllustrationMaker';

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

  React.useEffect(() => {
    if (project) {
      setData({
        ...data,
        name: project.name || data.name,
        description: project.description || data.description,
        illustration: project.illustration || data.illustration,
      });
    }
  }, [project, data, setData]);

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
        onClose={() => navigate('../')}
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
                {i18n.modules.project.actions.createModel}
                {/* +
                  ' - for the moment just set type to MODEL'} */}
              </ButtonWithLoader>
            )}
          </Flex>
        )}
      >
        {() => {
          return (
            // <WIPContainer>
            <Flex direction="column">
              {status === 'parameters' ? (
                <ProjectModelParameters data={data} setData={setData} />
              ) : (
                <ProjectModelDataInitialization data={data} />
              )}
            </Flex>
            // </WIPContainer>
          );
        }}
      </Modal>
    </>
  );
}

function ProjectModelParameters({
  data,
  setData,
}: {
  data: ModelCreationData;
  setData: React.Dispatch<React.SetStateAction<ModelCreationData>>;
}): JSX.Element {
  const i18n = useTranslations();
  return (
    <>
      <h2>{i18n.projectParameters}</h2>
      <Flex direction="column" className={css({ padding: '10px' })}>
        <h3>{i18n.extract}</h3>
        <Checkbox
          label={i18n.roles}
          onChange={function (newValue: boolean): void {
            setData({ ...data, withRoles: newValue });
          }}
        />
        <Checkbox label={i18n.cardContent} onChange={function (_newValue: boolean): void {}} />
        <Checkbox label={i18n.documentation} onChange={function (_newValue: boolean): void {}} />
      </Flex>
      <Flex direction="column" className={css({ padding: '10px' })}>
        <h3>{i18n.whatToDoWithOriginalSimpleProject}</h3>
        <Checkbox label={i18n.keep} onChange={function (_newValue: boolean): void {}} />
      </Flex>
    </>
  );
}

function ProjectModelDataInitialization({ data }: { data: ModelCreationData }): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      <Flex className={css({ alignSelf: 'stretch' })}>
        <Flex
          direction="column"
          align="stretch"
          className={css({ width: '45%', minWidth: '45%', marginRight: space_L })}
        >
          <LabeledInput
            label={i18n.common.name}
            placeholder={i18n.modules.project.actions.newProject}
            value={data.name || ''}
            onChange={() => {}}
          />
          <LabeledTextArea
            label={i18n.common.description}
            placeholder={i18n.common.info.writeDescription}
            value={data.description || ''}
            onChange={() => {}}
          />
        </Flex>
        <Flex
          direction="column"
          align="stretch"
          justify="flex-end"
          className={css({ width: '55%' })}
        >
          <IllustrationDisplay illustration={data.illustration} />
          <ProjectIllustrationMaker
            illustration={data.illustration}
            setIllustration={i => (data.illustration = i)}
          />
        </Flex>
      </Flex>
    </>
  );
}
