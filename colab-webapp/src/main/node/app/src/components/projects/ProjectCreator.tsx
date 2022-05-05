/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import OpenCloseModal from '../common/OpenCloseModal';
import ProjectDataInitialization from './ProjectDataInitialization';
import ProjectModelSelector from './ProjectModelSelector';

// TODO stabilise modal size

// interface ProjectCreatorProps {
//   className?: string;
// }

type ProgressionStatus = 'chooseModel' | 'fillBasisData';

export default function ProjectCreator(/*{ className }: ProjectCreatorProps)*/): JSX.Element {
  const dispatch = useAppDispatch();

  const [status, setStatus] = React.useState<ProgressionStatus>('chooseModel');
  const [projectModel, setProjectModel] = React.useState<Project | null>(null);

  const [title, setTitle] = React.useState<React.ReactNode>();

  const [showBackButton, setShowBackButton] = React.useState<boolean>(false);
  const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
  const [showCreateButton, setShowCreateButton] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (status === 'chooseModel') {
      setTitle('Create new project - step 1 : choose a model');
    } else if (status === 'fillBasisData' && projectModel) {
      setTitle('Create new project from ' + projectModel.name);
    } else {
      setTitle('Create new project');
    }
  }, [status, projectModel]);

  React.useEffect(() => {
    if (status === 'chooseModel') {
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

  //TODO work in progress : see if better function reset() {
  const resetCb = React.useCallback(() => {
    setStatus('chooseModel');
    setProjectModel(null);
  }, []);

  const oneStepBackCb = React.useCallback(() => {
    if (status === 'fillBasisData') {
      setStatus('chooseModel');
    }
  }, [status]);

  const oneStepForwardCb = React.useCallback(() => {
    if (status === 'chooseModel') {
      setStatus('fillBasisData');
    }
  }, [status]);

  const createProjectCb = React.useCallback(() => {
    dispatch(API.createProject());
  }, [dispatch]);

  // TODO sandra work in progres : see if click outside must reset data

  return (
    <OpenCloseModal
      title={title}
      //className={}
      collapsedChildren={<Button>Create a project</Button>}
      //showCloseButton = {false}
      status="EXPANDED" // TODO remove. it is there temporary for debug
      // modalClassName=''
      footer={close => (
        <>
          <Button
            onClick={() => {
              resetCb();
              close();
            }}
          >
            Cancel
          </Button>
          {showBackButton && <Button onClick={oneStepBackCb}>Back</Button>}
          {showNextButton && <Button onClick={oneStepForwardCb}>Next</Button>}
          {showCreateButton && (
            <Button
              onClick={() => {
                createProjectCb();
                resetCb();
                close();
              }}
            >
              Create
            </Button>
          )}
        </>
      )}
    >
      {() => {
        return (
          <>
            {status === 'chooseModel' ? (
              <ProjectModelSelector
                defaultSelection={projectModel}
                onSelect={selectedModel => setProjectModel(selectedModel)}
                whenDone={oneStepForwardCb}
              />
            ) : (
              <ProjectDataInitialization projectModel={projectModel} />
            )}
          </>
        );
      }}
    </OpenCloseModal>
  );
}
