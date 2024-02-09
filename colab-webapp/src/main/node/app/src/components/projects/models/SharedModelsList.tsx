/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../../i18n/I18nContext';
import { useAndLoadInstanceableModels } from '../../../store/selectors/projectSelector';
import { compareById } from '../../../store/selectors/selectorHelper';
import { dropDownMenuDefaultIcon, putInBinDefaultIcon } from '../../../styling/IconDefault';
import {
  br_lg,
  lightIconButtonStyle,
  lightTextStyle,
  multiLineEllipsisStyle,
  oneLineEllipsisStyle,
  space_sm,
  text_sm,
} from '../../../styling/style';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import DeletionStatusIndicator from '../../common/element/DeletionStatusIndicator';
import IllustrationDisplay from '../../common/element/illustration/IllustrationDisplay';
import DropDownMenu from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import { blankModelIllustration } from '../ProjectCommon';
import { getProjectName } from '../ProjectName';

function sortResources(a: Project, b: Project): number {
  return compareById(a, b);
}

const projectThumbnailStyle = css({
  padding: 0,
  minHeight: '80px',
  maxHeight: '80px',
  margin: space_sm,
  border: '1px solid var(--divider-main)',
  borderRadius: br_lg,
  overflow: 'hidden',
  minWidth: '250px',
  maxWidth: '250px',
});

export default function SharedModelsList(): JSX.Element {
  const i18n = useTranslations();

  const { projects, status } = useAndLoadInstanceableModels();

  const sortedProjects = (projects || []).sort(sortResources);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
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
                  illustration={isEmptyProject ? blankModelIllustration : project.illustration}
                />
              </Flex>
              <Flex
                grow={1}
                align="stretch"
                direction="column"
                className={css({ padding: '10px' })}
              >
                <Flex justify="space-between">
                  <Flex className={css({ margin: '0 ' + space_sm, flexShrink: 0 })}>
                    {/* It should not be displayed if deleted. But whenever there is a bug, it is obvious */}
                    <DeletionStatusIndicator status={project.deletionStatus} size="sm" />
                  </Flex>
                  <h3 className={cx(css({ marginTop: space_sm }), oneLineEllipsisStyle)}>
                    {isEmptyProject
                      ? i18n.modules.project.info.emptyProject
                      : getProjectName({ project, i18n })}
                  </h3>
                  <DropDownMenu
                    icon={dropDownMenuDefaultIcon}
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
                        //action: () => ...
                      },
                      {
                        value: 'Ask edition rights',
                        label: (
                          <>
                            <Icon icon={'edit'} /> Ask for edition rights
                          </>
                        ),
                        //action: () => ...
                      },
                      {
                        value: 'removeFromList',
                        label: (
                          <>
                            <Icon icon={putInBinDefaultIcon} color={'var(--error-main)'} /> remove
                            from list
                          </>
                        ),
                        //action: () => ...
                      },
                    ]}
                  />
                </Flex>
                <p className={cx(text_sm, lightTextStyle, multiLineEllipsisStyle)}>
                  {isEmptyProject
                    ? i18n.modules.project.info.useBlankProject
                    : project.description
                    ? project.description
                    : i18n.common.noDescription}
                </p>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    );
  }
}
