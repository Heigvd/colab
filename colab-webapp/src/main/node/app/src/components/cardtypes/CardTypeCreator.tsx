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
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import {
  useCurrentProjectCardTypeTags,
  useGlobalCardTypeTags,
} from '../../store/selectors/cardTypeSelector';
import { useCurrentProjectId } from '../../store/selectors/projectSelector';
import { buttonStyle, space_lg } from '../../styling/style';
import Button from '../common/element/Button';
import Form, { Field, createSelectField } from '../common/element/Form';
import Icon from '../common/layout/Icon';
import OpenModalOnClick from '../common/layout/OpenModalOnClick';

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
    <OpenModalOnClick
      title={i18n.modules.cardType.action.createAType}
      collapsedChildren={
        <>
          <Icon icon={'add'} /> {i18n.modules.cardType.action.createType}
        </>
      }
      className={cx(buttonStyle, css({ marginBottom: space_lg }))}
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
            buttonClassName={buttonStyle}
          >
            <Button onClick={close} kind="outline" className={css({ margin: space_lg })}>
              {i18n.common.cancel}
            </Button>
          </Form>
        );
      }}
    </OpenModalOnClick>
  );
}
