/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
//import { CSVLink } from 'react-csv';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import { useProject } from '../../../selectors/projectSelector';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import { WIPContainer } from '../../common/element/Tips';
import ConfirmDeleteOpenCloseModal from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import {
  disabledStyle,
  labelStyle,
  space_lg,
  space_sm,
  text_sm,
} from '../../styling/style';

export interface ProjectSettingsAdvancedProps {
  projectId: number;
}

export default function ProjectSettingsAdvanced({
  projectId,
}: ProjectSettingsAdvancedProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();
  const state = useAppSelector(state => state);

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <WIPContainer>
        <Flex direction="column">
          <div className={labelStyle}>{i18n.common.action.exportProjectData}</div>
          <p className={text_sm}>{i18n.common.action.exportDataDescription}</p>
          <Flex gap={space_sm}>
            {/* <Button className={invertedButtonStyle}>.json</Button> */}
            <Button
              className={disabledStyle}
              onClick={() => {
                logger.info(state);
              }}
            >
              .csv
            </Button>
            {/* <CSVLink data={csvData}>Download me</CSVLink> */}
          </Flex>
        </Flex>
      </WIPContainer>
      {project.type === 'MODEL' && (
        <Flex
          align="stretch"
          className={css({ border: '1px solid var(--text-primary)'})}
        >
          <Flex
            justify="center"
            align="center"
            className={css({ backgroundColor: 'var(--primary-darker)', width: '80px' })}
          >
             <Icon
              icon={project.globalProject ? 'public' : 'star'}
              className={css({ color: 'var(--bg-primary)' })}
              opsz="lg"
            />
          </Flex>
          <Flex direction="column" align="stretch" className={css({ padding: space_lg })}>
            {project.globalProject ? (
              <>
                <h3>This model is global</h3>
                <p>Everyone with a co.LAB account can create a project base on this model.</p>
                <p>Want to make it private?</p>
                <ConfirmDeleteOpenCloseModal
                  title="Make private"
                  buttonLabel={
                    <Button
                      invertedButton
                      className={cx(css({ color: 'var(--error-main)', borderColor: 'var(--error-main)' }))}
                    >
                       <Icon icon={'star'} /> Make private
                    </Button>
                  }
                  className={css({
                    '&:hover': { textDecoration: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'flex-end',
                  })}
                  message={
                    <p>
                      Are you sure you want to make this model private? Once private, no one will be
                      able to create a project from this model except the people you share it with.
                    </p>
                  }
                  onConfirm={() =>
                    dispatch(API.updateProject({ ...project!, globalProject: false }))
                  }
                  confirmButtonLabel="Make private"
                />
              </>
            ) : (
              <>
                <h3>This model is private</h3>
                <p>You can share it for edition or usage to create projects based on it.</p>
                <p>Want to make it global?</p>
                <ConfirmDeleteOpenCloseModal
                  title="Make global"
                  buttonLabel={
                    <Button
                      invertedButton
                      className={cx(css({ color: 'var(--error-main)', borderColor: 'var(--error-main)' }))}
                    >
                       <Icon icon={'public'} /> Make global
                    </Button>
                  }
                  className={css({
                    '&:hover': { textDecoration: 'none' },
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'flex-end',
                  })}
                  message={
                    <p>
                      Are you sure you want to make this model global? Once global, everyone with a
                      co.LAB account will be able to create a project based on this model.
                    </p>
                  }
                  onConfirm={() =>
                    dispatch(API.updateProject({ ...project!, globalProject: true }))
                  }
                  confirmButtonLabel="Make global"
                />
              </>
            )}
          </Flex>
        </Flex>
      )}
    </>
  );
}
