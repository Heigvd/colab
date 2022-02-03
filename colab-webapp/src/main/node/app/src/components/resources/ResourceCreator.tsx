/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
//import * as API from '../../API/api';
//import { useAppDispatch } from '../../store/hooks';
import Button from '../common/Button';
import Flex from '../common/Flex';
import Form, { createSelectField, Field } from '../common/Form/Form';
import IconButton from '../common/IconButton';
import OpenCloseModal from '../common/OpenCloseModal';
import { addIcon } from '../styling/defaultIcons';
import { space_M, space_S } from '../styling/style';
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
  //const dispatch = useAppDispatch();

  const [state, setState] = React.useState<ResourceType>(defaultResource);

  const resetInputs = React.useCallback(() => {
    setState(defaultResource);
  }, []);

  const fields: Field<ResourceType>[] = [
    {
      key: 'title',
      type: 'text',
      label: 'title',
      isMandatory: true,
    },
    {
      key: 'teaser',
      type: 'text',
      label: 'teaser',
      isMandatory: true,
    },
    createSelectField({
      key: 'category',
      type: 'select',
      label: 'Category',
      isMulti: false,
      options: categories.map(c => ({ label: c, value: c })),
      canCreateOption: true,
      placeholder: 'Select or create a category',
      isMandatory: true,
    }),
    createSelectField({
      key: 'docType',
      type: 'select',
      label: 'Resource type',
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
          <Form
            fields={fields}
            value={state}
            onSubmit={function (e) {
              setState(e);
              let cardTypeId: number | null = null;
              let cardId: number | null = null;
              let cardContentId: number | null = null;
              if (contextInfo.kind == ResourceContextScope.CardType) {
                cardTypeId = contextInfo.cardTypeId;
              } else {
                if (e.atCardContentLevel) {
                  cardContentId = contextInfo.cardContentId || null;
                } else {
                  cardId = contextInfo.cardId || null;
                }
              }
              // dispatch(
              //   API.createResource({
              //     abstractCardTypeId: cardTypeId,
              //     cardId: cardId,
              //     cardContentId: cardContentId,
              //     document:
              //       e.docType === 'DocumentFile'
              //         ? {
              //             '@class': e.docType,
              //             fileSize: 0,
              //             mimeType: 'application/octet-stream',
              //           }
              //         : {
              //             '@class': e.docType,
              //           },
              //     title: e.title,
              //     teaser: {
              //       '@class': 'TextDataBlock',
              //       mimeType: 'text/markdown',
              //       textData: e.teaser,
              //       revision: '0',
              //     },
              //     category: e.category,
              //   }),
              // ).then(() => {
              //   resetInputs();
              //   collapse();
              // });
            }}
            childrenClassName={css({
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'end',
            })}
            className={css({alignSelf: 'center'})}
          >
            <Button
              title="cancel"
              onClick={() => {
                // see if it is better to reset the values or not
                collapse();
              }}
              invertedButton
              className={css({ margin: space_M })}
            >
              Cancel
            </Button>
            <IconButton icon={faUndo} title="reinit fields" onClick={() => resetInputs()} />
          </Form>
      )}
    </OpenCloseModal>
  );
}
