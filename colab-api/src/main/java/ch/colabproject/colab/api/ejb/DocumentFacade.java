/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Document specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class DocumentFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentFacade.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Document persistence handler
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    // *********************************************************************************************
    // find document
    // *********************************************************************************************

    /**
     * Retrieve the document. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param documentId the id of the document
     *
     * @return the document if found
     *
     * @throws HttpErrorMessage if the document was not found
     */
    public Document assertAndGetDocument(Long documentId) {
        Document document = documentDao.findDocument(documentId);

        if (document == null) {
            logger.error("document #{} not found", documentId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return document;
    }

    /**
     * Retrieve the block document. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param documentId the id of the block document
     *
     * @return the block document if found
     *
     * @throws HttpErrorMessage if the block document was not found
     */
    public BlockDocument assertAndGetBlockDocument(Long documentId) {
        Document document = documentDao.findDocument(documentId);

        if (!(document instanceof BlockDocument)) {
            logger.error("block document #{} not found", documentId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return (BlockDocument) document;
    }

    /**
     * Assert that the block document is not null. If not throw a {@link HttpErrorMessage}.
     *
     * @param blockDocument the block document to check
     *
     * @throws HttpErrorMessage if the block document is null
     */
    public void assertBlockDocument(BlockDocument blockDocument) {
        if (blockDocument == null) {
            logger.error("block document {} not found", blockDocument);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Persist the given new document
     *
     * @param document the document to persist
     *
     * @return the new persisted document
     */
    public Document persistDocument(Document document) {
        return documentDao.persistDocument(document);
    }

    /**
     * Complete and persist the given new document
     *
     * @param document the document to persist
     *
     * @return the new persisted document
     */
    // TODO no effective use. To destroy during RestEndpoint cleaning
    public Document createDocument(Document document) {
        logger.debug("create document : {}", document);

        if (document.getDeliverableCardContentId() != null) {
            CardContent cardContent = cardContentManager
                .assertAndGetCardContent(document.getDeliverableCardContentId());

            cardContent.setDeliverable(document);
            document.setDeliverableCardContent(cardContent);
        }

        if (document.getResourceId() != null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        return documentDao.persistDocument(document);
    }

    /**
     * Delete the given document
     *
     * @param documentId the id of the document to delete
     *
     * @return the freshly deleted document
     */
    // TODO no effective use. To destroy during RestEndpoint cleaning
    public Document deleteDocument(Long documentId) {
        logger.debug("delete document #{}", documentId);

        Document document = assertAndGetDocument(documentId);

        CardContent cardContent = document.getDeliverableCardContent();
        if (cardContent != null) {
            cardContent.setDeliverable(null);
        }

        // to check : resource handling

        return documentDao.deleteDocument(documentId);
    }

    // *********************************************************************************************
    // block documents
    // *********************************************************************************************

    /**
     * Get all blocks that make up the document
     *
     * @param documentId the id of the document
     *
     * @return all blocks of the document
     */
    // TODO To move into BlockFacade during RestEndpoint cleaning
    public List<Block> getBlocksOfDocument(Long documentId) {
        logger.debug("get blocks composing the document #{}", documentId);

        BlockDocument document = assertAndGetBlockDocument(documentId);

        return document.getBlocks();
    }

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the document
     *
     * @param document the document to check
     *
     * @return true iff the document is complete and safe
     */
    public boolean checkIntegrity(Document document) {
        if (document == null) {
            return false;
        }

        if (!(document.hasDeliverableCardContent() || document.hasResource())) {
            return false;
        }

        if (document.hasDeliverableCardContent() && document.hasResource()) {
            return false;
        }

        // TODO if is a deliverable card content, there must be only one card content that use it

        if (document instanceof BlockDocument) {
            return checkBlockDocumentSpecificIntegrity((BlockDocument)document);
        } else {
            return true;
        }
    }

    private boolean checkBlockDocumentSpecificIntegrity(BlockDocument document) {
        // not twice the same index
//        List<Block> blocks = document.getBlocks();
//        if (!CollectionUtils.isEmpty(blocks)) {
            // TODO
//        }
        // TODO delete that. It is just to satisfy PMD
        if (document == null) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

    // As a document is either linked to a resource or to a card content, most of the operations are
    // made from there

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
