/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../../API/api';
import { checkUnreachable } from '../../../helper';
import useTranslations from '../../../i18n/I18nContext';
import { useAllProjectCardTypes } from '../../../selectors/cardSelector';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import { CardTypeAllInOne as CardType } from '../../../types/cardTypeDefinition';
import Button from '../../common/element/Button';
import { ConfirmDeleteModal } from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Icon from '../../common/layout/Icon';
import Modal from '../../common/layout/Modal';
import { DocTextDisplay } from '../../documents/DocTextItem';
import {
  borderRadius,
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  multiLineEllipsis,
  oneLineEllipsis,
  space_M,
  space_S,
  textSmall,
} from '../../styling/style';
import CardTypeRelativesSummary from './summary/CardTypeRelativesSummary';
import TargetCardTypeSummary from './summary/TargetCardTypeSummary';
import { TagsDisplay } from './tags/TagsDisplay';

const tagStyle = css({
  borderRadius: borderRadius,
  padding: '3px ' + space_S,
  marginRight: space_S,
  border: '1px solid var(--darkGray)',
  color: 'var(--darkGray)',
  fontSize: '0.8em',
  whiteSpace: 'nowrap',
});

interface CardTypeThumbnailProps {
  cardType?: CardType | null;
  editable?: boolean;
  usage: 'currentProject' | 'available' | 'global';
}

// TODO : make functional Flex/div

type ModalType = 'DELETE' | 'REF_USED' | 'TYPE_USED';

export default function CardTypeThumbnail({
  cardType,
  editable = false,
  usage,
}: CardTypeThumbnailProps): JSX.Element {
  const isEmpty = cardType == null;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();
  const currentProjectId = useCurrentProjectId();
  const cardTypesId = useAllProjectCardTypes();
  const isUsedInProject = (cardTypeID?: number | null) => {
    if (cardTypeID) {
      return cardTypesId.includes(cardTypeID);
    }
  };
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const [showModal, setShowModal] = React.useState<ModalType | undefined>();

  return (
    <>
      {isEmpty ? (
        <Flex title={i18n.common.none} align="center" justify="center" grow={1}>
           <Icon icon={'draft'} opsz="lg" />
          <div className={css({ paddingLeft: space_M })}>
            <h3>{i18n.common.none}</h3>
          </div>
        </Flex>
      ) : (
        <Flex direction="column" align="stretch" grow={1}>
          <Flex justify="space-between">
            <Flex direction="column" grow={1} align="stretch">
              <Flex justify={editable ? 'flex-start' : 'space-between'} align="center">
                <TargetCardTypeSummary cardType={cardType} />
                <h3 className={oneLineEllipsis}>
                  {cardType.title || i18n.modules.cardType.titlePlaceholder}
                </h3>
                <div
                  className={cx(
                    lightItalicText,
                    textSmall,
                    css({ whiteSpace: 'nowrap', marginLeft: space_M }),
                  )}
                >
                  <CardTypeRelativesSummary cardType={cardType} />
                </div>
              </Flex>
              <p
                className={cx(
                  lightItalicText,
                  textSmall,
                  multiLineEllipsis,
                  css({ maxWidth: '100%' }),
                )}
              >
                <DocTextDisplay id={cardType.purposeId} />
              </p>
            </Flex>
            {editable && (
              <DropDownMenu
                icon={'more_vert'}
                valueComp={{ value: '', label: '' }}
                buttonClassName={cx(lightIconButtonStyle)}
                entries={[
                  ...((usage === 'currentProject' && cardType.projectId === currentProjectId) ||
                  usage === 'global'
                    ? [
                        {
                          value: 'edit',
                          label: (
                            <>
                              <Icon icon={'edit'} /> {i18n.common.edit}
                            </>
                          ),
                          action: () => navigate(`./edit/${cardType.ownId}`),
                        },
                      ]
                    : []),
                  ...(usage === 'available' &&
                  currentProjectId &&
                  cardType.projectId !== currentProjectId
                    ? [
                        {
                          value: 'useInProject',
                          label: (
                            <>
                               <Icon icon={'location_on'} />{' '}
                              {i18n.modules.cardType.action.useInProject}
                            </>
                          ),
                          action: () =>
                            dispatch(
                              API.addCardTypeToProject({ cardType, projectId: currentProjectId }),
                            ),
                        },
                      ]
                    : []),
                  .../*!readOnly &&*/
                  (usage === 'currentProject' &&
                  currentProjectId &&
                  cardType.projectId === currentProjectId &&
                  cardType.kind === 'referenced'
                    ? [
                        {
                          label: (
                            <>
                               <Icon color={errorColor} icon={'remove'} />{' '}
                              {i18n.modules.cardType.action.removeFromProject}
                            </>
                          ),
                          value: 'refUsed',
                          action: isUsedInProject(cardType.id)
                            ? () => {
                                setShowModal('REF_USED');
                              }
                            : () =>
                                dispatch(
                                  API.removeCardTypeRefFromProject({
                                    cardType,
                                    projectId: currentProjectId,
                                  }),
                                ),
                        },
                      ]
                    : []),
                  .../*!readOnly &&*/
                  (cardType.kind === 'own' &&
                  ((usage === 'currentProject' && cardType.projectId === currentProjectId) ||
                    usage === 'global')
                    ? [
                        {
                          label: (
                            <>
                               <Icon color={errorColor} icon={'remove'} />{' '}
                              {i18n.common.delete}
                            </>
                          ),
                          value: 'typeUsed',
                          action: isUsedInProject(cardType.id)
                            ? () => {
                                setShowModal('TYPE_USED');
                              }
                            : () => {
                                setShowModal('DELETE');
                              },
                        },
                      ]
                    : []),
                ]}
              />
            )}
          </Flex>
          {showModal != undefined &&
            (() => {
              switch (showModal) {
                case 'REF_USED':
                  return (
                    <Modal
                      title={i18n.modules.cardType.info.cannotRemoveCardType}
                      onClose={() => setShowModal(undefined)}
                      footer={collapse => (
                        <Flex
                          justify={'center'}
                          grow={1}
                          className={css({ padding: space_M, columnGap: space_S })}
                        >
                          <Button onClick={collapse}> {i18n.common.ok}</Button>
                        </Flex>
                      )}
                    >
                      {() => <div>{i18n.modules.cardType.info.cannotRemoveFromProject}</div>}
                    </Modal>
                  );
                case 'TYPE_USED':
                  return (
                    <Modal
                      title={i18n.modules.cardType.action.deleteType}
                      onClose={() => setShowModal(undefined)}
                      footer={collapse => (
                        <Flex
                          justify={'center'}
                          grow={1}
                          className={css({ padding: space_M, columnGap: space_S })}
                        >
                          <Button onClick={collapse}> {i18n.common.ok}</Button>
                        </Flex>
                      )}
                    >
                      {() => <div>{i18n.modules.cardType.info.cannotDeleteType}</div>}
                    </Modal>
                  );
                case 'DELETE':
                  if (cardType.kind === 'own') {
                    return (
                      <ConfirmDeleteModal
                        title={i18n.modules.cardType.action.deleteType}
                        onCancel={() => setShowModal(undefined)}
                        message={<p>{i18n.modules.cardType.action.confirmDeleteType}</p>}
                        onConfirm={() => {
                          startLoading();
                          dispatch(API.deleteCardType(cardType)).then(stopLoading);
                        }}
                        confirmButtonLabel={i18n.modules.cardType.action.deleteType}
                        isConfirmButtonLoading={isLoading}
                      />
                    );
                  } else {
                    // impossible case
                    return <></>;
                  }
                default:
                  checkUnreachable(showModal);
              }
            })()}
          <TagsDisplay tags={cardType.tags} className={tagStyle} />
        </Flex>
      )}
    </>
  );
}
