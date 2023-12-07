/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import { useVersionDetails } from '../../store/selectors/configSelector';
import Button from '../common/element/Button';
import InlineLoading from '../common/element/InlineLoading';

export default function MainPanel(): JSX.Element {
  const version = useVersionDetails();
  const dispatch = useAppDispatch();

  const sync = React.useCallback(() => {
    dispatch(API.getVersionDetails());
  }, [dispatch]);

  return (
    <div>
      <h3>co.LAB version</h3>
      <div>
        {version === 'LOADING' ? (
          <InlineLoading />
        ) : (
          <span>
            {version.dockerImages ? version.dockerImages : 'Dev'} (build #
            {version.buildNumber ? version.buildNumber : 'ninja'})
            <Button icon={'sync'} onClick={sync} />
          </span>
        )}
      </div>
    </div>
  );
}
