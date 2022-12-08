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

const modalStyle = css({
  '&:hover': { textDecoration: 'none' },
  display: 'flex',
  width: '800px',
  height: '580px',
});

export interface ModelCreationData {
  simpleProject: Project | null;
  withRoles: boolean;
  withDeliverables: boolean;
  withResources: boolean;
  name: string;
  description: string;
  illustration: Illustration;
  guests: string[];
}

const defaultData: ModelCreationData = {
  simpleProject: null,
  withRoles: true,
  withDeliverables: true,
  withResources: true,
  name: '',
  description: '',
  illustration: { ...defaultProjectIllustration },
  guests: [],
};

type ProgressionStep = 'parameters' | 'fillBasisData';

const initialProgressionStep = 'parameters';

/* ---------------------------------------------------------------------------------------------- */

interface ProjectModelExtractorProps {
  projectId: number | null | undefined;
}

export function ProjectModelExtractor({ projectId }: ProjectModelExtractorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const { status: projectStatus, project } = useAndLoadProject(projectId || undefined);

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [data, setData] = React.useState<ModelCreationData>({ ...defaultData });

  const [readOnly, setReadOnly] = React.useState<boolean>(false);

  const [step, setStep] = React.useState<ProgressionStep>(initialProgressionStep);

  const showBackButton: boolean = React.useMemo(() => {
    return step === 'fillBasisData';
  }, [step]);

  const showNextButton: boolean = React.useMemo(() => {
    return step === 'parameters';
  }, [step]);

  const showCreateButton: boolean = React.useMemo(() => {
    return step === 'fillBasisData';
  }, [step]);

  React.useEffect(() => {
    if (project) {
      setData({
        ...data,
        name: project.name || data.name,
        description: project.description || data.description,
        illustration: project.illustration || data.illustration,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]); // state must not be set

  const oneStepBack = React.useCallback(() => {
    if (!readOnly && step === 'fillBasisData') {
      setStep('parameters');
    }
  }, [readOnly, step]);

  const oneStepForward = React.useCallback(() => {
    if (!readOnly && step === 'parameters') {
      setStep('fillBasisData');
    }
  }, [readOnly, step]);

  const reset = React.useCallback(() => {
    setStep(initialProgressionStep);

    setReadOnly(false);

    data.guests.splice(0, data.guests.length);
    setData({ ...defaultData });
  }, [data.guests]);

  const modalTitle = React.useMemo(() => {
    return (
      <span>
        {i18n.modules.project.actions.saveProjectAsModelPart}{' '}
        <b>{project?.name ? ' ' + project.name : ''}</b>
      </span>
    );
  }, [i18n, project]);

  if (projectStatus !== 'READY' || !project) {
    return (
      <Modal
        title={modalTitle}
        showCloseButton
        onClose={() => navigate('../')}
        className={modalStyle}
        modalBodyClassName={css({
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        {() => {
          return (
            <>
              <AvailabilityStatusIndicator status={projectStatus} />
              {projectStatus === 'ERROR' && (
                <div>{i18n.modules.project.info.initialProjectNotFound}</div>
              )}
            </>
          );
        }}
      </Modal>
    );
  }

  return (
    <Modal
      title={modalTitle}
      showCloseButton
      onClose={() => navigate('../')}
      className={modalStyle}
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
                reset();
                close();
              }
            }}
          >
            {i18n.common.cancel}
          </Button>

          {showBackButton && (
            <Button invertedButton onClick={oneStepBack}>
              {i18n.common.back}
            </Button>
          )}

          {showNextButton && <Button onClick={oneStepForward}>{i18n.common.next}</Button>}

          {showCreateButton && (
            <ButtonWithLoader
              onClick={async () => {
                if (!readOnly) {
                  setReadOnly(true);
                  startLoading();
                  dispatch(
                    API.createProject({
                      type: 'MODEL',
                      name: data.name,
                      description: data.description,
                      illustration: data.illustration,
                      guestsEmail: data.guests,
                      baseProjectId: projectId || null,
                      duplicationParam: {
                        '@class': 'DuplicationParam',
                        withRoles: data.withRoles,
                        withTeamMembers: false,
                        withCardTypes: true,
                        withCardsStructure: true,
                        withDeliverables: data.withDeliverables,
                        withResources: data.withResources,
                        withStickyNotes: true,
                        withActivityFlow: true,
                        makeOnlyCardTypeReferences: false, // will need an option
                        resetProgressionData: true,
                      },
                    }),
                  ).then(() => {
                    reset();
                    stopLoading();
                    close();
                    // Dom choice : do not navigate to the model list when created
                    //navigate('/models');
                  });
                }
              }}
              isLoading={isLoading}
            >
              {i18n.common.save}
            </ButtonWithLoader>
          )}
        </Flex>
      )}
    >
      {() => {
        return (
          <Flex direction="column">
            {step === 'parameters' ? (
              <ProjectModelParameters data={data} setData={setData} readOnly={readOnly} />
            ) : (
              <ProjectModelDataInitialization data={data} setData={setData} readOnly={readOnly} />
            )}

            {/* <div className={css({ fontSize: '0.8em' })}>
              data
              <div>
                <p>simpleProject : {data.simpleProject?.id} </p>
                <p>withRoles : {data.withRoles ? 'yes' : 'no'} </p>
                <p>withDeliverables : {data.withDeliverables ? 'yes' : 'no'} </p>
                <p>withResources : {data.withResources ? 'yes' : 'no'} </p>
                <p>name : {data.name} </p>
                <p>description : {data.description} </p>
                <p>
                  illustration : {data.illustration.iconKey} - {data.illustration.iconBkgdColor}{' '}
                </p>
              </div>
            </div> */}
          </Flex>
        );
      }}
    </Modal>
  );
}

/* ---------------------------------------------------------------------------------------------- */

interface ProjectModelParametersProps {
  data: ModelCreationData;
  setData: React.Dispatch<React.SetStateAction<ModelCreationData>>;
  readOnly?: boolean;
}

function ProjectModelParameters({
  data,
  setData,
  readOnly,
}: ProjectModelParametersProps): JSX.Element {
  const i18n = useTranslations();

  return (
    <>
      <h3>{i18n.modules.project.labels.include}</h3>
      <Checkbox
        value={data.withRoles}
        label={i18n.modules.project.labels.roles}
        readOnly={readOnly}
        onChange={(newValue: boolean) => {
          if (!readOnly) {
            setData({ ...data, withRoles: newValue });
          }
        }}
      />
      <Checkbox
        value={data.withDeliverables}
        label={i18n.modules.project.labels.cardContents}
        readOnly={readOnly}
        onChange={(newValue: boolean) => {
          if (!readOnly) {
            setData({ ...data, withDeliverables: newValue });
          }
        }}
      />
      <Checkbox
        value={data.withResources}
        label={i18n.modules.project.labels.documentation}
        readOnly={readOnly}
        onChange={(newValue: boolean) => {
          if (!readOnly) {
            setData({ ...data, withResources: newValue });
          }
        }}
      />
    </>
  );
}

/* ---------------------------------------------------------------------------------------------- */

interface ProjectModelDataInitializationProps {
  data: ModelCreationData;
  setData: React.Dispatch<React.SetStateAction<ModelCreationData>>;
  readOnly?: boolean;
}

function ProjectModelDataInitialization({
  data,
  setData,
  readOnly,
}: ProjectModelDataInitializationProps): JSX.Element {
  const i18n = useTranslations();

  return (
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
          readOnly={readOnly}
          onChange={(newValue: string) => {
            if (!readOnly) {
              setData({ ...data, name: newValue });
            }
          }}
        />
        <LabeledTextArea
          label={i18n.common.description}
          placeholder={i18n.common.info.writeDescription}
          value={data.description || ''}
          readOnly={readOnly}
          onChange={(newValue: string) => {
            if (!readOnly) {
              setData({ ...data, description: newValue });
            }
          }}
        />
      </Flex>
      <Flex direction="column" align="stretch" justify="flex-end" className={css({ width: '55%' })}>
        <IllustrationDisplay illustration={data.illustration} />
        <ProjectIllustrationMaker
          illustration={data.illustration}
          setIllustration={(newValue: Illustration) => {
            if (!readOnly) {
              setData({ ...data, illustration: newValue });
            }
          }}
        />
      </Flex>
    </Flex>
  );
}
