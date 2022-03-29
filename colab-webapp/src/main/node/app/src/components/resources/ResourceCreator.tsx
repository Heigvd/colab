/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import * as API from '../../API/api';
import { useAndLoadResourceCategories } from '../../selectors/resourceSelector';
import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import Flex from '../common/Flex';
import Form, { createSelectField, Field } from '../common/Form/Form';
import OpenCloseModal from '../common/OpenCloseModal';
import { addIcon } from '../styling/defaultIcons';
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
  className?: string;
}

export default function ResourceCreator({
  contextInfo,
  className,
}: ResourceCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const { categories: allCategories } = useAndLoadResourceCategories();

  const fields: Field<ResourceType>[] = [
    {
      key: 'title',
      type: 'text',
      label: 'Title',
      isMandatory: true,
    },
    {
      key: 'teaser',
      type: 'textarea',
      label: 'Teaser',
      isMandatory: false,
      placeholder: 'Summarize the content if the title is not self-explanatory',
    },
    createSelectField({
      key: 'category',
      type: 'select',
      label: 'Category',
      isMandatory: false,
      placeholder: 'Select or type to create',
      fieldFooter: 'Made to organize the resources',
      isMulti: false,
      canCreateOption: true,
      options: allCategories.map(c => ({ label: c, value: c })),
    }),
  ];

  if (contextInfo.kind === 'CardOrCardContent' && contextInfo.hasSeveralVariants) {
    fields.push({
      key: 'atCardContentLevel',
      type: 'boolean',
      label: 'Is only for the present variant',
      isMandatory: false,
      showAs: 'checkbox',
    });
  }

  return (
    <OpenCloseModal
      title="Create a resource"
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
          <FontAwesomeIcon title="Create a resource" icon={addIcon} />
        </Flex>
      }
      className={css({ display: 'block', width: '100%', textAlign: 'center' })}
    >
      {collapse => (
        <Form
          fields={fields}
          value={defaultData}
          submitLabel="Create"
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
            ).then(() => {
              collapse();
            });
          }}
          childrenClassName={css({
            flexDirection: 'row-reverse',
            alignItems: 'center',
            justifyContent: 'end',
          })}
          className={css({ alignSelf: 'center' })}
        >
          <Button
            onClick={() => {
              collapse();
            }}
            invertedButton
            className={css({ margin: space_M })}
          >
            Cancel
          </Button>
        </Form>
      )}
    </OpenCloseModal>
  );
}
