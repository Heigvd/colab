/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

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

interface CardViewProps {
  card: Card;
}

export default function CardView({ card }: CardViewProps): JSX.Element {
  const i18n = useTranslations();
  const dispatch = useAppDispatch();
  const variant = useDefaultVariant(card.id!);

  if (entityIs(variant, 'CardContent')) {
    const docOwnership: DocumentOwnership = {
      kind: 'DeliverableOfCardContent',
      ownerId: variant.id!,
    };

    return (
      <>
        {variant && (
          <>
            <div>
              <Collapsible label={card.title}>
                <Flex direction="column">
                  <Flex align="center">
                    <DiscreetInput
                      value={card.title || ''}
                      placeholder={i18n.modules.card.untitled}
                      readOnly={variant.frozen}
                      onChange={newValue => dispatch(API.updateCard({ ...card, title: newValue }))}
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
                  <TextEditorWrapper editable={true} docOwnership={docOwnership} />
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
