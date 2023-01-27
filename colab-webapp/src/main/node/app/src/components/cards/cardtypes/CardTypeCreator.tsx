/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import {
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../../selectors/cardTypeSelector';
import { useCurrentProjectId } from '../../../selectors/projectSelector';
import { useAppDispatch, useLoadingState } from '../../../store/hooks';
import Button from '../../common/element/Button';
import Form, { createSelectField, Field } from '../../common/element/Form';
import OpenCloseModal from '../../common/layout/OpenCloseModal';
import { buttonStyle, marginAroundStyle, space_M } from '../../styling/style';

interface CardTypeCreatorProps {
  onCreated?: (id: number) => void;
  usage: 'currentProject' | 'global';
}

interface CardTypeCreationType {
  title: string;
  purpose: string;
  tags: string[];
}

export default function CardTypeCreator({ onCreated, usage }: CardTypeCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const currentProjectId = useCurrentProjectId();

  const allCurrentProjectTags = useCurrentProjectCardTypeTags();
  const allGlobalTags = useGlobalCardTypeTags();

  const fields: Field<CardTypeCreationType>[] = [
    {
      key: 'title',
      label: i18n.common.name,
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'purpose',
      label: i18n.modules.cardType.purpose,
      type: 'textarea',
      isMandatory: false,
    },
    createSelectField({
      key: 'tags',
      label: i18n.modules.resource.category,
      type: 'select',
      isMandatory: true,
      isMulti: true,
      canCreateOption: true,
      options: (usage === 'currentProject' ? allCurrentProjectTags : allGlobalTags).map(c => ({
        label: c,
        value: c,
      })),
    }),
  ];

  const defaultData = { title: '', purpose: '', tags: [] };

  const onSubmit = React.useCallback(
    (typeToCreate: CardTypeCreationType, close: () => void) => {
      startLoading();

      dispatch(
        API.createCardType({
          projectId: usage === 'currentProject' && currentProjectId ? currentProjectId : null,
          title: typeToCreate.title,
          tags: typeToCreate.tags,
          purpose: {
            '@class': 'TextDataBlock',
            mimeType: 'text/markdown',
            textData: typeToCreate.purpose,
            revision: '0',
            healthy: true,
          },
        }),
      ).then(action => {
        stopLoading();

        if (onCreated != null) {
          if (action.meta.requestStatus === 'fulfilled') {
            if (typeof action.payload === 'number') {
              onCreated(action.payload);
            }
          }
        }

        close();
      });
    },
    [startLoading, dispatch, usage, currentProjectId, onCreated, stopLoading],
  );

  if (currentProjectId == null && usage === 'currentProject') {
    return <i>{i18n.modules.project.info.noProjectSelected}</i>;
  }

  return (
    <OpenCloseModal
      title={i18n.modules.cardType.action.createAType}
      collapsedChildren={
        <>
          <FontAwesomeIcon icon={faPlus} /> {i18n.modules.cardType.action.createType}
        </>
      }
      className={cx(buttonStyle, css({ marginBottom: space_M }))}
      showCloseButton
    >
      {close => {
        return (
          <Form
            fields={fields}
            value={defaultData}
            onSubmit={type => {
              onSubmit(type, close);
            }}
            submitLabel={i18n.common.create}
            isSubmitInProcess={isLoading}
            className={css({ alignSelf: 'center' })}
            childrenClassName={css({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'end',
            })}
            buttonClassName={cx(buttonStyle, marginAroundStyle([1], space_M))}
          >
            <Button onClick={close} invertedButton className={css({ margin: space_M })}>
              {i18n.common.cancel}
            </Button>
          </Form>
        );
      }}
    </OpenCloseModal>
  );
}
