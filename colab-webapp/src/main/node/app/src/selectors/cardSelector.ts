/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent, InvolvementLevel, Project } from 'colab-rest-client';
import { mapValues, uniq } from 'lodash';
import * as React from 'react';
import * as API from '../API/api';
import { sortCardContents } from '../helper';
import { useLanguage } from '../i18n/I18nContext';
import logger from '../logger';
import { CardContentDetail, CardDetail } from '../store/card';
import {
  customColabStateEquals,
  shallowEqual,
  useAppDispatch,
  useAppSelector,
} from '../store/hooks';
import { LoadingStatus } from '../store/store';
import { useMyMember, useProjectBeingEdited } from './projectSelector';
import { useCurrentUser } from './userSelector';

export const useProjectRootCard = (project: Project | null | undefined): Card | LoadingStatus => {
  const dispatch = useAppDispatch();

  const rootCard = useAppSelector(state => {
    if (project != null) {
      if (typeof state.cards.rootCardId === 'string') {
        if (state.cards.rootCardId === 'NOT_INITIALIZED') {
          return 'NOT_INITIALIZED';
        }
        return 'LOADING';
      } else {
        const cardDetail = state.cards.cards[state.cards.rootCardId];

        if (cardDetail != null) {
          const rootCard = cardDetail.card;
          if (rootCard != null) {
            return rootCard;
          } else {
            return 'LOADING';
          }
        } else {
          return 'NOT_INITIALIZED';
        }
      }
    }
    return 'NOT_INITIALIZED';
  });

  const projectId = project?.id;

  React.useEffect(() => {
    if (rootCard === 'NOT_INITIALIZED' && projectId != null) {
      dispatch(API.getProjectStructure(projectId!));
    }
  }, [rootCard, projectId, dispatch]);

  return rootCard;
};

export const useAllProjectCards = (): Card[] => {
  return useAppSelector(state => {
    const cards = Object.values(state.cards.cards)
      .map(cd => cd.card)
      .flatMap(c => (c != null ? [c] : []));
    return cards;
  });
};

export const useAllProjectCardTypes = (): number[] => {
  return useAppSelector(state => {
    const cardTypes = Object.values(state.cards.cards)
      .map(cd => cd.card?.cardTypeId)
      .flatMap(c => (c != null ? [c] : []));
    return cardTypes;
  });
};

export function useVariantsOrLoad(card?: Card): CardContent[] | null | undefined {
  const dispatch = useAppDispatch();
  const lang = useLanguage();

  return useAppSelector(state => {
    if (card?.id && state.cards.cards[card.id]) {
      const cardState = state.cards.cards[card.id]!;
      if (cardState.contents === undefined) {
        dispatch(API.getCardContents(card.id));
        return null;
      } else if (cardState.contents === null) {
        return null;
      } else {
        const contentState = state.cards.contents;
        return sortCardContents(
          cardState.contents.flatMap(contentId => {
            const content = contentState[contentId];
            return content && content.content ? [content.content] : [];
          }),
          lang,
        );
      }
    } else {
      return null;
    }
  }, shallowEqual);
}

export const useCard = (id: number | null | undefined): Card | 'LOADING' | undefined => {
  return useAppSelector(state => {
    if (id == null) {
      return undefined;
    }
    const cardDetail = state.cards.cards[id];

    if (cardDetail != null) {
      return cardDetail.card || 'LOADING';
    } else {
      return undefined;
    }
  });
};

export const useCardContent = (
  id: number | null | undefined,
): CardContent | undefined | 'LOADING' => {
  const dispatch = useAppDispatch();

  const content = useAppSelector(state => {
    if (id) {
      const cardDetail = state.cards.contents[id];

      if (cardDetail != null) {
        return cardDetail.content || 'LOADING';
      }
    }

    return undefined;
  });

  React.useEffect(() => {
    if (content === undefined && id != null) {
      dispatch(API.getCardContent(id));
    }
  }, [content, id, dispatch]);

  return content;
};

export interface Ancestor {
  card: Card | number | undefined | 'LOADING';
  content: CardContent | number | 'LOADING';
  last?: boolean;
}

export const useAncestors = (contentId: number | null | undefined): Ancestor[] => {
  return useAppSelector(state => {
    const ancestors: Ancestor[] = [];

    let currentCardContentId: number | null | undefined = contentId;

    while (currentCardContentId != null) {
      const cardContentState: CardContentDetail | undefined =
        state.cards.contents[currentCardContentId];

      let parentContent: CardContent | number | 'LOADING' = currentCardContentId;
      let parentCard: Card | number | 'LOADING' | undefined = undefined;

      currentCardContentId = undefined;

      if (cardContentState != null) {
        if (cardContentState.content != null) {
          parentContent = cardContentState.content;
          const parentCardId = cardContentState.content.cardId;

          if (parentCardId != null) {
            parentCard = parentCardId;
            const cardState = state.cards.cards[parentCardId];
            if (cardState != null) {
              if (cardState.card != null) {
                parentCard = cardState.card;
                currentCardContentId = cardState.card.parentId || undefined;
              } else {
                parentCard = 'LOADING';
              }
            }
          }
        } else {
          parentContent = 'LOADING';
        }
      }

      ancestors.unshift({
        card: parentCard,
        content: parentContent,
      });
    }

    return ancestors;
  }, shallowEqual);
};

export type ACL = {
  members: Record<number, InvolvementLevel>;
  roles: Record<number, InvolvementLevel>;
};

export type CardAcl = {
  status: {
    cardId: number | null | undefined;
    missingCardId: number | undefined;
    missingCardContentId: number | undefined;
    missingAclCardId: number | undefined;
  };
  self: ACL;
  effective: {
    members: Record<number, InvolvementLevel[]>;
    roles: Record<number, InvolvementLevel>;
  };
};

const useCardACL = (cardId: number | null | undefined): CardAcl => {
  return useAppSelector(
    state => {
      const result: CardAcl = {
        status: {
          cardId: cardId,
          missingCardId: undefined,
          missingCardContentId: undefined,
          missingAclCardId: undefined,
        },
        self: {
          members: {},
          roles: {},
        },
        effective: {
          members: {},
          roles: {},
        },
      };

      const projectId = state.projects.editing;

      if (projectId != null) {
        const team = state.projects.teams[projectId];

        let nextCardId: number | null | undefined = cardId;
        while (nextCardId != null) {
          const cardDetail: CardDetail | undefined = state.cards.cards[nextCardId];
          const aclState = state.acl[nextCardId];
          const currentCardId = nextCardId;

          result.status.missingCardId = cardDetail != undefined ? undefined : nextCardId;
          result.status.missingAclCardId =
            aclState == null || aclState.status === 'NOT_INITIALIZED' ? nextCardId : undefined;

          logger.debug('useACL status: ', result.status);

          nextCardId = undefined;

          if (team != null && team.status === 'INITIALIZED') {
            if (cardDetail != null) {
              if (aclState != null && aclState.status === 'INITIALIZED') {
                const cardAcl = Object.values(aclState.acl).reduce<ACL>(
                  (acc, cur) => {
                    if (cur.memberId != null) {
                      acc.members[cur.memberId] = cur.cairoLevel;
                    } else if (cur.roleId != null) {
                      acc.roles[cur.roleId] = cur.cairoLevel;
                    }
                    return acc;
                  },
                  { members: {}, roles: {} },
                );

                if (currentCardId === cardId) {
                  result.self = cardAcl;
                }

                result.effective.members = {
                  ...mapValues(cardAcl.members, item => {
                    return [item];
                  }),
                  ...result.effective.members,
                };

                result.effective.roles = { ...cardAcl.roles, ...result.effective.roles };

                for (const memberId in team.members) {
                  const memberStatus = result.effective.members[memberId];
                  if (memberStatus == null) {
                    const newStatus: InvolvementLevel[] = [];

                    const member = team.members[memberId];
                    if (member != null) {
                      member.roleIds.forEach(roleId => {
                        // check for AC defined for member's roles for THIS card only
                        const roleStatus = result.effective.roles[roleId];
                        if (roleStatus != null) {
                          newStatus.push(roleStatus);
                        }
                      });
                    }

                    if (newStatus.length > 0) {
                      // inherit AC from roles
                      result.effective.members[memberId] = uniq(newStatus);
                    }
                  }
                }
                if (cardDetail.card != null) {
                  const card = cardDetail.card;
                  if (card.defaultInvolvementLevel != null) {
                    // A default level is set at the card level =>
                    for (const roleId in team.roles) {
                      const rs = result.effective.roles[roleId];
                      if (rs == null) {
                        result.effective.roles[roleId] = card.defaultInvolvementLevel;
                      }
                    }

                    for (const memberId in team.members) {
                      const memberStatus = result.effective.members[memberId];
                      if (memberStatus == null) {
                        result.effective.members[memberId] = [card.defaultInvolvementLevel];
                      }
                    }
                  } else if (card.parentId != null) {
                    // if some members or roles lacks level, inherit from parent card
                    //sub-card
                    const parent = state.cards.contents[card.parentId];
                    if (parent?.content != null) {
                      nextCardId = parent.content.cardId;
                    } else {
                      // missing cardContent
                      result.status.missingCardContentId = card.parentId;
                      nextCardId = undefined;
                    }
                  } else if (card.rootCardProjectId != null) {
                    //root-card : fetch level from member position
                    nextCardId = undefined;

                    for (const memberId in team.members) {
                      const memberStatus = result.effective.members[memberId];
                      if (memberStatus == null) {
                        const member = team.members[memberId];
                        if (member != null) {
                          switch (member.position) {
                            case 'GUEST':
                              result.effective.members[memberId] = ['OUT_OF_THE_LOOP'];
                              break;
                            default:
                              result.effective.members[memberId] = ['INFORMED_READWRITE'];
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      return result;
    },
    (a, b) => {
      const result =
        shallowEqual(a.status, b.status) &&
        shallowEqual(a.self.members, b.self.members) &&
        shallowEqual(a.self.roles, b.self.roles) &&
        customColabStateEquals(a.effective.members, b.effective.members) &&
        shallowEqual(a.effective.roles, b.effective.roles);
      logger.debug('ACL equals ? ', a, b, result);

      return result;
    },
  );
};

export const useAndLoadCardACL = (cardId: number | null | undefined): CardAcl => {
  const dispatch = useAppDispatch();
  const acl = useCardACL(cardId);

  React.useEffect(() => {
    logger.debug('Effect ', acl.status.missingCardId, ' | ', acl.status.missingAclCardId);
    if (acl.status.missingCardId != null) {
      logger.debug('Load Card #', acl.status.missingCardId);
      dispatch(API.getCard(acl.status.missingCardId));
    }

    if (acl.status.missingAclCardId != null) {
      logger.debug('Load ACL Card #', acl.status.missingAclCardId);
      dispatch(API.getACL(acl.status.missingAclCardId));
    }

    if (acl.status.missingCardContentId != null) {
      logger.debug('Load CardContent #', acl.status.missingCardContentId);
      dispatch(API.getCardContent(acl.status.missingCardContentId));
    }
  }, [
    acl.status.missingAclCardId,
    acl.status.missingCardId,
    acl.status.missingCardContentId,
    dispatch,
  ]);

  return acl;
};

export type MyCardAcl = {
  // status: {
  //   cardId: number | null | undefined;
  //   missingCardId: number | undefined;
  //   missingCardContentId: number | undefined;
  //   missingAclCardId: number | undefined;
  // };
  // mine: InvolvementLevel | undefined;
  canRead: boolean | undefined;
  canWrite: boolean | undefined;
};

const levelOrder: Record<InvolvementLevel, { order: number; write: boolean }> = {
  RESPONSIBLE: { order: 1, write: true },
  ACCOUNTABLE: { order: 2, write: true },
  CONSULTED_READWRITE: { order: 3, write: true },
  CONSULTED_READONLY: { order: 4, write: false },
  INFORMED_READWRITE: { order: 5, write: true },
  INFORMED_READONLY: { order: 6, write: false },
  OUT_OF_THE_LOOP: { order: 7, write: false },
};

function resolveAcl(acl: InvolvementLevel[]): InvolvementLevel {
  const sorted = acl.sort((a, b) => levelOrder[a].order - levelOrder[b].order);
  if (sorted.length === 0) {
    return 'OUT_OF_THE_LOOP';
  }
  const max = sorted[0];
  if (max === 'CONSULTED_READONLY' && acl.includes('INFORMED_READWRITE')) {
    return 'CONSULTED_READWRITE';
  }
  return max!;
}

export const useCardACLForCurrentUser = (cardId: number | null | undefined): MyCardAcl => {
  const acl = useAndLoadCardACL(cardId);
  const { project } = useProjectBeingEdited();
  const { currentUser } = useCurrentUser();

  const member = useMyMember(project?.id, currentUser?.id);

  if (currentUser?.admin) {
    return {
      canRead: true,
      canWrite: true,
    };
  }

  if (member?.id != null) {
    const levels = acl.effective.members[member.id];
    if (levels) {
      const resolved = resolveAcl(levels);
      return {
        // status: acl.status,
        // mine: resolved,
        canRead: resolved !== 'OUT_OF_THE_LOOP',
        canWrite: levelOrder[resolved].write,
      };
    }
  }

  return {
    // status: acl.status,
    // mine: undefined,
    canRead: undefined,
    canWrite: undefined,
  };
};

export const useSubCards = (cardContentId: number | null | undefined) => {
  return useAppSelector(state => {
    if (cardContentId) {
      const contentState = state.cards.contents[cardContentId];
      if (contentState != null) {
        if (contentState.subs != null) {
          return contentState.subs.flatMap(cardId => {
            const cardState = state.cards.cards[cardId];
            return cardState && cardState.card ? [cardState.card] : [];
          });
        } else {
          return contentState.subs;
        }
      }
    } else {
      return [];
    }
  }, shallowEqual);
};

export const useAndLoadSubCards = (cardContentId: number | null | undefined) => {
  const dispatch = useAppDispatch();
  const subCards = useSubCards(cardContentId);

  React.useEffect(() => {
    if (subCards === undefined) {
      if (cardContentId) {
        dispatch(API.getSubCards(cardContentId));
      }
    }
  }, [subCards, dispatch, cardContentId]);

  return subCards;
};
