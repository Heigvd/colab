/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.controller.card.grid.Grid;
import ch.colabproject.colab.api.controller.card.grid.GridPosition;
import ch.colabproject.colab.api.controller.common.DeletionManager;
import ch.colabproject.colab.api.controller.document.ResourceReferenceSpreadingHelper;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.acl.Assignment;
import ch.colabproject.colab.api.persistence.jpa.card.CardDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.util.ArrayList;
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
     * Common deletion lifecycle management
     */
    @Inject
    private DeletionManager deletionManager;

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

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;

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
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
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
        return this.getAllCards(rootCard).stream()
                .flatMap(card -> card.getContentVariants().stream())
                .collect(Collectors.toSet());
    }

    // *********************************************************************************************
    // helper
    // *********************************************************************************************

    /**
     * @param card The card
     *
     * @return True if the card is not marked as deleted
     */
    public boolean isAlive(Card card) {
        return card.getDeletionStatus() == null;
    }

    /**
     * @param card the card to check
     *
     * @return True if the card is the root card of a project
     */
    private boolean isARootCard(Card card) {
        return card.hasRootCardProject();
    }

    private CardContent getRootCardContent(Project project) {
        Card rootCard = project.getRootCard();
        return rootCard.getContentVariants().get(0);
    }

    /**
     * @param parent the card content parent
     *
     * @return All not-deleted cards under the given card content.
     */
    public List<Card> getAliveSubCards(CardContent parent) {
        if (parent != null) {
            List<Card> subCardsOfParent = new ArrayList<>(parent.getSubCards());
            return subCardsOfParent.stream().filter(this::isAlive).collect(Collectors.toList());
        }

        return new ArrayList<>();
    }

    private void reorganizeGrid(CardContent parent) {
        if (parent != null) {
            List<Card> aliveSubcards = getAliveSubCards(parent);

            if (!aliveSubcards.isEmpty()) {
                // resolve any conflict in the current situation
                Grid grid = Grid.resolveConflicts(aliveSubcards);
                // ascertain that the min x is 1 and the min y is 1
                grid.shift();
            }
        }
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist a new card into the given card content with the given
     * card type.
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

        resourceReferenceSpreadingHelper.extractReferencesFromUp(card);

        return cardDao.persistCard(card);
    }

    /**
     * Initialize a new card. Card will be bound to the given type.
     * <p>
     * If the type does not belong to the same project as the card do, a type ref
     * is created.
     *
     * @param parent   the parent of the new card
     * @param cardType the related card type. Can be null
     *
     * @return a new card containing a new card content with cardType
     */
    private Card initNewCard(CardContent parent, AbstractCardType cardType) {
        Card card = initNewCard();

        initCardInCardContent(card, parent);

        initCardTypeOfCard(card, parent, cardType);

        return card;
    }

    /**
     * Add the card in its parent and initialize the position of the card in its parent.
     *
     * @param card   the card
     * @param parent the new parent of the card
     */
    private void initCardInCardContent(Card card, CardContent parent) {
        List<Card> aliveSubcards = getAliveSubCards(parent);

        // resolve any conflict in the current situation
        Grid grid = Grid.resolveConflicts(aliveSubcards);
        // reset the grid data of the card
        grid.resetCell(card);
        // then add the card in the grid
        grid.addCell(card);
        // ascertain that xMin = 1 and yMin = 1
        grid.shift();

        // Note : must be set after the grid resolution, else it throws a NPE because of null id
        card.setParent(parent);
        parent.getSubCards().add(card);
    }

    private void initCardTypeOfCard(Card card, CardContent parent, AbstractCardType cardType) {
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
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }
        }
    }

    /**
     * Initialize a new root card. This card contains every other cards of a
     * project.
     * <p>
     * No persistence stuff in there
     *
     * @return a new card dedicated to be the root card of a project
     */
    public Card initNewRootCard() {
        logger.debug("initialize a new root card");

        return initNewCard();
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
     * Put the given card in the bin. (= set DeletionStatus to BIN + set erasure
     * tracking data)
     *
     * @param cardId the id of the card
     */
    public void putCardInBin(Long cardId) {
        logger.debug("put in bin card #{}", cardId);

        Card card = assertAndGetCard(cardId);

        deletionManager.putInBin(card);

        CardContent parent = card.getParent();
        if (parent != null) {
            reorganizeGrid(parent);
        }
    }

    /**
     * Restore from the bin. The object won't contain any deletion or erasure data anymore.
     * <p>
     * It means that the card is back at its place (as much as possible).
     * <p>
     * If the parent card is deleted, the card is moved at the root of the project.
     *
     * @param cardId the id of the card
     */
    public void restoreCardFromBin(Long cardId) {
        logger.debug("restore from bin card #{}", cardId);

        Card card = assertAndGetCard(cardId);

        deletionManager.restoreFromBin(card);

        if (isAnyAncestorDeleted(card)) {
            // if one of its ancestor is deleted, we put the card at root level
            CardContent rootCardContent = getRootCardContent(card.getProject());
            initCardInCardContent(card, rootCardContent);
        }

        CardContent parent = card.getParent();
        if (parent != null) {
            List<Card> aliveSubcards = getAliveSubCards(parent);

            // compute the grid without the cell to move
            aliveSubcards.remove(card);
            Grid grid = Grid.resolveConflicts(aliveSubcards);

            if (!aliveSubcards.isEmpty()) {
                // ascertain that the min x is 1 and the min y is 1
                grid.shift();
            }

            // then add the card
            // So, if the position is taken by another card, its position is recomputed
            grid.addCell(card);
        }
    }

    /**
     * Check if any ancestor of the card is deleted
     *
     * @param card the card
     * @return True iff any ancestor of the card is deleted.
     */
    private boolean isAnyAncestorDeleted(Card card) {
        CardContent parentCardContent = card.getParent();
        if (parentCardContent == null) {
            return false;
        }

        Card parentCard = parentCardContent.getCard();
        if (parentCard == null) {
            return false;
        }

        if (deletionManager.isDeleted(parentCard)) {
            return true;
        } else {
            return isAnyAncestorDeleted(parentCard);
        }
    }

    /**
     * Set the deletion status to TO_DELETE.
     * <p>
     * It means that the card is only visible in the bin panel.
     *
     * @param cardId the id of the card
     */
    public void markCardAsToDeleteForever(Long cardId) {
        logger.debug("mark card #{} as to delete forever", cardId);

        Card card = assertAndGetCard(cardId);

        deletionManager.markAsToDeleteForever(card);
    }

    /**
     * Delete the given card
     *
     * @param cardId the id of the card to delete
     */
    public void deleteCard(Long cardId) {
        Card card = assertAndGetCard(cardId);

        if (!checkDeletionAcceptability(card)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        card.getParent().getSubCards().remove(card);

        if (card.hasCardType()) {
            card.getCardType().getImplementingCards().remove(card);
        }

        cardDao.deleteCard(card);
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
     * Change the position of the card (stay in the same parent, just change
     * position within grid)
     * <p>
     * Recompute the position of all the sister cards
     *
     * @param cardId   the id of the card
     * @param position the new position to set
     */
    public void changeCardPosition(Long cardId, GridPosition position) {
        Card card = this.assertAndGetCard(cardId);
        CardContent parent = card.getParent();
        if (parent != null) {
            List<Card> aliveSubcards = getAliveSubCards(parent);
            // make sure there is no conflict in the current situation
            Grid.resolveConflicts(aliveSubcards);

            // compute the grid without the cell to move
            aliveSubcards.remove(card);
            Grid grid = Grid.resolveConflicts(aliveSubcards);

            card.moveTo(position);
            grid.addCell(card);

            // ascertain that xMin = 1 and yMin = 1
            grid.shift();
        }

        // indexManager.changeItemPosition(card, index, card.getParent().getSubCards());
    }

    /**
     * Move a card to a new parent
     *
     * @param cardId      id of the card to move
     * @param newParentId id of the new parent
     *
     * @throws HttpErrorMessage if card or parent does not exist or if parent is a
     *                          child of the card
     */
    public void moveCard(Long cardId, Long newParentId) {
        Card card = this.assertAndGetCard(cardId);
        CardContent parent = cardContentManager.assertAndGetCardContent(newParentId);
        this.moveCard(card, parent);
    }

    /**
     * Move a card to its grandparent card content. (aka move a level up)
     *
     * @param cardId the id of the card to move
     *
     * @throws HttpErrorMessage if card or parent does not exist
     */
    public void moveCardAbove(Long cardId) {
        Card card = this.assertAndGetCard(cardId);

        if (card.getParent() == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        CardContent destinationCardContent = cardContentManager
                .assertAndGetGrandParentCardContent(card);

        moveCard(card, destinationCardContent);
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
     * @throws HttpErrorMessage if card or parent does not exist or if parent is a
     *                          child of the card
     */
    private void moveCard(Card card, CardContent newParent) {
        if (!checkMoveAcceptability(card, newParent)) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        if (!Objects.equals(card.getParent(), newParent)) {

            CardContent previousParent = card.getParent();
            if (previousParent != null) {
                resourceReferenceSpreadingHelper.spreadDisableResourceDown(card, previousParent);

                previousParent.getSubCards().remove(card);
            }

            // the position on the new parent is all new
            resetCardCoordinates(card);

            List<Card> newParentAliveSubcards = getAliveSubCards(newParent);
            // resolve any conflict in the current situation
            Grid grid = Grid.resolveConflicts(newParentAliveSubcards);
            // then add the card in the grid
            grid.addCell(card);
            // ascertain that xMin = 1 and yMin = 1
            grid.shift();

            card.setParent(newParent);
            newParent.getSubCards().add(card);

            resourceReferenceSpreadingHelper.extractReferencesFromUp(card);
        }
    }

    /**
     * Changes the coordinates of the card to be the default ones
     *
     * @param card the card
     */
    private void resetCardCoordinates(Card card) {
        card.setX(Grid.DEFAULT_X_COORDINATE);
        card.setY(Grid.DEFAULT_Y_COORDINATE);
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
     * @return all sticky note linked from the card
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
     * @return all sticky note linked to the card
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
     * @return all activity flow linked to the card
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
     * @return all activity flow linked from the card
     */
    public List<ActivityFlowLink> getActivityFlowLinkAsNext(Long cardId) {
        logger.debug("get activity flow links where the card #{} is the next one", cardId);

        Card card = assertAndGetCard(cardId);

        return card.getActivityFlowLinksAsNext();
    }

    /**
     * Retrieve the list of assignments for the given card
     *
     * @param cardId id of the card
     *
     * @return list of assignments
     */
    public List<Assignment> getAssignments(Long cardId) {
        logger.debug("Get Card #{} assignments", cardId);

        Card card = assertAndGetCard(cardId);

        return card.getAssignments();
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

    /**
     * Create a card type for a card which has none
     *
     * @param cardId the card id
     */
    public void createCardType(Long cardId) {
        Card card = assertAndGetCard(cardId);
        if (card.getCardType() != null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        CardType newCardType = new CardType();
        newCardType.setProject(card.getProject());
        newCardType.setTitle(card.getTitle());

        cardTypeManager.createCardType(newCardType);

        card.getProject().getElementsToBeDefined().add(newCardType);

        card.setCardType(newCardType);

        newCardType.getImplementingCards().add(card);
    }

    /**
     * Remove the card type of the card.
     * <p>
     * For now, it handles only card types that have no resource
     *
     * @param cardId the card id
     */
    public void removeCardType(Long cardId) {
        Card card = assertAndGetCard(cardId);

        if (card.getCardType() == null) {
            // already ok
            return;
        }

        AbstractCardType cardType = card.getCardType();

        // Just a check to handle only simple cases.
        // When ready to handle everything concerning resources, and also when it is
        // useful, do it
        if (!cardType.getDirectAbstractResources().isEmpty()) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        cardType.getImplementingCards().remove(card);
        card.setCardType(null);
    }

}
