/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import * as React from 'react';
import * as API from '../../API/api';
import { useAppDispatch } from '../../store/hooks';
import CheckBox from '../common/CheckBox';
import IconButton from '../common/IconButton';
import OpenClose from '../common/OpenClose';
import Overlay from '../common/Overlay';
import { addIcon, cancelIcon, createIcon, reinitIcon } from '../styling/defaultIcons';
import {
  CreationScope,
  CreationScopeKind,
  ResourceCallContext,
  ResourceContextScope,
} from './ResourceCommonType';

/**
 * the context in which we create a new resource
 */

export type ResourceCreatorProps = { contextInfo: ResourceCallContext };

const defaultDocType = 'BlockDocument';

export default function ResourceCreator({ contextInfo }: ResourceCreatorProps): JSX.Element {
  const dispatch = useAppDispatch();

  const [docType, setDocType] = React.useState<
    'BlockDocument' | 'ExternalDocLink' | 'HostedDocLink'
  >(defaultDocType);
  const [title, setTitle] = React.useState('');
  const [teaser, setTeaser] = React.useState('');

  // const [url, setUrl] = React.useState('');
  // const [pathname, setPathName] = React.useState('');

  const [category, setCategory] = React.useState('');

  const [atCardContentLevel, setAtCardContentLevel] = React.useState(false);

  function resetInputs() {
    setDocType(defaultDocType);
    setTitle('');
    setTeaser('');
    setCategory('');
    setAtCardContentLevel(false);
    // must be the same as the default values of the states
  }

  return (
    <OpenClose collapsedChildren={<IconButton icon={addIcon} title="add a resource" />}>
      {collapse => (
        <Overlay>
          <>
            <h2>Create a resource</h2>
            <p>
              {'Title : '}
              <input value={title} onChange={event => setTitle(event.target.value)} />
            </p>
            <p>
              {'Teaser : '}
              <input value={teaser} onChange={event => setTeaser(event.target.value)} />
            </p>
            {/* <p> {'Doc type : '}
            <Select options={} /> TODO
            </p> */}
            <p>
              {'Category : '}
              <input value={category} onChange={event => setCategory(event.target.value)} />
            </p>
            {contextInfo.kind == ResourceContextScope.CardOrCardContent && (
              <p>
                <CheckBox
                  label="is only for the present variant"
                  value={atCardContentLevel}
                  onChange={() => setAtCardContentLevel(!atCardContentLevel)}
                />
              </p>
            )}
            <p>
              <IconButton
                icon={createIcon}
                title="create"
                onClick={() => {
                  let creationScope: CreationScope;
                  if (contextInfo.kind == ResourceContextScope.CardType) {
                    creationScope = {
                      kind: CreationScopeKind.CardType,
                      cardTypeId: contextInfo.cardTypeId,
                    };
                  } else {
                    if (atCardContentLevel) {
                      creationScope = {
                        kind: CreationScopeKind.CardContent,
                        cardContentId: contextInfo.cardContentId,
                      };
                    } else {
                      creationScope = {
                        kind: CreationScopeKind.Card,
                        cardId: contextInfo.cardId,
                      };
                    }
                  }
                  dispatch(
                    API.createResource({
                      document: {
                        '@class': docType,
                        title: title,
                        teaser: teaser,
                      },
                      creationScope,
                      category,
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
            </p>
          </>
        </Overlay>
      )}
    </OpenClose>
  );
}
