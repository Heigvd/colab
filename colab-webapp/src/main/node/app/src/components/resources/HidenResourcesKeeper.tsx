/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faEye } from '@fortawesome/free-regular-svg-icons';
import { faArrowUp, faBoxArchive, faGhost, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { iconButton, lightIconButtonStyle, space_M, space_S } from '../styling/style';
import { ResourceDisplay } from './ResourceDisplay';
import { ResourceAndRef } from './resourcesCommonType';
import ResourcesList from './ResourcesList';

interface ResourcesLoserKeeperProps {
  resources: ResourceAndRef[];
  collapsedClassName?: string;
}

export default function ResourcesLoserKeeper({
  resources,
  collapsedClassName,
}: ResourcesLoserKeeperProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();

  const displayResourceItem = React.useCallback(
    (resource: ResourceAndRef) => (
      <Flex
        align="center"
        justify="space-between"
        className={css({
          flexGrow: 1,
          padding: space_S + ' ' + space_M,
          '&:hover': { cursor: 'default' },
        })}
      >
        {resource.targetResource.title}
        <Flex>
          <OpenCloseModal
            title={i18n.modules.content.document}
            collapsedChildren={
              <FontAwesomeIcon
                title={i18n.common.display}
                icon={faEye}
                className={cx(iconButton, lightIconButtonStyle)}
              />
            }
            className={css({ padding: '0 ' + space_S })}
            modalBodyClassName={css({ alignItems: 'stretch' })}
            widthMax
            heightMax
          >
            {close => {
              return <ResourceDisplay resource={resource} goBackToList={close} readOnly />;
            }}
          </OpenCloseModal>
          <IconButton
            title={i18n.common.restore}
            icon={faBoxArchive}
            layer={{ layerIcon: faArrowUp, transform: 'shrink-6 up-10' }}
            onClick={() => dispatch(API.giveAccessToResource(resource))}
            className={cx(lightIconButtonStyle)}
            IconClassName={iconButton}
          />
          {resource.isDirectResource ? (
            <IconButton
              title={i18n.common.finalDelete}
              icon={faTrash}
              onClick={() => dispatch(API.deleteResource(resource.targetResource))}
              className={lightIconButtonStyle}
              IconClassName={iconButton}
            />
          ) : (
            // a way to have space and not all icons shifted if no deletion possible
            // I'm not proud of it, but it works
            <div className={css({ minWidth: '34px' })}>&nbsp;</div>
          )}
        </Flex>
      </Flex>
    ),
    [
      dispatch,
      i18n.common.display,
      i18n.common.finalDelete,
      i18n.common.restore,
      i18n.modules.content.document,
    ],
  );

  return (
    <OpenCloseModal
      title={i18n.modules.content.removedDocuments}
      showCloseButton
      collapsedChildren={
        <Flex justify="center" align="center" className={collapsedClassName}>
          <span className={css({ marginRight: space_S, fontSize: '0.8em' })}>
            {resources.length}
          </span>
          <FontAwesomeIcon title={i18n.modules.content.removedDocuments} icon={faGhost} />
        </Flex>
      }
      className={css({ '&:hover': { textDecoration: 'none' } })}
      modalBodyClassName={css({ alignItems: 'stretch' })}
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
