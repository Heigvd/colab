/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { cx } from '@emotion/css';
import { Project } from 'colab-rest-client';
import * as React from 'react';
import { useAndLoadProjectModels } from '../../selectors/projectSelector';
import AvailabilityStatusIndicator from '../common/AvailabilityStatusIndicator';
import Flex from '../common/Flex';
import ItemThumbnailsSelection from '../common/ItemThumbnailsSelection';
import { workInProgressStyle } from '../styling/style';

const selectedStyle = workInProgressStyle;

interface ProjectModelSelectorProps {
  defaultSelection?: Project | null;
  onSelect: (value: Project | null) => void;
  whenDone?: () => void;
}

// TODO UI

// TODO project filter

// TODO see if a project model has a "picture" / icon + color

export default function ProjectModelSelector({
  defaultSelection = null,
  onSelect,
  whenDone,
}: ProjectModelSelectorProps): JSX.Element {
  const { projects, status } = useAndLoadProjectModels();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <ItemThumbnailsSelection<Project>
        items={projects}
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
        fillThumbnail={(item, highlighted) => (
          <Flex direction="column" className={cx(highlighted && selectedStyle)}>
            {item ? (
              <>
                <Flex>{item.name}</Flex>
                <Flex>{item.description}</Flex>
              </>
            ) : (
              <>
                <Flex>Empty project</Flex>
                <Flex>Free to create a whole new world</Flex>
              </>
            )}
          </Flex>
        )}
      />
    );
  }
}
