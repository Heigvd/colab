/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import {
  faArrowLeft,
  faCog,
  faEllipsisV,
  faInfoCircle,
  faPaperclip,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import Creatable from 'react-select/creatable';
import * as API from '../../../API/api';
import { updateDocumentText } from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import {
  useAndLoadCardType,
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../../selectors/cardTypeSelector';
import { useProjectBeingEdited } from '../../../selectors/projectSelector';
import { dispatch } from '../../../store/store';
import AvailabilityStatusIndicator from '../../common/element/AvailabilityStatusIndicator';
import IconButton from '../../common/element/IconButton';
import { InlineInput } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import Toggler from '../../common/Form/Toggler';
import ConfirmDeleteModal from '../../common/layout/ConfirmDeleteModal';
import DropDownMenu, { modalEntryStyle } from '../../common/layout/DropDownMenu';
import Flex from '../../common/layout/Flex';
import Modal from '../../common/layout/Modal';
import { DocTextWrapper } from '../../documents/DocTextItem';
import ResourcesWrapper from '../../resources/ResourcesWrapper';
import {
  cardStyle,
  errorColor,
  lightIconButtonStyle,
  lightItalicText,
  localTitleStyle,
  space_M,
  space_S,
} from '../../styling/style';
import SideCollapsiblePanel from './../SideCollapsiblePanel';

interface CardTypeEditorProps {
  className?: string;
  usage: 'currentProject' | 'global';
}

export default function CardTypeEditor({ className, usage }: CardTypeEditorProps): JSX.Element {
  const navigate = useNavigate();
  const i18n = useTranslations();

  const id = useParams<'id'>();
  const typeId = +id.id!;

  const { cardType, status } = useAndLoadCardType(typeId);
  const { project } = useProjectBeingEdited();

  const allCurrentProjectTags = useCurrentProjectCardTypeTags();
  const allGlobalTags = useGlobalCardTypeTags();
  const options = (usage === 'currentProject' ? allCurrentProjectTags : allGlobalTags).map(tag => ({
    label: tag,
    value: tag,
  }));
  const [openKey, setOpenKey] = React.useState<string | undefined>(undefined);
  if (status !== 'READY' || !cardType) {
    return <AvailabilityStatusIndicator status={status} />;
  } else {
    return (
      <Flex
        direction="column"
        grow={1}
        align="stretch"
        className={cx(css({ alignSelf: 'stretch' }), className)}
      >
        <IconButton
          icon={faArrowLeft}
          title={'Back to card types'}
          iconColor="var(--darkGray)"
          onClick={() => navigate('../')}
          className={css({ display: 'block', marginBottom: space_M })}
        />
        <Flex
          grow={1}
          direction="row"
          justify="space-between"
          align="stretch"
          className={cx(
            cardStyle,
            css({
              backgroundColor: 'white',
            }),
          )}
        >
          <ReflexContainer orientation={'vertical'}>
            <ReflexElement
              className={'left-pane ' + css({ display: 'flex' })}
              resizeHeight={false}
              minSize={150}
            >
              <Flex
                direction="column"
                grow={1}
                className={css({
                  padding: '10px',
                  overflow: 'auto',
                })}
                align="stretch"
              >
                <Flex
                  justify="space-between"
                  className={css({
                    paddingBottom: space_S,
                    borderBottom: '1px solid var(--lightGray)',
                  })}
                >
                  <InlineInput
                    value={cardType.title || ''}
                    placeholder={i18n.modules.cardType.cardType}
                    autoWidth
                    saveMode="ON_CONFIRM"
                    onChange={newValue =>
                      dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                    }
                    inputDisplayClassName={localTitleStyle}
                  />
                  <Flex>
                    {/* handle modal routes*/}
                    <Routes>
                      <Route
                        path="settings"
                        element={
                          <Modal
                            title={i18n.modules.cardType.advancedTypeSettings}
                            onClose={() => navigate('./')}
                            showCloseButton
                          >
                            {() => (
                              <>
                                <Toggler
                                  value={cardType.deprecated || undefined}
                                  label= {i18n.common.deprecated}
                                  onChange={() =>
                                    dispatch(
                                      API.updateCardTypeDeprecated({
                                        ...cardType,
                                        deprecated: !cardType.deprecated,
                                      }),
                                    )
                                  }
                                />
                                <div className={lightItalicText}>
                                  <FontAwesomeIcon icon={faInfoCircle} />{i18n.modules.cardType.infos.infoDeprecated}
                                </div>
                              </>
                            )}
                          </Modal>
                        }
                      />
                    </Routes>
                    <DropDownMenu
                      icon={faEllipsisV}
                      valueComp={{ value: '', label: '' }}
                      buttonClassName={cx(lightIconButtonStyle, css({ marginLeft: space_S }))}
                      entries={[
                        {
                          value: 'settings',
                          label: (
                            <>
                              <FontAwesomeIcon icon={faCog} />{i18n.modules.cardType.typeSettings}
                            </>
                          ),
                          action: () => navigate('settings'),
                        },
                        {
                          value: 'Delete type',
                          label: (
                            <ConfirmDeleteModal
                              buttonLabel={
                                <div className={cx(css({ color: errorColor }), modalEntryStyle)}>
                                  <FontAwesomeIcon icon={faTrash} /> {i18n.modules.cardType.deleteType}
                                </div>
                              }
                              className={css({
                                '&:hover': { textDecoration: 'none' },
                                display: 'flex',
                                alignItems: 'center',
                              })}
                              message={
                                <p>
                                  <Tips tipsType="TODO">
                                    Make test if type is used in card(s). Disable or hide this
                                    delete option if used.
                                  </Tips>
                                  {i18n.modules.cardType.confirmDeleteType}
                                </p>
                              }
                              onConfirm={() => {
                                if (project && cardType.kind === 'own') {
                                  dispatch(API.deleteCardType(cardType));
                                  navigate('../');
                                }
                              }}
                              confirmButtonLabel={i18n.modules.cardType.deleteType}
                            />
                          ),
                          modal: true,
                        },
                      ]}
                    />
                  </Flex>
                </Flex>
                <Flex direction="column" grow={1} align="stretch">
                  <Flex
                    className={css({ margin: space_M + ' 0' })}
                    direction="column"
                    align="stretch"
                  >
                    <h3>{i18n.modules.cardType.purpose}: </h3>
                    <DocTextWrapper id={cardType.purposeId}>
                      {text => (
                        <InlineInput
                          value={text || ''}
                          placeholder={i18n.modules.cardType.explainPurpose}
                          inputType="textarea"
                          saveMode="ON_CONFIRM"
                          onChange={(newValue: string) => {
                            if (cardType.purposeId) {
                              dispatch(
                                updateDocumentText({ id: cardType.purposeId, textData: newValue }),
                              );
                            }
                          }}
                          rows={8}
                          inputDisplayClassName={css({ minWidth: '100%' })}
                        />
                      )}
                    </DocTextWrapper>
                  </Flex>
                  <Flex
                    direction="column"
                    align="stretch"
                    className={css({
                      alignSelf: 'flex-start',
                      minWidth: '40%',
                      margin: space_S + ' 0',
                    })}
                  >
                    <Creatable
                      isMulti={true}
                      value={cardType.tags.map(tag => ({ label: tag, value: tag }))}
                      options={options}
                      onChange={tagsOptions => {
                        if(tagsOptions.length > 0){
                        dispatch(
                          API.updateCardTypeTags({
                            ...cardType,
                            tags: tagsOptions.map(o => o.value),
                          }),
                        );} 
                      }}
                    />
                  </Flex>
                  <Flex>
                    <Toggler
                      value={cardType.published || undefined}
                      label={i18n.common.published}
                      tip={i18n.modules.cardType.infos.infoPublished}
                      onChange={() =>
                        dispatch(
                          API.updateCardTypePublished({
                            ...cardType,
                            published: !cardType.published,
                          }),
                        )
                      }
                    />
                  </Flex>
                </Flex>
              </Flex>
            </ReflexElement>
            {openKey && <ReflexSplitter />}
            <ReflexElement
              className={'right-pane ' + css({ display: 'flex', minWidth: 'min-content' })}
              resizeHeight={false}
              maxSize={openKey ? undefined : 40}
            >
              <SideCollapsiblePanel
                direction="RIGHT"
                openKey={openKey}
                setOpenKey={setOpenKey}
                items={{
                  resources: {
                    children: (
                      <>
                        {cardType.ownId && (
                          <ResourcesWrapper
                            kind={'CardType'}
                            //accessLevel={ userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'}
                            // TODO manage the user rights for editing resources
                            // TODO work in progress
                            accessLevel="WRITE"
                            cardTypeId={cardType.ownId}
                          />
                        )}
                      </>
                    ),
                    icon: faPaperclip,
                    title: i18n.modules.resource.documentation,
                  },
                }}
                defaultOpenKey={'resources'}
                className={css({flexGrow: 1})}
              />
            </ReflexElement>
          </ReflexContainer>
        </Flex>
      </Flex>
    );
  }
}
