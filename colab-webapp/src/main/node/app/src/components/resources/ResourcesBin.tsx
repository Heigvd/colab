/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import { useAndLoadResources } from '../../store/selectors/resourceSelector';
import {
  deleteForeverDefaultIcon,
  dropDownMenuDefaultIcon,
  restoreFromBinDefaultIcon,
  viewDetailDefaultIcon,
} from '../../styling/IconDefault';
import {
  binDateColumnStyle,
  binDropDownMenuButtonStyle,
  binDropDownMenuStyle,
  binNameColumnStyle,
  binTBodyStyle,
  binTableStyle,
  p_3xl,
  space_xl,
} from '../../styling/style';
import DropDownMenu from '../common/layout/DropDownMenu';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import Modal from '../common/layout/Modal';
import { ResourceDisplay } from './ResourceDisplay';
import { ResourceTitle } from './ResourceTitle';
import { ResourcesCtx } from './ResourcesMainView';
import { ResourceAndRef } from './resourcesCommonType';

// TODO : see if scroll can be only on tbody
// TODO : opaque color on header

// TODO : "Empty bin" action

export default function ResourcesBin(): JSX.Element {
  const i18n = useTranslations();

  const { resourceOwnership } = React.useContext(ResourcesCtx);

  const { ghostResources: resources } = useAndLoadResources(resourceOwnership);

  if (resources.length == 0) {
    return (
      <Flex justify="center" className={p_3xl}>
        {i18n.common.bin.info.isEmpty}
      </Flex>
    );
  }

  return (
    <Flex direction="column" className={css({ padding: space_xl })}>
      {/* align="stretch" */}
      <table className={binTableStyle}>
        <thead>
          <tr>
            <th className={binNameColumnStyle}>{i18n.common.bin.name}</th>
            <th className={binDateColumnStyle}>{i18n.common.bin.dateBinned}</th>
            <th></th>
          </tr>
        </thead>
        <tbody className={binTBodyStyle}>
          {resources.map(resource => (
            <ResourceBinRow key={resource.targetResource.id} resourceAndRef={resource} />
          ))}
        </tbody>
      </table>
    </Flex>
  );
}

function ResourceBinRow({ resourceAndRef }: { resourceAndRef: ResourceAndRef }): JSX.Element {
  const i18n = useTranslations();

  const resource = React.useMemo(() => {
    return resourceAndRef.targetResource;
  }, [resourceAndRef]);

  return (
    <tr>
      <td>
        <ResourceTitle resource={resource} />
      </td>
      <td>
        {/* for the moment, the resource is not really erased, so we use the modificationTime. 
        TODO : change when standardised */}
        {resource.trackingData?.modificationTime != null
          ? i18n.common.dateFn(resource.trackingData.modificationTime)
          : ''}
      </td>
      <td>
        <Flex justify="flex-end">
          <BinDropDownMenu resourceAndRef={resourceAndRef} />
        </Flex>
      </td>
    </tr>
  );
}

function BinDropDownMenu({ resourceAndRef }: { resourceAndRef: ResourceAndRef }): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const [showModal, setShowModal] = React.useState<'' | 'deletedResource'>('');

  const closeModal = React.useCallback(() => {
    setShowModal('');
  }, [setShowModal]);

  const showDeletedResourceModal = React.useCallback(() => {
    setShowModal('deletedResource');
  }, [setShowModal]);

  return (
    <>
      {showModal === 'deletedResource' && (
        <Modal
          title={i18n.common.bin.deleted.resource}
          showCloseButton
          onClose={closeModal}
          size="full"
        >
          {_collapse => <ResourceDisplay resource={resourceAndRef} readOnly />}
        </Modal>
      )}
      <DropDownMenu
        icon={dropDownMenuDefaultIcon}
        className={binDropDownMenuStyle}
        buttonClassName={binDropDownMenuButtonStyle}
        entries={[
          {
            value: 'view',
            label: (
              <>
                <Icon icon={viewDetailDefaultIcon} /> {i18n.common.bin.action.view}
              </>
            ),
            action: () => {
              showDeletedResourceModal();
            },
          },
          {
            value: 'restore',
            label: (
              <>
                <Icon icon={restoreFromBinDefaultIcon} /> {i18n.common.bin.action.restore}
              </>
            ),
            action: () => {
              dispatch(API.giveAccessToResource(resourceAndRef));
            },
          },
          ...(resourceAndRef.isDirectResource
            ? [
                {
                  value: 'deleteForever',
                  label: (
                    <>
                      <Icon icon={deleteForeverDefaultIcon} />{' '}
                      {i18n.common.bin.action.deleteForever}
                    </>
                  ),
                  action: () => {
                    dispatch(API.deleteResource(resourceAndRef.targetResource));
                  },
                },
              ]
            : []),
        ]}
      />
    </>
  );
}
