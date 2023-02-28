/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResources } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import IconButton from '../common/element/IconButton';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { iconButtonStyle, lightIconButtonStyle, space_lg, space_sm } from '../styling/style';
import { ResourceDisplay } from './ResourceDisplay';
import { ResourceAndRef } from './resourcesCommonType';
import ResourcesList from './ResourcesList';
import { ResourcesCtx } from './ResourcesMainView';

interface HidenResourcesKeeperProps {
  collapsedClassName?: string;
}

export default function HidenResourcesKeeper({
  collapsedClassName,
}: HidenResourcesKeeperProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { resourceOwnership } = React.useContext(ResourcesCtx);

  const { ghostResources: resources } = useAndLoadResources(resourceOwnership);

  const displayResourceItem = React.useCallback(
    (resource: ResourceAndRef) => (
      <Flex
        align="center"
        justify="space-between"
        className={css({
          flexGrow: 1,
          padding: space_sm + ' ' + space_lg,
          '&:hover': { cursor: 'default' },
        })}
      >
        {resource.targetResource.title}
        <Flex>
          <IconButton
            title={i18n.common.restore}
            icon={'archive'}
            onClick={() => dispatch(API.giveAccessToResource(resource))}
            className={cx(lightIconButtonStyle)}
            iconClassName={iconButtonStyle}
          />
          <OpenCloseModal
            title={i18n.modules.content.document}
            collapsedChildren={
              <Icon
                title={i18n.common.display}
                icon={'visibility'}
                className={cx(iconButtonStyle, lightIconButtonStyle)}
              />
            }
            className={css({ padding: '0 ' + space_sm })}
            modalBodyClassName={css({ alignItems: 'stretch' })}
            widthMax
            heightMax
          >
            {close => {
              return <ResourceDisplay resource={resource} goBackToList={close} readOnly />;
            }}
          </OpenCloseModal>
          {resource.isDirectResource ? (
            <Flex
              className={css({
                borderLeft: '1px solid var(--divider-main)',
                margin: '0 ' + space_sm,
              })}
              wrap="nowrap"
            >
              <IconButton
                title={i18n.common.finalDelete}
                icon={'delete'}
                iconColor={'var(--error-main)'}
                onClick={() => dispatch(API.deleteResource(resource.targetResource))}
                className={lightIconButtonStyle}
                iconClassName={iconButtonStyle}
              />
            </Flex>
          ) : (
            // a way to have space and not all icons shifted if no deletion possible
            // I'm not proud of it, but it works
            <div className={css({ minWidth: '45px' })}>&nbsp;</div>
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
        resources != null && resources.length > 0 ? (
          <Flex justify="center" align="center" className={collapsedClassName}>
            {/* <span className={css({ marginRight: space_S, fontSize: '0.8em' })}>
              {resources.length}
            </span> */}
            <Icon title={i18n.modules.content.removedDocuments} icon={'inventory_2'} opsz='xs' />
          </Flex>
        ) : (
          <></>
        )
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
