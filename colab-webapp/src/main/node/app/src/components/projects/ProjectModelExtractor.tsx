/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import Tips, { WIPContainer } from '../common/element/Tips';
import Flex from '../common/layout/Flex';

interface ProjectModelExtractorProps {
  projectId: number | null | undefined;
}

export function ProjectModelExtractor({ projectId }: ProjectModelExtractorProps): JSX.Element {
  return (
    <WIPContainer>
      <Tips tipsType="TODO">voir où mettre le nom du projet initial</Tips>
      <Flex>From here we make models !</Flex>
    </WIPContainer>
  );
}
