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
import { useAppDispatch } from '../../store/hooks';
import Flex from '../common/Flex';
import Form, { createSelectField, Field } from '../common/Form/Form';
import IconButton from '../common/IconButton';
import OpenCloseModal, { modalPadding } from '../common/OpenCloseModal';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';
import { space_S } from '../styling/style';
import { ResourceCallContext, ResourceContextScope } from './ResourceCommonType';

/**
 * the context in which we create a new resource
 */

export type ResourceCreatorProps = {
  contextInfo: ResourceCallContext;
  categories: string[];
  className?: string;
};

const defaultDocType = 'BlockDocument';

interface ResourceType {
  docType: 'BlockDocument' | 'ExternalLink' | 'DocumentFile';
  title: string;
  teaser: string;
  category: string;
  atCardContentLevel: boolean;
}

const defaultResource: ResourceType = {
  docType: defaultDocType,
  title: '',
  teaser: '',
  category: '',
  atCardContentLevel: false,
};

export default function ResourceCreator({
  contextInfo,
  categories,
  className,
}: ResourceCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [state, setState] = React.useState<ResourceType>(defaultResource);

  const resetInputs = React.useCallback(() => {
    setState(defaultResource);
  }, []);

  const fields: Field<ResourceType>[] = [
    {
      key: 'title',
      type: 'text',
      label: 'title',
      placeholder: 'title',
      isMandatory: true,
    },
    {
      key: 'teaser',
      type: 'text',
      label: 'teaser',
      placeholder: 'teaser',
      isMandatory: true,
    },
    createSelectField({
      key: 'category',
      type: 'select',
      label: 'category',
      isMulti: false,
      options: categories.map(c => ({ label: c, value: c })),
      canCreateOption: true,
      placeholder: 'category',
      isMandatory: true,
    }),
    createSelectField({
      key: 'docType',
      type: 'select',
      isMulti: false,
      options: [
        { label: 'Document', value: 'BlockDocument' },
        { label: 'Link', value: 'ExternalLink' },
        { label: 'File', value: 'DocumentFile' },
      ],
      isMandatory: true,
    }),
  ];

  if (contextInfo.kind == ResourceContextScope.CardOrCardContent) {
    fields.push({
      key: 'atCardContentLevel',
      label: 'is only for the present version',
      type: 'boolean',
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
          <FontAwesomeIcon title="Add a resource" icon={addIcon} />
        </Flex>
      }
      className={css({ display: 'block', width: '100%', textAlign: 'center' })}
    >
      {collapse => (
        <div className={css({ padding: modalPadding })}>
          <Form fields={fields} value={state} autoSubmit={true} onSubmit={setState} />
          <div>
            <IconButton
              icon={createIcon}
              title="create"
              onClick={() => {
                let cardTypeId: number | null = null;
                let cardId: number | null = null;
                let cardContentId: number | null = null;
                if (contextInfo.kind == ResourceContextScope.CardType) {
                  cardTypeId = contextInfo.cardTypeId;
                } else {
                  if (state.atCardContentLevel) {
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
                    document:
                      state.docType === 'DocumentFile'
                        ? {
                            '@class': state.docType,
                            fileSize: 0,
                            mimeType: 'application/octet-stream',
                          }
                        : {
                            '@class': state.docType,
                          },
                    title: state.title,
                    teaser: {
                      '@class': 'TextDataBlock',
                      mimeType: 'text/markdown',
                      textData: state.teaser,
                      revision: '0',
                    },
                    category: state.category,
                  }),
                ).then(() => {
                  resetInputs();
                  collapse();
                });
              }}
            />
            <IconButton icon={reinitIcon} title="reinit" onClick={() => resetInputs()} />
            <IconButton
              icon={cancelIcon}
              title="cancel"
              onClick={() => {
                // see if it is better to reset the values or not
                collapse();
              }}
            />
          </div>
        </div>
      )}
    </OpenCloseModal>
  );
}
