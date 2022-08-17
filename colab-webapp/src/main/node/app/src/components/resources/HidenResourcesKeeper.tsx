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
import { lightIconButtonStyle, space_M, space_S } from '../styling/style';
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
      <Flex align="center" justify='space-between' className={css({flexGrow: 1, padding: space_S + ' ' + space_M, '&:hover':{cursor: 'default'}})}>
        {resource.targetResource.title}
        <div>
        <OpenCloseModal
          title="Document"
          collapsedChildren={<FontAwesomeIcon title="Display the document" icon={faEye} className={lightIconButtonStyle} />}
          className={css({ padding: '0 ' + space_S })}
          modalBodyClassName={css({alignItems: 'stretch'})}
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
          className={lightIconButtonStyle}
        />
        </div>
      </Flex>
    ),
    [dispatch],
  );

  return (
    <OpenCloseModal
      title="Removed documents"
      showCloseButton
      collapsedChildren={
        <Flex justify="center" align='center' className={collapsedClassName}>
          <span className={css({marginRight: space_S, fontSize: '0.8em'})}>{resources.length}</span>
          <FontAwesomeIcon title="Deserted documents" icon={faGhost} />
        </Flex>
      }
      className={css({'&:hover':{textDecoration: 'none'}})}
      modalBodyClassName={css({alignItems: 'stretch'})}
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
