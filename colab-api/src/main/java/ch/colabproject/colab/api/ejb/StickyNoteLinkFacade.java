/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.document.AbstractResourceDao;
import ch.colabproject.colab.api.persistence.document.BlockDao;
import ch.colabproject.colab.api.persistence.link.StickyNoteLinkDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Sticky note link specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class StickyNoteLinkFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(StickyNoteLinkFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Sticky note link persistence handling
     */
    @Inject
    private StickyNoteLinkDao linkDao;

    /**
     * Card persistence handling
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card content persistence handling
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Resource persistence handling
     */
    @Inject
    private AbstractResourceDao resourceOrRefDao;

    /**
     * Block persistence handling
     */
    @Inject
    private BlockDao blockDao;

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Possible source types
     *
     * @author sandra
     */
    public enum SrcType {
        CARD,
        CARD_CONTENT,
        RESOURCE_OR_REF,
        BLOCK;
    }

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
    public StickyNoteLink createStickyNoteLink(StickyNoteLink link) {
        logger.debug("create link {}", link);

        // firstly fetch all objects and so ensure that they exist
        StickyNoteSourceable sourceObject = findSourceObject(link);
        if (sourceObject == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        Card toCard = cardDao.getCard(link.getDestinationCardId());
        if (toCard == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // secondly make the modifications
        link.setSrc(sourceObject);
        link.setDestinationCard(toCard);
        StickyNoteLink persistedLink = linkDao.persistStickyNoteLink(link);

        sourceObject.getStickyNoteLinksAsSrc().add(persistedLink);
        toCard.getStickyNoteLinksAsDest().add(persistedLink);

        return persistedLink;
    }

    /**
     * Delete a link
     *
     * @param linkId the id of the link to delete
     */
    public void deleteStickyNoteLink(Long linkId) {
        logger.debug("delete link #{}", linkId);

        // firstly fetch all objects and so ensure that they exist
        StickyNoteLink link = linkDao.findStickyNoteLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
            // or just return. see what is best
        }

        StickyNoteSourceable sourceObject = link.getSrc();
        if (sourceObject == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card toCard = link.getDestinationCard();
        if (toCard == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        // secondly make the modifications
        sourceObject.getStickyNoteLinksAsSrc().remove(link);
        toCard.getStickyNoteLinksAsDest().remove(link);

        linkDao.deleteStickyNoteLink(linkId);
    }

    /**
     * Change the source
     *
     * @param linkId     the id of the link to update
     * @param newSrcType the type of the new source
     * @param newSrcId   the id of the new source
     */
    public void changeStickyNoteLinkSource(Long linkId, SrcType newSrcType, Long newSrcId) {
        logger.debug("change source of link #{} with {} #{}", linkId, newSrcType, newSrcId);

        // firstly fetch all objects and so ensure that they exist
        StickyNoteLink link = linkDao.findStickyNoteLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        StickyNoteSourceable oldSourceObject = findSourceObject(link);
        if (oldSourceObject == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        StickyNoteSourceable newSourceObject = findSourceObject(newSrcType, newSrcId);
        if (newSourceObject == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // secondly make the modifications
        oldSourceObject.getStickyNoteLinksAsSrc().remove(link);

        link.setSrc(newSourceObject);
        newSourceObject.getStickyNoteLinksAsSrc().add(link);
    }

    /**
     * Change the destination
     *
     * @param linkId    the id of the link to update
     * @param newDestId the id of the new destination card
     */
    public void changeStickyNoteLinkDestination(Long linkId, Long newDestId) {
        logger.debug("change destination of link #{} with #{}", linkId, newDestId);

        // firstly fetch all objects and so ensure that they exist
        StickyNoteLink link = linkDao.findStickyNoteLink(linkId);
        if (link == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        Card oldDest = cardDao.getCard(link.getDestinationCardId());
        if (oldDest == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Card newDestination = cardDao.getCard(newDestId);
        if (newDestination == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // secondly make the modifications
        oldDest.getStickyNoteLinksAsDest().remove(link);

        link.setDestinationCard(newDestination);
        newDestination.getStickyNoteLinksAsDest().add(link);
    }

    /**
     * Get the source object corresponding to the given type and id.
     *
     * @param srcType the source type
     * @param srcId   the id of the source
     *
     * @return the source of the sticky note
     */
    private StickyNoteSourceable findSourceObject(SrcType srcType, Long srcId) {
        StickyNoteSourceable sourceObject;

        switch (srcType) {
            case CARD:
                sourceObject = cardDao.getCard(srcId);
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case CARD_CONTENT:
                sourceObject = cardContentDao.getCardContent(srcId);
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case RESOURCE_OR_REF:
                sourceObject = resourceOrRefDao.findResourceOrRef(srcId);
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case BLOCK:
                sourceObject = blockDao.findBlock(srcId);
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            default:
                throw HttpErrorMessage.dataIntegrityFailure();
        }

        return sourceObject;
    }

    /**
     * Get the source object of the link
     *
     * @param link the link
     *
     * @return the source object
     */
    private StickyNoteSourceable findSourceObject(StickyNoteLink link) {
        StickyNoteSourceable sourceObject;

        SrcType srcType = inferSrcType(link);

        switch (srcType) {
            case CARD:
                sourceObject = cardDao.getCard(link.getSrcCardId());
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case CARD_CONTENT:
                sourceObject = cardContentDao.getCardContent(link.getSrcCardContentId());
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case RESOURCE_OR_REF:
                sourceObject = resourceOrRefDao.findResourceOrRef(link.getSrcResourceOrRefId());
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            case BLOCK:
                sourceObject = blockDao.findBlock(link.getSrcBlockId());
                if (sourceObject == null) {
                    throw HttpErrorMessage.dataIntegrityFailure();
                }
                break;
            default:
                throw HttpErrorMessage.dataIntegrityFailure();
        }

        return sourceObject;
    }

    /**
     * Infer the source type of the link.
     * <p>
     * It can have one and only one source.
     *
     * @param link the link
     *
     * @return the source type used
     */
    private SrcType inferSrcType(StickyNoteLink link) {
        SrcType effectiveSrcType = null;

        if (link.isSrcCard()) {
            effectiveSrcType = SrcType.CARD;
        }
        if (link.isSrcCardContent()) {
            if (effectiveSrcType != null) { // it must match only one type
                throw HttpErrorMessage.dataIntegrityFailure();
            }
            effectiveSrcType = SrcType.CARD_CONTENT;
        }
        if (link.isSrcResourceOrRef()) {
            if (effectiveSrcType != null) { // it must match only one type
                throw HttpErrorMessage.dataIntegrityFailure();
            }
            effectiveSrcType = SrcType.RESOURCE_OR_REF;
        }
        if (link.isSrcBlock()) {
            if (effectiveSrcType != null) { // it must match only one type
                throw HttpErrorMessage.dataIntegrityFailure();
            }
            effectiveSrcType = SrcType.BLOCK;
        }
        if (effectiveSrcType == null) { // it must match one type
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        return effectiveSrcType;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
