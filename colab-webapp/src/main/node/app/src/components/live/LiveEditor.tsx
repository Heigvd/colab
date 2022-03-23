/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css, cx } from '@emotion/css';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import MarkdownViewer from '../blocks/markdown/MarkdownViewer';
import WysiwygEditor from '../blocks/markdown/WysiwygEditor';
import Button from '../common/Button';
import CleverTextarea from '../common/CleverTextarea';
import ErrorBoundary from '../common/ErrorBoundary';
import Flex from '../common/Flex';
import InlineLoading from '../common/InlineLoading';
import Tabs, { Tab } from '../common/Tabs';
import { invertedButtonStyle, space_M, space_S } from '../styling/style';
import ChangeTree from './ChangeTree';
import { useLiveBlock } from './LiveTextEditor';

const shrink = css({
  flexGrow: 0,
  flexShrink: 1,
});

export type EditState = 'VIEW' | 'EDIT';

interface Props {
  atClass: string;
  atId: number;
  value: string;
  revision: string;
  allowEdition?: boolean;
  editingStatus: EditState;
  showTree?: boolean;
  className?: string;
  setEditingState?: React.Dispatch<React.SetStateAction<EditState>>;
}

function Unsupported({ md }: { md: string }) {
  return (
    <div>
      <div className={css({ margin: '5px', padding: '5px', border: '1px solid red' })}>
        <em>
          Your browser does not support to display this text in its pretty form. Our technicians are
          on the case.
        </em>
      </div>
      <pre>{md}</pre>
    </div>
  );
}

export default function LiveEditor({
  atClass,
  atId,
  value,
  revision,
  allowEdition,
  editingStatus,
  showTree,
  className,
  setEditingState,
}: Props): JSX.Element {
  const liveSession = useAppSelector(state => state.websockets.sessionId);

  const { currentValue, onChange, status } = useLiveBlock({
    atClass: atClass,
    atId: atId,
    value: value,
    revision: revision,
  });

  if (status != 'READY') {
    return <InlineLoading />;
  }

  if (!liveSession) {
    return (
      <div>
        <div>
          <i>disconnected...</i>
        </div>
        <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
          <MarkdownViewer md={currentValue} />
        </ErrorBoundary>
      </div>
    );
  }

  if (!allowEdition) {
    return (
      <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
        <MarkdownViewer md={currentValue} />
      </ErrorBoundary>
    );
  } else {
    if (editingStatus === 'VIEW') {
      return (
        <Flex className={className}>
          <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
            <MarkdownViewer md={currentValue} />
          </ErrorBoundary>
        </Flex>
      );
    } else if (editingStatus === 'EDIT') {
      return (
        <Flex
          direction="column"
          align="stretch"
          className={cx(
            css({ backgroundColor: 'var(--hoverBgColor)', padding: space_S }),
            className,
          )}
        >
          <Flex>
            <Tabs
              bodyClassName={css({ padding: space_M, alignItems: 'stretch' })}
              tabsClassName={css({ padding: space_S + ' ' + space_M })}
            >
              <Tab name="visual" label="Visual">
                <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                  <WysiwygEditor
                    className={css({ alignItems: 'stretch' })}
                    value={currentValue}
                    onChange={onChange}
                  />
                </ErrorBoundary>
              </Tab>
              <Tab name="makdn" label="Markdown">
                <Flex grow={1} align="stretch">
                  <CleverTextarea
                    className={css({ minHeight: '100px', flexGrow: 1, flexBasis: '1px' })}
                    value={currentValue}
                    onChange={onChange}
                  />
                  <ErrorBoundary fallback={<Unsupported md={currentValue} />}>
                    <MarkdownViewer
                      className={css({ padding: '3px', flexGrow: 1, flexBasis: '1px' })}
                      md={currentValue}
                    />
                  </ErrorBoundary>
                </Flex>
              </Tab>
            </Tabs>
            {showTree ? (
              <div className={shrink}>
                <ChangeTree atClass={atClass} atId={atId} value={value} revision={revision} />
              </div>
            ) : null}
          </Flex>
          {editingStatus === 'EDIT' && (
            <Button
              className={cx(invertedButtonStyle, css({ margin: space_S + ' 0', alignSelf: 'flex-end' }))}
              onClick={() => {if(setEditingState)
                setEditingState('VIEW');
              }}
            >
              Ok
            </Button>
          )}
        </Flex>
      );
    }
  }
  return <div>not yet implemented</div>;
}
