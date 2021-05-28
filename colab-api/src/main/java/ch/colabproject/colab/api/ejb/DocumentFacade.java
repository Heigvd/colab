/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
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
     * Document persistence handling
     */
    @Inject
    private DocumentDao documentDao;

    // *********************************************************************************************
    // block document stuff
    // *********************************************************************************************

    /**
     * Get all blocks that make up the document
     *
     * @param documentId id of the document
     *
     * @return all blocks of the document
     */
    public List<Block> getBlocksOfDocument(Long documentId) {
        logger.debug("get blocks of document #{}", documentId);

        Document document = documentDao.findDocument(documentId);
        if (!(document instanceof BlockDocument)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return ((BlockDocument) document).getBlocks();
    }

}
