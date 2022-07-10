/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import { useAndLoadProjectModels } from '../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import ItemThumbnailsSelection from '../common/ItemThumbnailsSelection';
import Flex from '../common/layout/Flex';
import { lightText, multiLineEllipsis, space_S, textSmall } from '../styling/style';

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
              {/* TODO <div className={css({backgroundColor: item?.color})}> */}
              <Flex
                align="center"
                justify="center"
                className={css({ backgroundColor: 'var(--secondaryColor)', minWidth: '70px' })}
              >
                {/* TODO <FontAwesomeIcon icon={isEmptyProject ? faFile : item?.icon || faGamepad} /> */}
                <FontAwesomeIcon
                  color="white"
                  icon={isEmptyProject ? faFile : faGamepad}
                  size="2x"
                />
              </Flex>
              <div className={css({ padding: '10px' })}>
                <h3 className={css({ marginTop: space_S })}>
                  {!isEmptyProject ? (item.name ? item.name : 'New project') : 'Empty project'}
                </h3>
                <p className={cx(textSmall, lightText, multiLineEllipsis)}>
                  {!isEmptyProject
                    ? item.description
                      ? item.description
                      : 'No description'
                    : "Use this empty project and you'll be free to create a whole new world"}
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
