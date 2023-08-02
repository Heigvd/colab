/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import 'react-reflex/styles.css';
import { TipsCtx } from '../common/element/Tips';
import Flex from '../common/layout/Flex';
import TextEditorWrapper from '../documents/texteditor/TextEditorWrapper';

interface CardEditorDeliverableProps {
  cardContent: CardContent;
  readOnly?: boolean;
}
export default function CardEditorDeliverable({
  cardContent,
  readOnly,
}: CardEditorDeliverableProps): JSX.Element {

  const tipsConfig = React.useContext(TipsCtx);

  return (
    <>
      <Flex grow={1} direction="column" align="stretch" className={cx(css({ overflow: 'auto' }))}>
        <Flex grow={1} align="stretch" className={css({ overflow: 'hidden' })}>
          <Flex
            direction="column"
            grow={1}
            align="stretch"
            className={css({ overflow: 'hidden' })}
          >
            <Flex
              direction="column"
              grow={1}
              className={css({
                overflow: 'auto',
              })}
              align="stretch"
            >
              {!tipsConfig.WIP.value ? (
                <Flex
                  direction="column"
                  grow={1}
                  align="stretch"
                  className={css({ overflow: 'auto' })}
                >
                  {cardContent.id && (
                    <TextEditorWrapper
                      readOnly={readOnly}
                      docOwnership={{
                        kind: 'DeliverableOfCardContent',
                        ownerId: cardContent.id,
                      }}
                    />
                  )}
                </Flex>
              ) : (
                <Flex
                  direction="column"
                  grow={1}
                  align="stretch"
                  className={css({ overflow: 'auto' })}
                >
                  {cardContent.id && (
                    <TextEditorWrapper
                      readOnly={readOnly}
                      docOwnership={{
                        kind: 'DeliverableOfCardContent',
                        ownerId: cardContent.id,
                      }}
                    />
                  )}
                </Flex>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
