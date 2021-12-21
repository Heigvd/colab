/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.document.DocumentDao;
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
     * Card content persistence handler
     */
    @Inject
    private CardContentDao cardContentDao;

    // *********************************************************************************************
    // general documents
    // *********************************************************************************************

    /**
     * Complete and persist the given new document
     *
     * @param document the document to persist
     *
     * @return the new persisted document
     */
    public Document createDocument(Document document) {
        logger.debug("create document : {}", document);

        if (document.getDeliverableCardContentId() != null) {
            CardContent cardContent = cardContentDao
                .getCardContent(document.getDeliverableCardContentId());
            if (cardContent == null) {
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }

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
    public Document deleteDocument(Long documentId) {
        logger.debug("delete document #{}", documentId);

        Document document = documentDao.findDocument(documentId);
        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

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
    public List<Block> getBlocksOfDocument(Long documentId) {
        logger.debug("get blocks composing the document #{}", documentId);

        Document document = documentDao.findDocument(documentId);
        if (!(document instanceof BlockDocument)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return ((BlockDocument) document).getBlocks();
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
