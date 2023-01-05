/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faGlobe, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
//import { CSVLink } from 'react-csv';
import useTranslations from '../../../i18n/I18nContext';
import logger from '../../../logger';
import { useProject } from '../../../selectors/projectSelector';
import { useAppSelector } from '../../../store/hooks';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import Button from '../../common/element/Button';
import { WIPContainer } from '../../common/element/Tips';
import ConfirmDeleteOpenCloseModal from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import {
  borderRadius,
  disabledStyle,
  errorColor,
  labelStyle,
  space_M,
  space_S,
  textSmall,
} from '../../styling/style';

export interface ProjectSettingsAdvancedProps {
  projectId: number;
}

export default function ProjectSettingsAdvanced({
  projectId,
}: ProjectSettingsAdvancedProps): JSX.Element {
  const i18n = useTranslations();
  const state = useAppSelector(state => state);

  const { project, status } = useProject(projectId);

  const [isProjectGlobal, setIsProjectGlobal] = React.useState<boolean>(false);

  if (status !== 'READY' || project == null) {
    return <AvailabilityStatusIndicator status={status} />;
  }

  return (
    <>
      <WIPContainer>
        <Flex direction="column">
          <div className={labelStyle}>{i18n.common.action.exportProjectData}</div>
          <p className={textSmall}>{i18n.common.action.exportDataDescription}</p>
          <Flex gap={space_S}>
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
        <WIPContainer>
          <Flex
            align="stretch"
            className={css({ border: '1px solid var(--fgColor)', borderRadius: borderRadius })}
          >
            <Flex
              justify="center"
              align="center"
              className={css({ backgroundColor: 'var(--fgColor)', width: '80px' })}
            >
              <FontAwesomeIcon
                icon={isProjectGlobal ? faGlobe : faStar}
                className={css({ color: 'var(--bgColor)' })}
                size="2x"
              />
            </Flex>
            <Flex direction="column" align="stretch" className={css({ padding: space_M })}>
              {isProjectGlobal ? (
                <>
                  <h3>This model is global</h3>
                  <p>Everyone with a co.LAB account can create a project base on this model.</p>
                  <p>Want to make it private?</p>
                  <ConfirmDeleteOpenCloseModal
                    title="Make private"
                    buttonLabel={
                      <Button
                        invertedButton
                        className={cx(css({ color: errorColor, borderColor: errorColor }))}
                        clickable
                      >
                        <FontAwesomeIcon icon={faStar} /> Make private
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
                        Are you sure you want to make this model private? Once private, no one will
                        be able to create a project from this model except the people you share it
                        with.
                      </p>
                    }
                    onConfirm={() => setIsProjectGlobal(e => !e)}
                    confirmButtonLabel="Make private"
                  />
                </>
              ) : (
                <>
                  <h3>This model is private</h3>
                  <p>You can share it for edition or usage to create prjects based on it.</p>
                  <p>Want to make it global?</p>
                  <ConfirmDeleteOpenCloseModal
                    title="Make global"
                    buttonLabel={
                      <Button
                        invertedButton
                        className={cx(css({ color: errorColor, borderColor: errorColor }))}
                        clickable
                      >
                        <FontAwesomeIcon icon={faGlobe} /> Make global
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
                        Are you sure you want to make this model global? Once global, everyone with
                        a co.LAB account will be able to create a project base on this model.
                      </p>
                    }
                    onConfirm={() => setIsProjectGlobal(e => !e)}
                    confirmButtonLabel="Make global"
                  />
                </>
              )}
            </Flex>
          </Flex>
        </WIPContainer>
      )}
    </>
  );
}
