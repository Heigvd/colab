/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { css } from '@emotion/css';
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, NodeKey } from 'lexical';
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDefaultVariant } from '../../../../store/selectors/cardSelector';
import Icon from '../../../common/layout/Icon';

export default function CardLinkComponent({
  className,
  cardId,
  cardTitle,
  nodeKey,
}: {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  cardId: number;
  cardTitle: string;
  nodeKey: NodeKey;
}): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const variant = useDefaultVariant(cardId);
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const cardLinkDivContainerRef = React.useRef<null | HTMLDivElement>(null);
  const cardLinkIconRef = React.useRef<null | HTMLSpanElement>(null);

  React.useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        payload => {
          const event = payload;

          if (
            event.target === cardLinkDivContainerRef.current ||
            event.target === cardLinkIconRef.current
          ) {
            clearSelection();
            setSelected(true);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
    return () => {
      unregister();
    };
  }, [cardId, clearSelection, editor, setSelected, variant]);

  const onClickHandler = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (variant != 'LOADING') {
      const path = `card/${cardId}/v/${variant!.id}`;
      if (location.pathname.match(/(card)\/\d+\/v\/\d+/)) {
        navigate(`../${path}`);
      } else {
        navigate(path);
      }
    }
  };

  return (
    <>
      <BlockWithAlignableContents className={className} nodeKey={nodeKey}>
        <div
          className={css({ display: 'flex', alignItems: 'center' })}
          ref={cardLinkDivContainerRef}
        >
          <Icon icon={'sentiment_frustrated'} opsz="sm" theRef={cardLinkIconRef} />
          <a href={'/'} onClick={onClickHandler}>
            {cardTitle}
          </a>
        </div>
      </BlockWithAlignableContents>
    </>
  );
}
