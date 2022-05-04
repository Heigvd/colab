/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Project } from 'colab-rest-client';
import * as React from 'react';
import Flex from '../common/Flex';

interface ProjectModelThumbnailProps {
  projectModel: Project;
}

export default function ProjectModelThumbnail({
  projectModel,
}: ProjectModelThumbnailProps): JSX.Element {
  return (
    <Flex direction="column">
      <Flex>{projectModel.name}</Flex>
      <Flex>{projectModel.description}</Flex>
    </Flex>
  );
}
