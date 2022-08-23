/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowLeft, faPaperclip, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import { ReflexContainer, ReflexElement } from 'react-reflex';
import { useNavigate, useParams } from 'react-router-dom';
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
import Button from '../../common/element/Button';
import IconButton from '../../common/element/IconButton';
import { DiscreetInput, LabeledTextArea } from '../../common/element/Input';
import Tips from '../../common/element/Tips';
import Toggler from '../../common/element/Toggler';
import ConfirmDeleteModal from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import { DocTextWrapper } from '../../documents/DocTextItem';
import { ResourceCallContext } from '../../resources/resourcesCommonType';
import ResourcesMainView from '../../resources/ResourcesMainView';
import { ResourceListNb } from '../../resources/summary/ResourcesListSummary';
import {
  cardStyle,
  errorColor,
  localTitleStyle,
  space_M,
  space_S,
  textSmall,
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

  const resourceContext: ResourceCallContext = {
    kind: 'CardType',
    cardTypeId: cardType?.ownId,
    // TODO remove access
    accessLevel: 'WRITE',
  };

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
                  <DiscreetInput
                    value={cardType.title || ''}
                    placeholder={i18n.modules.cardType.cardType}
                    onChange={newValue =>
                      dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                    }
                    inputDisplayClassName={localTitleStyle}
                  />
                </Flex>
                <Flex direction="column" grow={1} align="stretch">
                  <Flex
                    className={css({ margin: space_M + ' 0' })}
                    direction="column"
                    align="stretch"
                  >
                    <DocTextWrapper id={cardType.purposeId}>
                      {text => (
                        <LabeledTextArea
                          label={i18n.modules.cardType.purpose}
                          value={text || ''}
                          placeholder={i18n.modules.cardType.explainPurpose}
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
                        if (tagsOptions.length > 0) {
                          dispatch(
                            API.updateCardTypeTags({
                              ...cardType,
                              tags: tagsOptions.map(o => o.value),
                            }),
                          );
                        }
                      }}
                    />
                  </Flex>
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
                  <Toggler
                    value={cardType.deprecated || undefined}
                    label={i18n.common.deprecated}
                    tip={i18n.modules.cardType.infos.infoDeprecated}
                    onChange={() =>
                      dispatch(
                        API.updateCardTypeDeprecated({
                          ...cardType,
                          deprecated: !cardType.deprecated,
                        }),
                      )
                    }
                  />
                  <ConfirmDeleteModal
                    buttonLabel={
                      <Button
                        invertedButton
                        className={cx(css({ color: errorColor, borderColor: errorColor }))}
                        clickable
                      >
                        <FontAwesomeIcon icon={faTrash} /> {i18n.modules.cardType.deleteType}
                      </Button>
                    }
                    className={css({
                      '&:hover': { textDecoration: 'none' },
                      display: 'flex',
                      alignItems: 'center',
                    })}
                    message={
                      <p>
                        <Tips tipsType="TODO">
                          Make test if type is used in card(s). Disable or hide this delete option
                          if used.
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
                </Flex>
              </Flex>
            </ReflexElement>
            <ReflexElement
              className={'right-pane ' + css({ display: 'flex', minWidth: '50%' })}
              resizeHeight={false}
              resizeWidth={false}
              maxSize={50}
            >
              <SideCollapsiblePanel
                direction="RIGHT"
                openKey={'resources'}
                items={{
                  resources: {
                    icon: faPaperclip,
                    nextToIconElement: (
                      <div className={textSmall}>
                        {' '}
                        (<ResourceListNb context={resourceContext} />)
                      </div>
                    ),
                    title: i18n.modules.resource.documentation,
                    children: (
                      <ResourcesMainView
                        contextData={resourceContext}
                        //accessLevel={ userAcl.write ? 'WRITE' : userAcl.read ? 'READ' : 'DENIED'}
                        // TODO manage the user rights for editing resources
                        // TODO work in progress
                        accessLevel="WRITE"
                      />
                    ),
                  },
                }}
                defaultOpenKey={'resources'}
                className={css({ flexGrow: 1 })}
                cannotClose
              />
            </ReflexElement>
          </ReflexContainer>
        </Flex>
      </Flex>
    );
  }
}
