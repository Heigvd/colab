/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
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
public class DocumentManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(DocumentManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Document persistence handler
     */
    @Inject
    private DocumentDao documentDao;

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

        if (!(document.hasOwningCardContent() || document.hasOwningResource())) {
            return false;
        }

        if (document.hasOwningCardContent() && document.hasOwningResource()) {
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
