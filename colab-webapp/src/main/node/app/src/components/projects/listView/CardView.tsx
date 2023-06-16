/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, entityIs } from 'colab-rest-client';
import * as React from 'react';
import { useDefaultVariant } from '../../../store/selectors/cardSelector';
import InlineLoading from '../../common/element/InlineLoading';
import { DocumentOwnership } from '../../documents/documentCommonType';
import TextEditorWrapper from '../../documents/texteditor/TextEditorWrapper';

interface CardViewProps {
  card: Card;
}

export default function CardView({ card }: CardViewProps): JSX.Element {
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
            <h2>{card.title}</h2>
            <div>
              <TextEditorWrapper editable={true} docOwnership={docOwnership} />
            </div>
          </>
        )}
      </>
    );
  } else {
    return <InlineLoading />;
  }
}
