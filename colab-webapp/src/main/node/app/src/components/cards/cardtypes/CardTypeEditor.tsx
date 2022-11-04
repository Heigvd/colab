/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faArrowLeft, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
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
import ConfirmDeleteOpenCloseModal from '../../common/layout/ConfirmDeleteModal';
import Flex from '../../common/layout/Flex';
import { DocTextWrapper } from '../../documents/DocTextItem';
import { ResourceAndRef, ResourceOwnership } from '../../resources/resourcesCommonType';
import {
  ResourcesCtx,
  ResourcesMainViewHeader,
  ResourcesMainViewPanel,
} from '../../resources/ResourcesMainView';
import { cardStyle, errorColor, localTitleStyle, space_M, space_S } from '../../styling/style';

interface CardTypeEditorProps {
  className?: string;
  usage: 'currentProject' | 'global';
}

export default function CardTypeEditor({ className, usage }: CardTypeEditorProps): JSX.Element {
  const navigate = useNavigate();
  const i18n = useTranslations();

  const id = useParams<'id'>();
  const typeId = +id.id!;

  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);

  const { cardType, status } = useAndLoadCardType(typeId);
  const { project } = useProjectBeingEdited();

  const allCurrentProjectTags = useCurrentProjectCardTypeTags();
  const allGlobalTags = useGlobalCardTypeTags();
  const options = (usage === 'currentProject' ? allCurrentProjectTags : allGlobalTags).map(tag => ({
    label: tag,
    value: tag,
  }));

  const resourceOwnership: ResourceOwnership = {
    kind: 'CardType',
    cardTypeId: cardType?.ownId,
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
          title={i18n.modules.cardType.route.backToCardType}
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
                placeholder={i18n.modules.cardType.titlePlaceholder}
                onChange={newValue =>
                  dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                }
                inputDisplayClassName={localTitleStyle}
              />
            </Flex>
            <Flex direction="column" grow={1} align="stretch">
              <Flex className={css({ margin: space_M + ' 0' })} direction="column" align="stretch">
                <DocTextWrapper id={cardType.purposeId}>
                  {text => (
                    <LabeledTextArea
                      label={i18n.modules.cardType.purpose}
                      value={text || ''}
                      placeholder={i18n.modules.cardType.info.explainPurpose}
                      onChange={(newValue: string) => {
                        if (cardType.purposeId) {
                          dispatch(
                            updateDocumentText({
                              id: cardType.purposeId,
                              textData: newValue,
                            }),
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
                  value={cardType.tags.map((tag: string) => ({ label: tag, value: tag }))}
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
                tip={i18n.modules.cardType.info.infoPublished(usage === 'currentProject')}
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
                tip={i18n.modules.cardType.info.infoDeprecated}
                onChange={() =>
                  dispatch(
                    API.updateCardTypeDeprecated({
                      ...cardType,
                      deprecated: !cardType.deprecated,
                    }),
                  )
                }
              />
              <ConfirmDeleteOpenCloseModal
                title={i18n.modules.cardType.action.deleteType}
                buttonLabel={
                  <Button
                    invertedButton
                    className={cx(css({ color: errorColor, borderColor: errorColor }))}
                    clickable
                  >
                    <FontAwesomeIcon icon={faTrash} /> {i18n.common.delete}
                  </Button>
                }
                className={css({
                  '&:hover': { textDecoration: 'none' },
                  display: 'flex',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                })}
                message={
                  <p>
                    <Tips tipsType="TODO">
                      Make test if theme is used in card(s). Disable or hide this delete option if
                      used.
                    </Tips>
                    {i18n.modules.cardType.action.confirmDeleteType}
                  </p>
                }
                onConfirm={() => {
                  if (project && cardType.kind === 'own') {
                    dispatch(API.deleteCardType(cardType));
                    navigate('../');
                  }
                }}
                confirmButtonLabel={i18n.modules.cardType.action.deleteType}
              />
            </Flex>
          </Flex>
          <Flex
            direction="column"
            align="stretch"
            className={css({
              borderLeft: '1px solid var(--lightGray)',
              width: '50%',
              padding: space_S,
            })}
          >
            <ResourcesCtx.Provider value={{ resourceOwnership, selectedResource, selectResource }}>
              <Flex align="baseline">
                <ResourcesMainViewHeader
                  title={<h3>{i18n.modules.resource.documentation}</h3>}
                  helpTip={i18n.modules.resource.help.documentationExplanation}
                />
              </Flex>
              <ResourcesMainViewPanel accessLevel="WRITE" />
            </ResourcesCtx.Provider>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
