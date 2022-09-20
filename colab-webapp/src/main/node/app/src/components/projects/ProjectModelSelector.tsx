/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadProjectModels } from '../../selectors/projectSelector';
import ItemThumbnailsSelection from '../common/collection/ItemThumbnailsSelection';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import IllustrationDisplay from '../common/element/IllustrationDisplay';
import Flex from '../common/layout/Flex';
import { lightText, multiLineEllipsis, space_S, textSmall } from '../styling/style';
import { defaultProjectIllustration } from './ProjectCommon';

const projectThumbnailStyle = css({
  padding: 0,
  width: `calc(50% - 8px - 2*${space_S})`,
  minHeight: '80px',
  maxHeight: '80px',
  margin: space_S,
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
  const { projects, status } = useAndLoadProjectModels();

  const sortedProjects = projects.sort(sortResources);

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
                          iconBkgdColor: '#68A8C3',
                        }
                      : item.illustration || { ...defaultProjectIllustration }
                  }
                />
              </Flex>

              <div className={css({ padding: '10px' })}>
                <h3 className={css({ marginTop: space_S })}>
                  {!isEmptyProject
                    ? item.name
                      ? item.name
                      : i18n.modules.project.actions.newProject
                    : i18n.modules.project.info.emptyProject}
                </h3>
                <p className={cx(textSmall, lightText, multiLineEllipsis)}>
                  {!isEmptyProject
                    ? item.description
                      ? item.description
                      : i18n.common.noDescription
                    : i18n.modules.project.info.useBlankProject}
                </p>
              </div>
            </>
          );
        }}
        thumbnailClassName={projectThumbnailStyle}
      />
    );
  }
}
