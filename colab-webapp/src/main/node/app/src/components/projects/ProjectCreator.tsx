/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import OpenCloseModal from '../common/OpenCloseModal';
import Tips from '../common/Tips';
import ProjectDataInitialization from './ProjectDataInitialization';
import ProjectModelSelector from './ProjectModelSelector';

// TODO stabilise modal size

// TODO see if a click outside the modal must reset the data

export interface ProjectBasisData {
  name: string;
  description: string;
  guests: string[];
  projectModel: Project | null;
}

const defaultData: ProjectBasisData = {
  name: '',
  description: '',
  guests: [],
  projectModel: null,
};

type ProgressionStatus = 'chooseModel' | 'fillBasisData';

interface ProjectCreatorProps {
  collapsedButtonClassName?: string;
}

export default function ProjectCreator({
  collapsedButtonClassName,
}: ProjectCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [status, setStatus] = React.useState<ProgressionStatus>('chooseModel');

  const [data, setData] = React.useState<ProjectBasisData>({ ...defaultData });

  const [title, setTitle] = React.useState<React.ReactNode>();

  const [showBackButton, setShowBackButton] = React.useState<boolean>(false);
  const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
  const [showCreateButton, setShowCreateButton] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (status === 'chooseModel') {
      setTitle('Create new project - step 1 : choose a model');
    } else if (status === 'fillBasisData' && data.projectModel) {
      setTitle('Create new project from ' + data.projectModel.name);
    } else {
      setTitle('Create new project');
    }
  }, [status, data.projectModel]);

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

  const resetCb = React.useCallback(() => {
    setStatus('chooseModel');

    data.guests.splice(0, data.guests.length);
    setData({ ...defaultData });
  }, [data.guests]);

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

  return (
    <OpenCloseModal
      title={title}
      //className={}
      collapsedChildren={
        <Button className={collapsedButtonClassName} icon={faPlus}>
          Create a project
        </Button>
      }
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
                const creationData = {
                  name: data.name,
                  description: data.description,
                  guestsEmail: data.guests,
                  modelId: data.projectModel?.id || null,
                };
                dispatch(API.createProject(creationData));
                resetCb();
                close();
                // TODO navigate to brand new project
              }}
            >
              Create project
            </Button>
          )}
        </>
      )}
    >
      {() => {
        return (
          <>
            <Tips tipsType="TODO">work in progress</Tips>
            {status === 'chooseModel' ? (
              <ProjectModelSelector
                defaultSelection={data.projectModel}
                onSelect={selectedModel => setData({ ...data, projectModel: selectedModel })}
                whenDone={oneStepForwardCb}
              />
            ) : (
              <ProjectDataInitialization
                data={data}
                setName={name => setData({ ...data, name: name })}
                setDescription={description => setData({ ...data, description: description })}
                addGuest={guestEmailAddress => {
                  const guests = data.guests;
                  guests.push(guestEmailAddress);
                  setData({ ...data, guests: guests });
                }}
                removeGuest={guestEmailAddress => {
                  const guests = data.guests;
                  const index = guests.indexOf(guestEmailAddress);
                  guests.splice(index, 1);
                  setData({ ...data, guests: guests });
                }}
              />
            )}
            {/* debug mode */}
            {/* <Flex direction="column">
              <Flex>{data.name || 'no name'}</Flex>
              <Flex>{data.description || 'no description'}</Flex>
              <Flex>{data.guests.length}</Flex>
              <Flex>{data.projectModel?.name || 'no project model'}</Flex>
            </Flex> */}
          </>
        );
      }}
    </OpenCloseModal>
  );
}
