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
import SelectionAmongItems from '../common/SelectionAmongItems';
import { workInProgressStyle } from '../styling/style';

const selectedStyle = workInProgressStyle;

interface ProjectModelSelectorProps {
  onSelect: (value: Project | null) => void;
}

// TODO UI

// TODO project filter

// TODO see if a project model has a "picture" / icon + color

// TODO would be nice if double click => next

export default function ProjectModelSelector({ onSelect }: ProjectModelSelectorProps): JSX.Element {
  const { projects, status } = useAndLoadProjectModels();

  if (status !== 'READY') {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <SelectionAmongItems<Project>
        items={projects}
        withEmptyItem
        onSelect={onSelect}
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
                <Flex>Everything is free to create a whole new world</Flex>
              </>
            )}
          </Flex>
        )}
      />
    );
  }
}
