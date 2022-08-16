/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faFlask, faGhost } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_S } from '../styling/style';
import { ResourceDisplay } from './ResourceDisplay';
import { ResourceAndRef } from './resourcesCommonType';
import ResourcesList from './ResourcesList';

// TODO nice display

interface ResourcesLoserKeeperProps {
  resources: ResourceAndRef[];
  collapsedClassName?: string;
}

export default function ResourcesLoserKeeper({
  resources,
  collapsedClassName,
}: ResourcesLoserKeeperProps): JSX.Element {
  const dispatch = useAppDispatch();

  const displayResourceItem = React.useCallback(
    (resource: ResourceAndRef) => (
      <Flex align="center">
        {resource.targetResource.title}
        <OpenCloseModal
          title="Document"
          collapsedChildren={<FontAwesomeIcon title="Display the document" icon={faEye} />}
          className={css({ padding: '0 ' + space_S })}
          widthMax
          heightMax
        >
          {close => {
            return <ResourceDisplay resource={resource} goBackToList={close} readOnly />;
          }}
        </OpenCloseModal>
        <IconButton
          title="Restore the document"
          icon={faFlask}
          onClick={() => dispatch(API.giveAccessToResource(resource))}
        />
      </Flex>
    ),
    [dispatch],
  );

  return (
    <OpenCloseModal
      title="Deserted documents"
      showCloseButton
      collapsedChildren={
        <Flex justify="center" className={collapsedClassName}>
          <span>{resources.length}</span>
          <FontAwesomeIcon title="Deserted documents" icon={faGhost} />
        </Flex>
      }
      // tip={
      //   <Flex direction="column">
      //     <p>Here are hidden the deleted documents.</p>
      //     <p>You can look over them and restore what you need.</p>
      //   </Flex>
      // }
    >
      {_collapse => (
        <ResourcesList resources={resources} displayResourceItem={displayResourceItem} />
      )}
    </OpenCloseModal>
  );
}
