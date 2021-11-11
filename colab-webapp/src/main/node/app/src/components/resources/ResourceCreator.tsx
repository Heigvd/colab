/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import Form, { Field } from '../common/Form/Form';
import IconButton from '../common/IconButton';
import OpenCloseModal, { modalPadding } from '../common/OpenCloseModal';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';
import { ResourceCallContext, ResourceContextScope } from './ResourceCommonType';

/**
 * the context in which we create a new resource
 */

export type ResourceCreatorProps = { contextInfo: ResourceCallContext; categories: string[] };

const defaultDocType = 'BlockDocument';

interface ResourceType {
  docType: 'BlockDocument' | 'ExternalLink' | 'HostedDocLink';
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
    {
      key: 'category',
      type: 'select',
      label: 'category',
      options: categories.map(c => ({ label: c, value: c })),
      canCreateOption: true,
      placeholder: 'category',
      isMandatory: true,
    },
    {
      key: 'docType',
      type: 'select',
      options: [
        //docType: 'BlockDocument' | 'ExternalDocLink' | 'HostedDocLink';
        { label: 'Document', value: 'BlockDocument' },
        { label: 'Link', value: 'ExternalDocLink' },
        //{label: File', value: 'HostedDocLink'}
      ],
      isMandatory: true,
    },
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
      collapsedChildren={<IconButton title="add a sticky note" icon={addIcon} />}
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
                    cardContentId = contextInfo.cardContentId;
                  } else {
                    cardId = contextInfo.cardId;
                  }
                }
                dispatch(
                  API.createResource({
                    abstractCardTypeId: cardTypeId,
                    cardId: cardId,
                    cardContentId: cardContentId,
                    document: {
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
