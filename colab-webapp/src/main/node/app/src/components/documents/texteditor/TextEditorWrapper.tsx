/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import { css } from '@emotion/css';
import * as React from 'react';
import { useColabConfig } from '../../../store/selectors/configSelector';
import InlineLoading from '../../common/element/InlineLoading';
import Flex from '../../common/layout/Flex';
import { DocumentOwnership } from '../documentCommonType';
import TextEditor from './TextEditor';

const editorWrapperStyle = css({
  width: '100%',
  maxWidth: '1100px',
  color: '#000',
  position: 'relative',
  lineHeight: '1.7',
  fontWeight: '400',
});

interface TextEditorWrapperProps {
  editable: boolean;
  docOwnership: DocumentOwnership;
}

export default function TextEditorWrapper({
  editable,
  docOwnership,
}: TextEditorWrapperProps): JSX.Element {
  const { yjsUrl } = useColabConfig();

  // forces re-render if the rendered document is different
  const keyCount = React.useMemo(() => {
    return docOwnership.kind + docOwnership.ownerId;
  }, [docOwnership.kind, docOwnership.ownerId]);

  return (
    <Flex style={{ width: '100%' }} key={keyCount}>
      <div className={editorWrapperStyle}>
        {yjsUrl === undefined ? (
          <InlineLoading />
        ) : (
          <TextEditor editable={editable} docOwnership={docOwnership} url={yjsUrl} />
        )}
      </div>
    </Flex>
  );
}
