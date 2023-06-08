/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { useAppSelector } from '../../store/hooks';
import { selectCardContentLexicalConversionStatus } from '../../store/selectors/cardSelector';
import { selectResourceLexicalConversionStatus } from '../../store/selectors/resourceSelector';
import { DocumentOwnership } from '../documents/documentCommonType';

////////////////////////////////////////////////////////////////////////////////////////////////////

export function useMustBeConverted(docOwnership: DocumentOwnership): boolean {
  const lexicalConversionStatus = useAppSelector(state => {
    if (docOwnership.kind === 'DeliverableOfCardContent') {
      return selectCardContentLexicalConversionStatus(state, docOwnership);
    }

    if (docOwnership.kind === 'PartOfResource') {
      return selectResourceLexicalConversionStatus(state, docOwnership);
    }

    throw new Error('Unreachable code. Missing new docOwner.kind handling');
  });

  return lexicalConversionStatus === 'PAGAN';
}

////////////////////////////////////////////////////////////////////////////////////////////////////
