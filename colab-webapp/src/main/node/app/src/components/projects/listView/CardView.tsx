/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { css } from '@emotion/css';
import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import * as API from '../../../API/api';
import useTranslations from '../../../i18n/I18nContext';
import { useAppDispatch } from '../../../store/hooks';
import { useDefaultVariant } from '../../../store/selectors/cardSelector';
import { heading_sm, space_sm } from '../../../styling/style';
import StatusDropDown from '../../cards/StatusDropDown';
import IconButton from '../../common/element/IconButton';
import InlineLoading from '../../common/element/InlineLoading';
import { DiscreetInput } from '../../common/element/Input';
import Collapsible from '../../common/layout/Collapsible';
import Flex from '../../common/layout/Flex';
import { DocumentOwnership } from '../../documents/documentCommonType';
import TextEditorWrapper from '../../documents/texteditor/TextEditorWrapper';
import ListView from './ListView';

interface CardViewProps {
  card: Card;
  id: number;
}

export default function CardView({ card, id }: CardViewProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const variant = useDefaultVariant(id);
  const [shouldConnect, setShouldConnect] = React.useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onToggleHandler = () => {
    setShouldConnect(ov => !ov);
  };

  if (entityIs(variant, 'CardContent')) {
    const docOwnership: DocumentOwnership = {
      kind: 'DeliverableOfCardContent',
      ownerId: variant.id!,
    };

    return (
      <>
        {variant && (
          <>
            <div
              className={css({
                borderTop: '1px solid var(--divider-main)',
                borderLeft: '1px solid var(--divider-main)',
              })}
              ref={setNodeRef}
              style={style}
              {...attributes}
              {...listeners}
            >
              <Collapsible label={card.title || ''} onToggle={onToggleHandler}>
                <Flex direction="column" className={css({ width: '100%' })}>
                  <div
                    className={css({
                      width: '100%',
                      borderBottom: '1px solid var(--divider-main)',
                    })}
                  >
                    <Flex align="center">
                      <DiscreetInput
                        value={card.title || ''}
                        placeholder={i18n.modules.card.untitled}
                        readOnly={variant.frozen}
                        onChange={newValue =>
                          dispatch(API.updateCard({ ...card, title: newValue }))
                        }
                        inputDisplayClassName={heading_sm}
                        autoWidth={true}
                      />
                      <IconButton
                        icon={variant.frozen ? 'lock' : 'lock_open'}
                        title={i18n.modules.card.infos.cardLocked}
                        color={'var(--gray-400)'}
                        onClick={() =>
                          dispatch(API.updateCardContent({ ...variant, frozen: !variant.frozen }))
                        }
                        kind="ghost"
                        className={css({ padding: space_sm, background: 'none' })}
                      />
                      <StatusDropDown
                        value={variant.status}
                        readOnly={variant.frozen}
                        onChange={status => dispatch(API.updateCardContent({ ...variant, status }))}
                        kind="outlined"
                      />
                    </Flex>
                    <TextEditorWrapper
                      readOnly={false}
                      docOwnership={docOwnership}
                      shouldConnect={shouldConnect}
                    />
                  </div>
                  {variant && (
                    <div className={css({ marginLeft: '40px', width: '100%' })}>
                      <ListView content={variant} />
                    </div>
                  )}
                </Flex>
              </Collapsible>
            </div>
          </>
        )}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}
