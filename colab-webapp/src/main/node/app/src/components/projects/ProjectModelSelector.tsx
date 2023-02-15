/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadMyAndInstanceableModels } from '../../selectors/projectSelector';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import {
  lightTextStyle,
  multiLineEllipsisStyle,
  space_sm,
  text_sm,
} from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';

const modelPictoCornerStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  padding: '5px 7px 7px 5px',
  borderRadius: '0 0 50% 0',
});

const projectThumbnailStyle = css({
  padding: 0,
  //width: `calc(50% - 8px - 2*${space_S})`,
  minHeight: '80px',
  maxHeight: '80px',
  margin: space_sm,
  position: 'relative',
});

function sortResources(a: Project, b: Project): number {
  return (a.id || 0) - (b.id || 0);
}

interface ProjectModelSelectorProps {
  defaultSelection?: Project | null;
  onSelect: (value: Project | null) => void;
  whenDone?: () => void;
}

// TODO once needed : project filter / sort

export default function ProjectModelSelector({
  defaultSelection = null,
  onSelect,
  whenDone,
}: ProjectModelSelectorProps): JSX.Element {
  const i18n = useTranslations();
  const { projects, status } = useAndLoadMyAndInstanceableModels();

  const sortedProjects = (projects || []).sort(sortResources);

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <ItemThumbnailsSelection<Project>
        items={sortedProjects}
        addEmptyItem
        defaultSelectedValue={defaultSelection}
        onItemClick={item => {
          onSelect(item);
        }}
        onItemDblClick={item => {
          onSelect(item);

          if (whenDone) {
            whenDone();
          }
        }}
        fillThumbnail={item => {
          const isEmptyProject = item === null;
          return (
            <>
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
                      : item.illustration || { ...defaultProjectIllustration }
                  }
                />
              </Flex>

              <div className={css({ padding: '10px' })}>
                <h3 className={css({ marginTop: space_sm })}>
                  {!isEmptyProject
                    ? item.name
                      ? item.name
                      : i18n.modules.project.actions.newProject
                    : i18n.modules.project.info.emptyProject}
                </h3>
                <p className={cx(text_sm, lightTextStyle, multiLineEllipsisStyle)}>
                  {!isEmptyProject
                    ? item.description
                      ? item.description
                      : i18n.common.noDescription
                    : i18n.modules.project.info.useBlankProject}
                </p>
              </div>

              {item?.type === 'MODEL' && (
                <Flex
                  align="center"
                  justify="center"
                  className={cx(modelPictoCornerStyle)}
                  title={i18n.modules.project.info.isAModel}
                >
                  {item.globalProject ? (
                     <Icon icon={'public'} opsz="xs" />
                  ) : (
                     <Icon icon={'star'} opsz="xs" />
                  )}
                </Flex>
              )}
            </>
          );
        }}
        thumbnailClassName={projectThumbnailStyle}
      />
    );
  }
}
