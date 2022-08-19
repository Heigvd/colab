/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import useTranslations from '../../i18n/I18nContext';
import { useAndLoadResourceCategories } from '../../selectors/resourceSelector';
import { useAppDispatch, useLoadingState } from '../../store/hooks';
import Button from '../common/element/Button';
import Form, { createSelectField, Field } from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_M, space_S } from '../styling/style';
import { ResourceCallContext } from './ResourceCommonType';

interface ResourceCreationType {
  title: string;
  teaser: string;
  category: string;
  atCardContentLevel: boolean;
}

const defaultData: ResourceCreationType = {
  title: '',
  teaser: '',
  category: '',
  atCardContentLevel: false,
};

interface ResourceCreatorProps {
  contextInfo: ResourceCallContext;
  onCreated: (newId: number) => void;
  className?: string;
}

export default function ResourceCreator({
  contextInfo,
  onCreated,
  className,
}: ResourceCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();
  const i18n = useTranslations();

  const { isLoading, startLoading, stopLoading } = useLoadingState();

  const { categories: allCategories } = useAndLoadResourceCategories();

  const fields: Field<ResourceCreationType>[] = [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      isMandatory: true,
    },
    {
      key: 'teaser',
      label: 'Teaser',
      type: 'textarea',
      isMandatory: false,
      placeholder: 'Summarize the content if the title is not self-explanatory',
    },
    createSelectField({
      key: 'category',
      label: 'Category',
      type: 'select',
      isMandatory: false,
      isMulti: false,
      canCreateOption: true,
      options: allCategories.map(c => ({ label: c, value: c })),
      tip: 'Like folders to organize the documentation',
    }),
  ];

  if (contextInfo.kind === 'CardOrCardContent' && contextInfo.hasSeveralVariants) {
    fields.push({
      key: 'atCardContentLevel',
      label: 'Is only for the present variant',
      type: 'boolean',
      isMandatory: false,
      showAs: 'checkbox',
    });
  }

  const onSubmit = React.useCallback(
    (resourceToCreate: ResourceCreationType, close: () => void) => {
      startLoading();

      let cardTypeId: number | null | undefined = null;
      let cardId: number | null = null;
      let cardContentId: number | null = null;
      if (contextInfo.kind == 'CardType') {
        cardTypeId = contextInfo.cardTypeId;
      } else {
        if (resourceToCreate.atCardContentLevel) {
          cardContentId = contextInfo.cardContentId || null;
        } else {
          cardId = contextInfo.cardId || null;
        }
      }

      dispatch(
        API.createResource({
          abstractCardTypeId: cardTypeId,
          cardId: cardId,
          cardContentId: cardContentId,
          documents: [],
          title: resourceToCreate.title,
          teaser: {
            '@class': 'TextDataBlock',
            mimeType: 'text/markdown',
            textData: resourceToCreate.teaser,
            revision: '0',
          },
          category: resourceToCreate.category,
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
    [contextInfo, startLoading, dispatch, onCreated, stopLoading],
  );

  return (
    <OpenCloseModal
      title={i18n.modules.document.createADocument}
      collapsedChildren={
        <Flex
          justify="center"
          className={cx(
            css({
              borderTop: '1px solid var(--lightGray)',
              padding: space_S,
              '&:hover': { backgroundColor: 'var(--lightGray)', cursor: 'pointer' },
            }),
            className,
          )}
        >
          <FontAwesomeIcon icon={faPlus} title={i18n.modules.document.createDocument} />
        </Flex>
      }
      className={css({ display: 'block', width: '100%', textAlign: 'center' })}
    >
      {close => (
        <Form
          fields={fields}
          value={defaultData}
          onSubmit={resource => onSubmit(resource, close)}
          submitLabel={i18n.common.create}
          isSubmitInProcess={isLoading}
          className={css({ alignSelf: 'center' })}
          childrenClassName={css({
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'end',
          })}
        >
          <Button onClick={close} invertedButton className={css({ margin: space_M })}>
            {i18n.common.cancel}
          </Button>
        </Form>
      )}
    </OpenCloseModal>
  );
}
