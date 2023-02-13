/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

//import { css } from '@emotion/css';
//import { entityIs, Project } from 'colab-rest-client';
import { css, cx } from '@emotion/css';
import { AsyncThunk } from '@reduxjs/toolkit';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadInstanceableModels } from '../../selectors/projectSelector';
import { useAppDispatch } from '../../store/hooks';
import { AvailabilityStatus } from '../../store/store';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import InlineLoading from '../common/element/InlineLoading';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  borderRadius,
  errorColor,
  lightIconButtonStyle,
  lightText,
  multiLineEllipsis,
  oneLineEllipsis,
  space_S,
  textSmall,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';

function sortResources(a: Project, b: Project): number {
  return (a.id || 0) - (b.id || 0);
}

const projectThumbnailStyle = css({
  padding: 0,
  minHeight: '80px',
  maxHeight: '80px',
  margin: space_S,
  border: '1px solid var(--lightGray)',
  borderRadius: borderRadius,
  overflow: 'hidden',
  minWidth: '250px',
  maxWidth: '250px',
});

interface SharedModelsListProps {
  loadingStatus: AvailabilityStatus;
  // eslint-disable-next-line @typescript-eslint/ban-types
  reload: AsyncThunk<Project[], void, {}>;
}
export default function SharedModelsList({
  loadingStatus,
  reload,
}: SharedModelsListProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const { projects, status } = useAndLoadInstanceableModels();

  const sortedProjects = (projects || []).sort(sortResources);

  React.useEffect(() => {
    if (loadingStatus === 'NOT_INITIALIZED') {
      dispatch(reload());
    }
  }, [loadingStatus, reload, dispatch]);

  if (loadingStatus === 'NOT_INITIALIZED' || loadingStatus === 'LOADING' || status !== 'READY') {
    return (
      <div>
        {loadingStatus}
        <InlineLoading />
      </div>
    );
  } else {
    return (
      <Flex wrap="wrap">
        {sortedProjects.map((project, index) => {
          const isEmptyProject = project === null;
          return (
            <Flex
              key={project.id ? project.id : index}
              align="stretch"
              className={projectThumbnailStyle}
            >
              <Flex className={css({ minWidth: '70px' })}>
                <IllustrationDisplay
                  iconSize="2x"
                  illustration={
                    isEmptyProject
                      ? {
                          '@class': 'Illustration',
                          iconLibrary: 'FONT_AWESOME_REGULAR',
                          iconKey: 'file',
                          iconBkgdColor: '#50BFD5',
                        }
                      : project.illustration || { ...defaultProjectIllustration }
                  }
                />
              </Flex>
              <Flex
                grow={1}
                align="stretch"
                direction="column"
                className={css({ padding: '10px' })}
              >
                <Flex justify="space-between">
                  <h3 className={cx(css({ marginTop: space_S }), oneLineEllipsis)}>
                    {!isEmptyProject
                      ? project.name
                        ? project.name
                        : i18n.modules.project.actions.newProject
                      : i18n.modules.project.info.emptyProject}
                  </h3>
                  <DropDownMenu
                    icon={'more_vert'}
                    valueComp={{ value: '', label: '' }}
                    buttonClassName={cx(css({ marginLeft: '30px' }), lightIconButtonStyle)}
                    entries={[
                      {
                        value: 'show details',
                        label: (
                          <>
                             <Icon icon={'info'} /> Show details
                          </>
                        ),
                        //action: () => navigate(`projectsettings/${project.id}`),
                      },
                      {
                        value: 'Ask edition rights',
                        label: (
                          <>
                            <Icon icon={'edit'} /> Ask for edition rights
                          </>
                        ),
                        //action: () => navigate(`projectsettings/${project.id}`),
                      },
                      {
                        value: 'delete',
                        label: (
                          <>
                             <Icon icon={'delete'} color={errorColor} />{' '}
                            {i18n.common.delete}
                          </>
                        ),
                        //action: () => navigate(`deleteproject/${project.id}`),
                      },
                    ]}
                  />
                </Flex>
                <p className={cx(textSmall, lightText, multiLineEllipsis)}>
                  {!isEmptyProject
                    ? project.description
                      ? project.description
                      : i18n.common.noDescription
                    : i18n.modules.project.info.useBlankProject}
                </p>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    );
  }
}
