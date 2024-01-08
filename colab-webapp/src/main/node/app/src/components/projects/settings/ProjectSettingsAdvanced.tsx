/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../../API/api';
import { useAppDispatch } from '../../../store/hooks';
import { useProject } from '../../../store/selectors/projectSelector';
import { space_lg } from '../../../styling/style';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import ConfirmDeleteOpenCloseModal from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';

export interface ProjectSettingsAdvancedProps {
  projectId: number;
}

export default function ProjectSettingsAdvanced({
  projectId,
}: ProjectSettingsAdvancedProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { project, status } = useProject(projectId);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      {project.type === 'MODEL' ? (
        <Flex align="stretch" className={css({ border: '1px solid var(--text-primary)' })}>
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
                      kind="outline"
                      className={cx(
                        css({ color: 'var(--error-main)', borderColor: 'var(--error-main)' }),
                      )}
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
                      kind="outline"
                      className={cx(
                        css({ color: 'var(--error-main)', borderColor: 'var(--error-main)' }),
                      )}
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
      ) : (
        <span>Nothing special for simple projects</span>
      )}
    </>
  );
}
