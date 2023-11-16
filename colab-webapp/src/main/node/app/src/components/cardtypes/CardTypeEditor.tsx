/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Creatable from 'react-select/creatable';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAppDispatch } from '../../store/hooks';
import {
  useAndLoadCardType,
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../store/selectors/cardTypeSelector';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { cardStyle, space_lg, space_sm } from '../../styling/style';
import AvailabilityStatusIndicator from '../common/element/AvailabilityStatusIndicator';
import Button from '../common/element/Button';
import IconButton from '../common/element/IconButton';
import { DiscreetInput, LabeledTextArea } from '../common/element/Input';
import Tips from '../common/element/Tips';
import Toggler from '../common/element/Toggler';
import ConfirmDeleteOpenCloseModal from '../common/layout/ConfirmDeleteModal';
import Flex from '../common/layout/Flex';
import Icon from '../common/layout/Icon';
import { DocTextWrapper } from '../documents/DocTextItem';
import {
  DisplayMode,
  ResourcesCtx,
  ResourcesMainViewHeader,
  ResourcesMainViewPanel,
} from '../resources/ResourcesMainView';
import { ResourceAndRef, ResourceOwnership } from '../resources/resourcesCommonType';

interface CardTypeEditorProps {
  className?: string;
  usage: 'currentProject' | 'global';
}

export default function CardTypeEditor({ className, usage }: CardTypeEditorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const i18n = useTranslations();

  const id = useParams<'id'>();
  const typeId = +id.id!;

  const [resourcesDisplayMode, setResourcesDisplayMode] = React.useState<DisplayMode>('LIST');
  const [selectedResource, selectResource] = React.useState<ResourceAndRef | null>(null);
  const [lastCreatedResourceId, setLastCreatedResourceId] = React.useState<number | null>(null);

  const { cardType, status } = useAndLoadCardType(typeId);
  const currentProjectId = useCurrentProjectId();

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
          icon={'arrow_back'}
          title={i18n.modules.cardType.route.backToCardType}
          iconColor="var(--secondary-main)"
          onClick={() => navigate('../')}
          className={css({ display: 'block', marginBottom: space_lg })}
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
                paddingBottom: space_sm,
                borderBottom: '1px solid var(--divider-main)',
              })}
            >
              <DiscreetInput
                value={cardType.title || ''}
                placeholder={i18n.modules.cardType.titlePlaceholder}
                onChange={newValue =>
                  dispatch(API.updateCardTypeTitle({ ...cardType, title: newValue }))
                }
              />
            </Flex>
            <Flex direction="column" grow={1} align="stretch">
              <Flex className={css({ margin: space_lg + ' 0' })} direction="column" align="stretch">
                <DocTextWrapper id={cardType.purposeId}>
                  {text => (
                    <LabeledTextArea
                      label={i18n.modules.cardType.purpose}
                      value={text || ''}
                      placeholder={i18n.modules.cardType.info.explainPurpose}
                      onChange={(newValue: string) => {
                        if (cardType.purposeId) {
                          dispatch(
                            API.updateDocumentText({
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
                  margin: space_sm + ' 0',
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
                    kind="outline"
                    className={cx(
                      css({ color: 'var(--error-main)', borderColor: 'var(--error-main)' }),
                    )}
                  >
                    <Icon icon={'delete'} /> {i18n.common.delete}
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
                  if (currentProjectId && cardType.kind === 'own') {
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
              borderLeft: '1px solid var(--divider-main)',
              width: '50%',
              padding: space_sm,
            })}
          >
            <ResourcesCtx.Provider
              value={{
                resourceOwnership,
                displayMode: resourcesDisplayMode,
                setDisplayMode: setResourcesDisplayMode,
                selectedResource,
                selectResource,
                lastCreatedId: lastCreatedResourceId,
                setLastCreatedId: setLastCreatedResourceId,
              }}
            >
              <Flex align="baseline">
                <ResourcesMainViewHeader title={<h3>{i18n.modules.resource.documentation}</h3>} />
              </Flex>
              <ResourcesMainViewPanel accessLevel="WRITE" />
            </ResourcesCtx.Provider>
          </Flex>
        </Flex>
      </Flex>
    );
  }
}
