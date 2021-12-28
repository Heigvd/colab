/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card, card type and card content specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card persistence
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Card content persistence handler
     */
    @Inject
    private CardContentDao cardContentDao;

    // *********************************************************************************************
    // find cards
    // *********************************************************************************************

    /**
     * @param cardId The identifier of the searched card
     *
     * @return The card corresponding to the id
     */
    public Card assertAndGetCard(Long cardId) {
        Card card = cardDao.getCard(cardId);

        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return card;
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist a new card into the given card content with the given card type.
     * <p>
     * Also create its default resource references.
     *
     * @param parentId   the id of the parent of the new card
     * @param cardTypeId the id of the card type of the new card
     *
     * @return a new, initialized and persisted card
     */
    public Card createNewCard(Long parentId, Long cardTypeId) {
        logger.debug("create a new sub card of #{} with the type of #{}", parentId,
            cardTypeId);

        CardContent parent = cardContentManager.assertAndGetCardContent(parentId);

        AbstractCardType cardType = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeId);

        Card card = initNewCard(parent, cardType);

        ResourceReferenceSpreadingHelper.spreadResourceFromUp(card);

        return cardDao.createCard(card);
    }

    /**
     * Initialize a new card. Card will be bound to the given type.
     * <p>
     * If the type does not belongs to the same project as the card do, a type ref is created.
     *
     * @param parent   the parent of the new card
     * @param cardType the related card type
     *
     * @return a new card containing a new card content with cardType
     */
    private Card initNewCard(CardContent parent, AbstractCardType cardType) {
        Card card = initNewCard();

        card.setParent(parent);
        parent.getSubCards().add(card);

        Project project = parent.getProject();

        if (project != null) {
            AbstractCardType effectiveType =
                cardTypeManager.computeEffectiveCardTypeOrRef(cardType, project);

            if (effectiveType != null) {
                card.setCardType(effectiveType);
                effectiveType.getImplementingCards().add(card);
                CardType resolved = effectiveType.resolve();
                if (resolved != null) {
                    card.setTitle(resolved.getTitle());
                } else {
                    logger.error("Unresolvable card type {}", effectiveType);
                }
            } else {
                logger.error("Unable to find effective type for {}", cardType);
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }
        }

        return card;
    }

    /**
     * Initialize a new root card. This card contains every other cards of a project.
     * <p>
     * No persistence stuff in there
     *
     * @return a new card dedicated to be the root card of a project
     */
    public Card initNewRootCard() {
        logger.debug("initialize a new root card");

        Card rootCard = initNewCard();
        rootCard.setIndex(0);

        return rootCard;
    }

    /**
     * Initialize a new card.
     *
     * @return a new card containing a new card content
     */
    private Card initNewCard() {
        Card card = new Card();

        cardContentManager.initNewCardContentForCard(card);

        return card;
    }

    /**
     * Delete the card
     *
     * @param cardId the id of the card to delete
     *
     * @return the freshly deleted card
     */
    public Card deleteCard(Long cardId) {
        Card card = cardDao.getCard(cardId);

        if (card.getRootCardProject() != null) {
            // no way to delete the root card
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        card.getParent().getSubCards().remove(card);

        card.getCardType().getImplementingCards().remove(card);

        return cardDao.deleteCard(cardId);
    }

    /**
     * Move a card to a new parent
     *
     * @param cardId      id of the card to move
     * @param newParentId id of the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent if a child of the card
     */
    public void moveCard(Long cardId, Long newParentId) {
        this.moveCard(cardDao.getCard(cardId), cardContentDao.getCardContent(newParentId));
    }

    /**
     * Move a card to a new parent
     *
     * @param card      the card to move
     * @param newParent the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent if a child of the card
     */
    public void moveCard(Card card, CardContent newParent) {
        if (card != null && newParent != null) {
            if (card.getRootCardProject() != null) {
                // Do never move root card
                throw HttpErrorMessage.dataIntegrityFailure();
            }

            CardContent previousParent = card.getParent();
            if (previousParent != null) {
                // check if newParent is a child of the card
                Card c = newParent.getCard();
                while (c != null) {
                    if (c.equals(card)) {
                        throw HttpErrorMessage.dataIntegrityFailure();
                    }
                    CardContent parent = c.getParent();
                    if (parent != null) {
                        c = parent.getCard();
                    } else {
                        c = null;
                    }
                }
                previousParent.getSubCards().remove(card);
                newParent.getSubCards().add(card);
                card.setParent(newParent);
            }
        }
    }

    // *********************************************************************************************
    // utility
    // *********************************************************************************************

    /**
     * Get a card and all cards within in one set.
     *
     * @param rootCard the first card
     *
     * @return the rootCard + all cards within
     */
    public Set<Card> getAllCards(Card rootCard) {
        Set<Card> cards = new HashSet<>();
        List<Card> queue = new LinkedList<>();
        queue.add(rootCard);

        while (!queue.isEmpty()) {
            Card card = queue.remove(0);
            cards.add(card);
            card.getContentVariants().forEach(content -> queue.addAll(content.getSubCards()));
        }
        return cards;
    }

    /**
     * Get all cardContents
     *
     * @param rootCard the first card
     *
     * @return all cardContent in the card hierarchy
     */
    public Set<CardContent> getAllCardContents(Card rootCard) {
        return this.getAllCards(rootCard).stream().flatMap(card -> {
            return card.getContentVariants().stream();
        }).collect(Collectors.toSet());
    }

    // *********************************************************************************************
    // retrieve the elements of a card
    // *********************************************************************************************

    /**
     * Get all variants content for the given card
     *
     * @param cardId id of the card
     *
     * @return all card contents of the card
     */
    public List<CardContent> getContentVariants(Long cardId) {
        logger.debug("Get card contents of card #{}", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getContentVariants();
    }

    /**
     * Get all sticky note links of which the given card is the destination
     *
     * @param cardId the id of the card
     *
     * @return all sticky note links linked from the card
     */
    public List<StickyNoteLink> getStickyNoteLinkAsDest(Long cardId) {
        logger.debug("get sticky note links where the card #{} is the destination", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getStickyNoteLinksAsDest();
    }

    /**
     * Get all sticky note links of which the given card is the source
     *
     * @param cardId the id of the card
     *
     * @return all sticky note links linked to the card
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrcCard(Long cardId) {
        logger.debug("get sticky note links where the card #{} is the source", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getStickyNoteLinksAsSrc();
    }

    /**
     * Get all activity flow links of which the given card is the previous one
     *
     * @param cardId the id of the card
     *
     * @return all activity flow links linked to the card
     */
    public List<ActivityFlowLink> getActivityFlowLinkAsPrevious(Long cardId) {
        logger.debug("get activity flow links where the card #{} is the previous one", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getActivityFlowLinksAsPrevious();
    }

    /**
     * Get all activity flow links of which the given card is the next one
     *
     * @param cardId the id of the card
     *
     * @return all activity flow links linked from the card
     */
    public List<ActivityFlowLink> getActivityFlowLinkAsNext(Long cardId) {
        logger.debug("get activity flow links where the card #{} is the next one", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getActivityFlowLinksAsNext();
    }

    /**
     * Retrieve the list of access-control for the given card
     *
     * @param cardId id of the card
     *
     * @return list of access-control
     */
    public List<AccessControl> getAcls(Long cardId) {
        logger.debug("Get Card #{} access-control list", cardId);
        Card card = cardDao.getCard(cardId);
        if (card != null) {
            return card.getAccessControlList();
        } else {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    // *********************************************************************************************
    // dedicated to access control
    // *********************************************************************************************

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the card
     *
     * @param card the card to check
     *
     * @return true iff the card is complete and safe
     */
    public boolean checkIntegrity(Card card) {
        if (card == null) {
            return false;
        }

        boolean isARootCard = card.hasRootCardProject();
        if (!(isARootCard || card.hasCardType())) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    // *********************************************************************************************
    // card type stuff
    // *********************************************************************************************



    // *********************************************************************************************
    //
    // *********************************************************************************************
}
