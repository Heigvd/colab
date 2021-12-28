/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.card;

import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;

/**
 * Card content specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardContentManager {

    /** logger */
    //private static final Logger logger = LoggerFactory.getLogger(CardContentManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

//    /**
//     * Access control manager
//     */
//    @Inject
//    private SecurityFacade securityFacade;

    /**
     * Card content persistence handler
     */
    @Inject
    private CardContentDao cardContentDao;

    // *********************************************************************************************
    // find card contents
    // *********************************************************************************************

    /**
     * Retrieve the card content. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param cardContentId the id of the card content
     *
     * @return the card content if found
     *
     * @throws HttpErrorMessage if the card content was not found
     */
    public CardContent assertAndGetCardContent(Long cardContentId) {
        CardContent cardContent = cardContentDao.getCardContent(cardContentId);

        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return cardContent;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************



    // *********************************************************************************************
    //
    // *********************************************************************************************
}
