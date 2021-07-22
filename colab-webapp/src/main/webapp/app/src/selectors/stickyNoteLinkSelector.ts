/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { StickyNoteLink } from 'colab-rest-client';
import { useAppSelector } from '../store/hooks';
import { loadingStatus } from '../store/store';

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
  cardDestId: number,
): {
  stickyNotes: StickyNoteLink[];
  status: loadingStatus;
} => {
  return useAppSelector(state => {
    if (cardDestId != null) {
      const dataInStore = state.stickynotelinks.byCardDest[cardDestId];

      if (dataInStore === undefined) {
        return {
          stickyNotes: [],
          status: 'NOT_INITIALIZED',
        };
      } else {
        const { stickyNoteIds, status } = dataInStore;

        if (status == 'LOADING') {
          return {
            stickyNotes: [],
            status: 'LOADING',
          };
        } else {
          return {
            stickyNotes: stickyNoteIds.flatMap(snId => {
              const sn = state.stickynotelinks.stickyNotes[snId];
              return sn ? [sn.stickyNote] : [];
            }),
            status: 'READY',
          };
        }
      }
    }

    return { stickyNotes: [], status: 'NOT_INITIALIZED' };
  });
};

//            links: linkIds
//               .map(linkId => {
//                const p =  state.stickynotelinks.allLinks[linkId];
//                return (p ? p.link : null);
//               })
//              .filter((link: StickyNoteLink | null): link is StickyNoteLink => { return link != null }),
