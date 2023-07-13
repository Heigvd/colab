/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { Illustration, Project } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import { heading_xs, space_lg, space_md, space_sm } from '../../../styling/style';
import Button from '../../common/element/Button';
import IllustrationDisplay from '../../common/element/IllustrationDisplay';
import { FormInput } from '../../common/element/Input';
import IllustrationPicker from '../../common/illustration/IllustrationPicker';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import ProjectModelSelector from '../models/ProjectModelSelector';
import { defaultProjectIllustration, projectIcons } from '../ProjectCommon';

const projectIllustrationOverlay = css({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  opacity: 0,
  padding: space_sm,
  '&:hover': {
    backgroundColor: 'rgba(256, 256, 256, 0.4)',
    opacity: 1,
    cursor: 'pointer',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export interface ProjectCreationData {
  name: string;
  illustration: Illustration;
  projectModel: Project | null;
}

const defaultData: ProjectCreationData = {
  name: '',
  illustration: { ...defaultProjectIllustration },
  projectModel: null,
};

export default function ProjectCreator() {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [readOnly, setReadOnly] = React.useState<boolean>(false);
  const [data, setData] = React.useState<ProjectCreationData>({ ...defaultData });

  const [editIllustration, setEditIllustration] = React.useState<boolean>(false);

  return (
    <OpenCloseModal
      title={i18n.modules.project.actions.createAProject}
      widthMax
      heightMax
      collapsedChildren={
        <Button kind="outline" size="sm" icon="add">
          {i18n.modules.project.actions.createProject}
        </Button>
      }
      modalBodyClassName={css({ alignItems: 'stretch' })}
      footer={close => (
        <Flex
          justify={'flex-end'}
          grow={1}
          className={css({ padding: space_lg, columnGap: space_sm })}
        >
          <Button
            kind="outline"
            onClick={() => {
              if (!readOnly) {
                setData({ ...defaultData });
                close();
              }
            }}
          >
            {i18n.common.cancel}
          </Button>
          <Button
            onClick={() => {
              if (!readOnly) {
                setReadOnly(true);
                startLoading();
                dispatch(
                  API.createProject({
                    type: 'PROJECT',
                    name: data.name,
                    illustration: data.illustration,
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
                  setData({ ...defaultData });
                  close();
                  setReadOnly(false);
                  window.open(`#/editor/${payload.payload}`, '_blank');
                  stopLoading();
                });
              }
            }}
            isLoading={isLoading}
          >
            {i18n.modules.project.actions.createAProject}
          </Button>
        </Flex>
      )}
    >
      {() => (
        <Flex align="stretch" className={css({ alignSelf: 'stretch' })} direction="column">
          <Flex align="center" justify="center" gap={space_md}>
            <Flex
              className={css({
                marginBottom: space_sm,
                position: 'relative',
              })}
              onClick={() => setEditIllustration(!editIllustration)}
            >
              <IllustrationDisplay illustration={data.illustration} />
              <Flex
                align="flex-end"
                justify="flex-end"
                className={projectIllustrationOverlay}
                title={i18n.modules.project.actions.editIllustration}
              >
                <Icon icon={'edit'} color={'var(--bg-primary)'} />
              </Flex>
            </Flex>

            <FormInput
              placeholder={i18n.common.name}
              value={data.name}
              readOnly={readOnly}
              onChange={name => setData({ ...data, name: name })}
            />
          </Flex>
          {editIllustration && (
            <Flex
              direction="column"
              align="stretch"
              className={css({
                padding: space_lg,
                border: '1px solid var(--primary-main)',
                marginBottom: space_lg,
              })}
            >
              <IllustrationPicker
                illustration={
                  data.illustration || data.projectModel?.illustration || defaultProjectIllustration
                }
                setIllustration={illustration => {
                  setData({ ...data, illustration: illustration });
                }}
                iconList={projectIcons}
                iconContainerClassName={css({ marginBottom: space_sm, maxHeight: '100px' })}
              />
              <Flex justify="flex-end" className={css({ gap: space_sm })}>
                <Button
                  onClick={() => {
                    setEditIllustration(false);
                  }}
                >
                  {i18n.common.close}
                </Button>
              </Flex>
            </Flex>
          )}
          <Flex
            direction="column"
            align="stretch"
            className={css({
              paddingTop: space_lg,
              marginTop: space_lg,
              borderTop: '1px solid var(--divider-main)',
            })}
          >
            <Flex grow={1} align={'center'} className={heading_xs}>
              {i18n.modules.project.actions.chooseAModel}
            </Flex>
            <ProjectModelSelector
              defaultSelection={data.projectModel}
              onSelect={selectedModel =>
                setData({
                  ...data,
                  projectModel: selectedModel,
                })
              }
            />
          </Flex>
        </Flex>
      )}
    </OpenCloseModal>
  );
}
