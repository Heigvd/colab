/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import PublicEntranceContainer from '../../authentication/PublicEntranceContainer';
import Flex from '../../common/layout/Flex';

export default function NewModelShared(): JSX.Element {
  // const i18n = useTranslations();
  // const navigate = useNavigate();

  return (
    <PublicEntranceContainer>
      <Flex direction="column">
        <h3>a new model is shared to you ! </h3>
      </Flex>
    </PublicEntranceContainer>
  );
}
