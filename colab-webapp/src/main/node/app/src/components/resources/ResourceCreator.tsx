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
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import Form, { createSelectField, Field } from '../common/Form/Form';
import Flex from '../common/layout/Flex';
import OpenCloseModal from '../common/layout/OpenCloseModal';
import { space_M, space_S } from '../styling/style';
import { ResourceCallContext } from './ResourceCommonType';

interface ResourceType {
  title: string;
  teaser: string;
  category: string;
  atCardContentLevel: boolean;
}

const defaultData: ResourceType = {
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

  const { categories: allCategories } = useAndLoadResourceCategories();

  const fields: Field<ResourceType>[] = [
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
      placeholder: 'Select or type to create',
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

  return (
    <OpenCloseModal
      title="Create a document"
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
          <FontAwesomeIcon title="Add a document" icon={faPlus} />
        </Flex>
      }
      className={css({ display: 'block', width: '100%', textAlign: 'center' })}
    >
      {collapse => (
        <Form
          fields={fields}
          value={defaultData}
          onSubmit={function (e) {
            let cardTypeId: number | null | undefined = null;
            let cardId: number | null = null;
            let cardContentId: number | null = null;
            if (contextInfo.kind == 'CardType') {
              cardTypeId = contextInfo.cardTypeId;
            } else {
              if (e.atCardContentLevel) {
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
                title: e.title,
                teaser: {
                  '@class': 'TextDataBlock',
                  mimeType: 'text/markdown',
                  textData: e.teaser,
                  revision: '0',
                },
                category: e.category,
              }),
            ).then(action => {
              if (onCreated != null) {
                if (action.meta.requestStatus === 'fulfilled') {
                  if (typeof action.payload === 'number') {
                    onCreated(action.payload);
                  }
                }
              }
              collapse();
            });
          }}
          submitLabel={i18n.common.create}
          className={css({ alignSelf: 'center' })}
          childrenClassName={css({
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'end',
          })}
        >
          <Button
            onClick={() => {
              collapse();
            }}
            invertedButton
            className={css({ margin: space_M })}
          >
            {i18n.common.cancel}
          </Button>
        </Form>
      )}
    </OpenCloseModal>
  );
}
