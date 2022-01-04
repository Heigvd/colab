/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.link;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.link.ActivityFlowLinkDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Objects;
import java.util.Optional;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Activity flow link specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class ActivityFlowLinkManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ActivityFlowLinkManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************
    /**
     * Activity flow link persistence handling
     */
    @Inject
    private ActivityFlowLinkDao linkDao;

    /**
     * Card persistence handling
     */
    @Inject
    private CardDao cardDao;

    // *********************************************************************************************
    //
    // *********************************************************************************************
    /**
     * Create a link
     *
     * @param link the link to create
     *
     * @return the brand new link
     */
    public ActivityFlowLink createActivityFlowLink(ActivityFlowLink link) {
        logger.debug("create activity flow link {}", link);

        // validation
        if (!isValid(link.getPreviousCardId(), link.getNextCardId())) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        // fetch all objects and so ensure that they exist
        Card previousCard = cardDao.getCard(link.getPreviousCardId());
        if (previousCard == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        Card nextCard = cardDao.getCard(link.getNextCardId());
        if (nextCard == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        if (!previousCard.getProject().equals(nextCard.getProject())) {
            // prevent cross-project dependencies
            throw HttpErrorMessage.badRequest();
        }

        ActivityFlowLink existingLink = getLink(previousCard, nextCard);

        if (existingLink != null) {
            // return pre-existing link silently
            return existingLink;
        } else {
            // Such a link does not exist yet
            // then make the modifications
            link.setPreviousCard(previousCard);
            link.setNextCard(nextCard);

            ActivityFlowLink persistedLink = linkDao.persistActivityFlowLink(link);

            previousCard.getActivityFlowLinksAsPrevious().add(persistedLink);
            nextCard.getActivityFlowLinksAsNext().add(persistedLink);

            return persistedLink;
        }
    }

    /**
     * Get any activity link from previous card to next card.
     *
     * @param previous link starting point
     * @param next     link end point
     *
     * @return the link if it exists or null
     */
    private ActivityFlowLink getLink(Card previous, Card next) {
        // make sur not to create same link twice
        Optional<ActivityFlowLink> find = previous.getActivityFlowLinksAsPrevious().stream()
            .filter(l -> l.getNextCard().equals(next))
            .findFirst();
        if (find.isEmpty()) {
            return null;
        } else {
            return find.get();
        }
    }

    /**
     * Delete a link
     *
     * @param linkId the id of the link to delete
     */
    public void deleteActivityFlowLink(Long linkId) {
        logger.debug("delete activity flow link #{}", linkId);

        // fetch all objects and so ensure that they exist
        ActivityFlowLink link = linkDao.findActivityFlowLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
            // or just return. see what is best
        }

        Card previousCard = link.getPreviousCard();
        if (previousCard == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card nextCard = link.getNextCard();
        if (nextCard == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        // then make the modifications
        previousCard.getActivityFlowLinksAsPrevious().remove(link);
        nextCard.getActivityFlowLinksAsNext().remove(link);

        linkDao.deleteActivityFlowLink(linkId);
    }

    /**
     * Change the previous card
     *
     * @param linkId            the id of the link to update
     * @param newPreviousCardId the id of the new previous card
     */
    public void changeActivityFlowLinkPrevious(Long linkId, Long newPreviousCardId) {
        logger.debug("change previous card of activity flow link #{} with #{}", linkId,
            newPreviousCardId);

        // fetch all objects and so ensure that they exist
        ActivityFlowLink link = linkDao.findActivityFlowLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // validation
        if (!isValid(newPreviousCardId, link.getNextCardId())) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card oldPreviousCard = cardDao.getCard(link.getPreviousCardId());
        if (oldPreviousCard == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card newPreviousCard = cardDao.getCard(newPreviousCardId);
        if (newPreviousCard == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        ActivityFlowLink existingLink = getLink(newPreviousCard, link.getNextCard());
        if (existingLink != null) {
            // such a link already exists
            // preserve pre-existing and delete this one
            deleteActivityFlowLink(link.getId());
        } else {
            // then make the modifications
            oldPreviousCard.getActivityFlowLinksAsPrevious().remove(link);

            link.setPreviousCard(newPreviousCard);
            newPreviousCard.getActivityFlowLinksAsPrevious().add(link);
        }
    }

    /**
     * Change the next card
     *
     * @param linkId        the id of the link to update
     * @param newNextCardId the id of the new next card
     */
    public void changeActivityFlowLinkNext(Long linkId, Long newNextCardId) {
        logger.debug("change next card of activity flow link #{} with #{}", linkId,
            newNextCardId);

        // fetch all objects and so ensure that they exist
        ActivityFlowLink link = linkDao.findActivityFlowLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // validation
        if (!isValid(link.getPreviousCardId(), newNextCardId)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card oldNext = cardDao.getCard(link.getNextCardId());
        if (oldNext == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card newNext = cardDao.getCard(newNextCardId);
        if (newNext == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        ActivityFlowLink existingLink = getLink(link.getPreviousCard(), newNext);
        if (existingLink != null) {
            // such a link already exists
            // preserve pre-existing and delete this one
            deleteActivityFlowLink(link.getId());
        } else {
            // then make the modifications
            oldNext.getActivityFlowLinksAsNext().remove(link);

            link.setNextCard(newNext);
            newNext.getActivityFlowLinksAsNext().add(link);
        }
    }

    /**
     * Check if the link is valid
     *
     * @param previousCardId the id of the previous card
     * @param nextCardId     the id of the next card
     *
     * @return
     */
    private boolean isValid(Long previousCardId, Long nextCardId) {
        return !Objects.equals(previousCardId, nextCardId);
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************
}
