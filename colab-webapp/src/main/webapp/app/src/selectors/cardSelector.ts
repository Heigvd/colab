/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import { Card, CardContent, InvolvementLevel } from 'colab-rest-client';
import { mapValues, uniq } from 'lodash';
import { logger } from '../logger';
import { CardContentDetail, CardDetail } from '../store/card';
import { customColabStateEquals, shallowEqual, useAppSelector } from '../store/hooks';

export const useCard = (id: number): Card | 'LOADING' | undefined => {
  return useAppSelector(state => {
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
  return useAppSelector(state => {
    if (id) {
      const cardDetail = state.cards.contents[id];

      if (cardDetail != null) {
        return cardDetail.content || 'LOADING';
      }
    }

    return undefined;
  });
};

export interface Ancestor {
  card: Card | number | undefined | 'LOADING';
  content: CardContent | number | 'LOADING';
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
    missingAclCardId: number | undefined;
  };
  self: ACL;
  effective: {
    members: Record<number, InvolvementLevel[]>;
    roles: Record<number, InvolvementLevel>;
  };
};

export const useCardACL = (cardId: number | null | undefined): CardAcl => {
  return useAppSelector(
    state => {
      const result: CardAcl = {
        status: {
          cardId: cardId,
          missingCardId: undefined,
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

          logger.info('useACL status: ', result.status);

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
                    nextCardId = card.parentId;
                  } else if (card.rootCardProjectId != null) {
                    //root-card : fetch level from member position
                    nextCardId = undefined;

                    for (const memberId in team.members) {
                      const memberStatus = result.effective.members[memberId];
                      if (memberStatus == null) {
                        const member = team.members[memberId];
                        if (member != null) {
                          switch (member.position) {
                            case 'EXTERN':
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
      logger.info('ACL equals ? ', a, b, result);

      return result;
    },
  );
};
