/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.persistence.jpa.card.CardDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;
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
public class CardManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Card persistence handler
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

    // *********************************************************************************************
    // find cards
    // *********************************************************************************************

    /**
     * Retrieve the card. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardId the id of the card
     *
     * @return the card if found
     *
     * @throws HttpErrorMessage if the card was not found
     */
    public Card assertAndGetCard(Long cardId) {
        Card card = cardDao.findCard(cardId);

        if (card == null) {
            logger.error("card #{} not found", cardId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return card;
    }

    // *********************************************************************************************
    // find all recursively
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
            if (!cards.contains(card)) { // prevent cycles
                cards.add(card);
                card.getContentVariants().forEach(content -> queue.addAll(content.getSubCards()));
            }
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
    // helper
    // *********************************************************************************************

    /**
     * @param card the card to check
     *
     * @return True if the card is the root card of a project
     */
    private boolean isARootCard(Card card) {
        return card.hasRootCardProject();
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
     * @param cardTypeId the id of the card type of the new card. Can be null
     *
     * @return a new, initialized and persisted card
     */
    public Card createNewCard(Long parentId, Long cardTypeId) {
        logger.debug("create a new sub card of #{} with the type of #{}", parentId,
            cardTypeId);

        CardContent parent = cardContentManager.assertAndGetCardContent(parentId);

        AbstractCardType cardType;
        if (cardTypeId == null) {
            cardType = null;
        } else {
            cardType = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeId);
        }

        Card card = initNewCard(parent, cardType);

        ResourceReferenceSpreadingHelper.extractReferencesFromUp(card);

        return cardDao.persistCard(card);
    }

    /**
     * Initialize a new card. Card will be bound to the given type.
     * <p>
     * If the type does not belongs to the same project as the card do, a type ref is created.
     *
     * @param parent   the parent of the new card
     * @param cardType the related card type. Can be null
     *
     * @return a new card containing a new card content with cardType
     */
    private Card initNewCard(CardContent parent, AbstractCardType cardType) {
        Card card = initNewCard();

        card.setParent(parent);
        parent.getSubCards().add(card);

        Project project = parent.getProject();
        if (project != null && cardType != null) {
            AbstractCardType effectiveType = cardTypeManager.computeEffectiveCardTypeOrRef(cardType,
                project);

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
                throw HttpErrorMessage.dataIntegrityFailure();
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
     * Delete the given card
     *
     * @param cardId the id of the card to delete
     *
     * @return the freshly deleted card
     */
    public Card deleteCard(Long cardId) {
        Card card = assertAndGetCard(cardId);

        if (!checkDeletionAcceptability(card)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        card.getParent().getSubCards().remove(card);

        if (card.hasCardType()) {
            card.getCardType().getImplementingCards().remove(card);
        }

        return cardDao.deleteCard(cardId);
    }

    /**
     * Ascertain that the card can be deleted
     *
     * @param card the card to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(Card card) {
        // no way to delete the root card
        if (card.getRootCardProject() != null) {
            return false;
        }

        return true;
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
        Card card = this.assertAndGetCard(cardId);
        CardContent parent = cardContentManager.assertAndGetCardContent(newParentId);
        this.moveCard(card, parent);
    }

    /**
     * Move a card to a new parent.
     * <p>
     * Mark all the resource references to the former parent as residual.
     * <p>
     * Make resource references to the new parent.
     *
     * @param card      the card to move
     * @param newParent the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent if a child of the card
     */
    private void moveCard(Card card, CardContent newParent) {
        if (!checkMoveAcceptability(card, newParent)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (!Objects.equals(card.getParent(), newParent)) {

            CardContent previousParent = card.getParent();
            if (previousParent != null) {
                ResourceReferenceSpreadingHelper.spreadResidualMark(card, previousParent);

                previousParent.getSubCards().remove(card);
            }

            card.setParent(newParent);
            newParent.getSubCards().add(card);

            ResourceReferenceSpreadingHelper.extractReferencesFromUp(card);
        }
    }

    /**
     * Ascertain that the given card can be moved to the given card content
     *
     * @param card      the card to move
     * @param newParent the new potential parent of the card
     *
     * @return True iff it can be safely moved
     */
    private boolean checkMoveAcceptability(Card card, CardContent newParent) {
        if (card == null) {
            return false;
        }

        if (newParent == null) {
            return false;
        }

        // Do never move the root card
        if (isARootCard(card)) {
            return false;
        }

        // check if newParent is a child of the card
        Card ancestorOfParent = newParent.getCard();
        while (ancestorOfParent != null) {
            if (ancestorOfParent.equals(card)) {
                return false;
            }
            CardContent parent = ancestorOfParent.getParent();
            if (parent != null) {
                ancestorOfParent = parent.getCard();
            } else {
                ancestorOfParent = null;
            }
        }

        return true;
    }

    // *********************************************************************************************
    // retrieve the elements of a card
    // *********************************************************************************************

    /**
     * Get all variants content for the given card
     *
     * @param cardId the id of the card
     *
     * @return all card contents of the card
     */
    public List<CardContent> getContentVariants(Long cardId) {
        logger.debug("Get card contents of card #{}", cardId);

        Card card = assertAndGetCard(cardId);

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

        Card card = assertAndGetCard(cardId);

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

        Card card = assertAndGetCard(cardId);

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

        Card card = assertAndGetCard(cardId);

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

        Card card = assertAndGetCard(cardId);

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

        Card card = assertAndGetCard(cardId);

        return card.getAccessControlList();
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

        if (!isARootCard(card)) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    // *********************************************************************************************
    //
    // *********************************************************************************************
}
