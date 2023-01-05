/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { StickyNoteLink } from 'colab-rest-client';
import { useAppSelector } from '../store/hooks';
import { LoadingStatus } from '../store/store';

//export const useStickyNoteLink = (id: number): StickyNoteLink | 'LOADING' | undefined => {
//  return useAppSelector(state => {
//    if (id != null) {
//      const linkDetail = state.stickynotelinks.links[id];

//      if (linkDetail === null) {
//        return 'LOADING';
//      } else {
//        return linkDetail;
//      }
//    }
//    return undefined;
//  });
//};

export const useStickyNoteLinksForDest = (
  cardDestId: number | undefined | null,
): {
  stickyNotesForDest: StickyNoteLink[];
  status: LoadingStatus;
} => {
  return useAppSelector(state => {
    if (cardDestId != null) {
      const dataInStore = state.stickynotelinks.byCardDest[cardDestId];

      if (dataInStore === undefined) {
        return {
          stickyNotesForDest: [],
          status: 'NOT_INITIALIZED',
        };
      } else {
        const { stickyNoteIds, status } = dataInStore;

        if (status == 'LOADING') {
          return {
            stickyNotesForDest: [],
            status: 'LOADING',
          };
        } else {
          return {
            stickyNotesForDest: stickyNoteIds.flatMap(snId => {
              const sn = state.stickynotelinks.stickyNotes[snId];
              return sn ? [sn] : [];
            }),
            status: 'READY',
          };
        }
      }
    }

    return { stickyNotesForDest: [], status: 'NOT_INITIALIZED' };
  });
};

//            links: linkIds
//               .map(linkId => {
//                const p =  state.stickynotelinks.allLinks[linkId];
//                return (p ? p.link : null);
//               })
//              .filter((link: StickyNoteLink | null): link is StickyNoteLink => { return link != null }),
