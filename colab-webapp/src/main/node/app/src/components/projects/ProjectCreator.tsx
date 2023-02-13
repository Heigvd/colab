/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Illustration, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import ButtonWithLoader from '../common/element/ButtonWithLoader';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_M, space_S } from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';
import ProjectDataInitialization from './ProjectDataInitialization';
import ProjectModelSelector from './ProjectModelSelector';

// Note : when we click outside the modal, the data are kept

export interface ProjectCreationData {
  name: string;
  description: string;
  illustration: Illustration;
  guests: string[];
  projectModel: Project | null;
}

const defaultData: ProjectCreationData = {
  name: '',
  description: '',
  illustration: { ...defaultProjectIllustration },
  guests: [],
  projectModel: null,
};

type ProgressionStatus = 'chooseModel' | 'fillBasisData';

interface ProjectCreatorProps {
  collapsedButtonClassName?: string;
  disabled?: boolean;
}

export default function ProjectCreator({
  collapsedButtonClassName,
  disabled,
}: ProjectCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [status, setStatus] = React.useState<ProgressionStatus>('chooseModel');

  const [data, setData] = React.useState<ProjectCreationData>({ ...defaultData });

  const [title, setTitle] = React.useState<React.ReactNode>();

  const [showBackButton, setShowBackButton] = React.useState<boolean>(false);
  const [showNextButton, setShowNextButton] = React.useState<boolean>(false);
  const [showCreateButton, setShowCreateButton] = React.useState<boolean>(false);

  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  React.useEffect(() => {
    if (status === 'chooseModel') {
      setTitle(
        i18n.modules.project.actions.createAProject +
          ' : ' +
          i18n.modules.project.actions.chooseAModel,
      );
    } else if (status === 'fillBasisData' && data.projectModel) {
      setTitle(i18n.modules.project.actions.createAProjectFrom(data.projectModel.name));
    } else {
      setTitle(
        i18n.modules.project.actions.createAProjectFrom(i18n.modules.project.info.emptyProject),
      );
    }
  }, [status, i18n, data.projectModel]);

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

    setReadOnly(false);

    data.guests.splice(0, data.guests.length);
    setData({ ...defaultData });
  }, [data.guests]);

  const oneStepBackCb = React.useCallback(() => {
    if (!readOnly && status === 'fillBasisData') {
      setStatus('chooseModel');
    }
  }, [readOnly, status]);

  const oneStepForwardCb = React.useCallback(() => {
    if (!readOnly && status === 'chooseModel') {
      setStatus('fillBasisData');
    }
  }, [readOnly, status]);

  return (
    <OpenCloseModal
      title={title}
      widthMax
      heightMax
      collapsedChildren={
        <Button className={collapsedButtonClassName} icon={'add'} clickable={!disabled}>
          {i18n.modules.project.actions.createProject}
        </Button>
      }
      modalBodyClassName={css({ alignItems: 'stretch' })}
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
                  dispatch(
                    API.createProject({
                      type: 'PROJECT',
                      name: data.name,
                      description: data.description,
                      illustration: data.illustration,
                      guestsEmail: data.guests,
                      baseProjectId: data.projectModel?.id || null,
                      duplicationParam: {
                        '@class': 'DuplicationParam',
                        withRoles: true,
                        withTeamMembers: false,
                        withCardTypes: true,
                        withCardsStructure: true,
                        withDeliverables: true,
                        withResources: true,
                        withStickyNotes: true,
                        withActivityFlow: true,
                        makeOnlyCardTypeReferences: false, // will need an option
                        resetProgressionData: true,
                      },
                    }),
                  ).then(payload => {
                    resetCb();
                    close();
                    window.open(`#/editor/${payload.payload}`, '_blank');
                    stopLoading();
                  });
                }
              }}
              isLoading={isLoading}
            >
              {i18n.modules.project.actions.createProject}
            </ButtonWithLoader>
          )}
        </Flex>
      )}
    >
      {() => (
        <>
          {status === 'chooseModel' ? (
            <ProjectModelSelector
              defaultSelection={data.projectModel}
              onSelect={selectedModel =>
                setData({
                  ...data,
                  projectModel: selectedModel,
                  illustration: {
                    ...(selectedModel?.illustration || defaultData.illustration),
                  },
                })
              }
              whenDone={oneStepForwardCb}
            />
          ) : (
            <ProjectDataInitialization
              data={data}
              readOnly={readOnly}
              setName={name => setData({ ...data, name: name })}
              setDescription={description => setData({ ...data, description: description })}
              setIllustration={illustration => setData({ ...data, illustration: illustration })}
              addGuest={guestEmailAddress => {
                if (guestEmailAddress != null && guestEmailAddress.length > 0) {
                  const guests = data.guests;
                  guests.push(guestEmailAddress);
                  setData({ ...data, guests: guests });
                }
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
          {/* <Flex direction="column" className={workInProgressStyle}>
              <Flex>{data.name || 'no name'}</Flex>
              <Flex>{data.description || 'no description'}</Flex>
              <Flex>
                <IllustrationDisplay illustration={data.illustration} />
              </Flex>
              <Flex>{data.guests.length}</Flex>
              <Flex>{data.projectModel?.name || 'no project model'}</Flex>
            </Flex> */}
        </>
      )}
    </OpenCloseModal>
  );
}
