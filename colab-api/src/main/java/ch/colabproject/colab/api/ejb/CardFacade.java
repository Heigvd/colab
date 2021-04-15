/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.Card;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;

/**
 * Card specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardFacade {

    /**
     * Create a new root card. This card contains every other cards of a project.
     *
     * @return a new card dedicated to be the root card of a project
     */
    public Card createRootCard() {
        Card rootCard = new Card();
        // See if something special about it
        return rootCard;
    }
}
