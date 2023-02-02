/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.link;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.document.BlockManager;
import ch.colabproject.colab.api.controller.document.DocumentManager;
import ch.colabproject.colab.api.controller.document.ResourceManager;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.persistence.jpa.link.StickyNoteLinkDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
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
public class StickyNoteLinkManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(StickyNoteLinkManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Sticky note link persistence handling
     */
    @Inject
    private StickyNoteLinkDao linkDao;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    /**
     * Resource / resource reference logic management
     */
    @Inject
    private ResourceManager resourceManager;

    /**
     * Document specific logic management
     */
    @Inject
    private DocumentManager documentManager;

    /**
     * Block specific logic management
     */
    @Inject
    private BlockManager blockManager;

    // *********************************************************************************************
    //
    // *********************************************************************************************

    /**
     * Possible source types
     *
     * @author sandra
     */
    public enum SrcType {
        /** from a card. */
        CARD,
        /** from a card content. */
        CARD_CONTENT,
        /** from a resource or ref */
        RESOURCE_OR_REF,
        /** from a document */
        DOCUMENT;
    }

    // *********************************************************************************************
    // find sticky note links
    // *********************************************************************************************

    /**
     * Retrieve the sticky note link. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param linkId the id of the sticky note link
     *
     * @return the sticky note link if found
     *
     * @throws HttpErrorMessage if the sticky note link was not found
     */
    public StickyNoteLink assertAndGetStickyNoteLink(Long linkId) {
        StickyNoteLink link = linkDao.findStickyNoteLink(linkId);

        if (link == null) {
            logger.error("sticky note link #{} not found", linkId);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_NOT_FOUND);
        }

        return link;
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

        StickyNoteSourceable sourceObject = assertAndGetSourceObject(link);

        Card toCard = cardManager.assertAndGetCard(link.getDestinationCardId());

        if (link.getExplanation() == null) {
            TextDataBlock explanationTextDataBlock = blockManager.makeNewTextDataBlock();

            link.setExplanation(explanationTextDataBlock);
            explanationTextDataBlock.setExplainingStickyNoteLink(link);
        }

        link.setSrc(sourceObject);
        link.setDestinationCard(toCard);

        sourceObject.getStickyNoteLinksAsSrc().add(link);
        toCard.getStickyNoteLinksAsDest().add(link);

        return linkDao.persistStickyNoteLink(link);
    }

    /**
     * Delete a link
     *
     * @param linkId the id of the link to delete
     */
    public void deleteStickyNoteLink(Long linkId) {
        logger.debug("delete link #{}", linkId);

        // firstly fetch all objects and so ensure that they exist
        StickyNoteLink link = assertAndGetStickyNoteLink(linkId);

        StickyNoteSourceable sourceObject = link.getSrc();
        if (sourceObject == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        Card toCard = link.getDestinationCard();
        if (toCard == null) {
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        // secondly make the modifications
        sourceObject.getStickyNoteLinksAsSrc().remove(link);
        toCard.getStickyNoteLinksAsDest().remove(link);

        linkDao.deleteStickyNoteLink(link);
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
        StickyNoteLink link = assertAndGetStickyNoteLink(linkId);

        StickyNoteSourceable oldSourceObject = assertAndGetSourceObject(link);

        StickyNoteSourceable newSourceObject = assertAndGetSourceObject(newSrcType, newSrcId);

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
        StickyNoteLink link = assertAndGetStickyNoteLink(linkId);

        Card oldDest = cardManager.assertAndGetCard(link.getDestinationCardId());

        Card newDestination = cardManager.assertAndGetCard(newDestId);

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
    private StickyNoteSourceable assertAndGetSourceObject(SrcType srcType, Long srcId) {
        StickyNoteSourceable sourceObject;

        switch (srcType) {
            case CARD:
                sourceObject = cardManager.assertAndGetCard(srcId);
                break;
            case CARD_CONTENT:
                sourceObject = cardContentManager.assertAndGetCardContent(srcId);
                break;
            case RESOURCE_OR_REF:
                sourceObject = resourceManager.assertAndGetResourceOrRef(srcId);
                break;
            case DOCUMENT:
                sourceObject = documentManager.assertAndGetDocument(srcId);
                break;
            default:
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
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
    private StickyNoteSourceable assertAndGetSourceObject(StickyNoteLink link) {
        StickyNoteSourceable sourceObject;

        SrcType srcType = inferSrcType(link);

        switch (srcType) {
            case CARD:
                sourceObject = cardManager.assertAndGetCard(link.getSrcCardId());
                break;
            case CARD_CONTENT:
                sourceObject = cardContentManager
                    .assertAndGetCardContent(link.getSrcCardContentId());
                break;
            case RESOURCE_OR_REF:
                sourceObject = resourceManager
                    .assertAndGetResourceOrRef(link.getSrcResourceOrRefId());
                break;
            case DOCUMENT:
                sourceObject = documentManager.assertAndGetDocument(link.getSrcDocumentId());
                break;
            default:
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
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
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }
            effectiveSrcType = SrcType.CARD_CONTENT;
        }
        if (link.isSrcResourceOrRef()) {
            if (effectiveSrcType != null) { // it must match only one type
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }
            effectiveSrcType = SrcType.RESOURCE_OR_REF;
        }
        if (link.isSrcDocument()) {
            if (effectiveSrcType != null) { // it must match only one type
                throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
            }
            effectiveSrcType = SrcType.DOCUMENT;
        }
        if (effectiveSrcType == null) { // it must match one type
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }

        return effectiveSrcType;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
