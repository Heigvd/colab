/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.ejb.CardFacade;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Objects;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference category specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class ResourceCategoryHelper {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceCategoryHelper.class);

    // *********************************************************************************************
    // injections

    /**
     * Resource / resource reference related logic
     */
    @Inject
    private ResourceManager resourceManager;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /**
     * Card specific logic management
     */
    @Inject
    private CardFacade cardManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;

    // *********************************************************************************************
    // Category management
    // *********************************************************************************************

    /**
     * Set the category of the resource
     *
     * @param resourceOrRefId the id of the resource / resource reference
     * @param categoryName    the name of the category that apply to the resource / resource
     *                        reference
     */
    public void setCategory(Long resourceOrRefId, String categoryName) {
        logger.debug("set category {} to abstract resource #{}", categoryName, resourceOrRefId);

        if (StringUtils.isBlank(categoryName)) {
            removeCategory(resourceOrRefId);
        } else {
            AbstractResource resourceOrRef = resourceManager
                .assertAndGetResourceOrRef(resourceOrRefId);

            resourceOrRef.setCategory(categoryName);
        }
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    public void setCategory(List<Long> resourceOrRefIds, String categoryName) {
        logger.debug("set category {} to abstract resources #{}", categoryName, resourceOrRefIds);

        if (StringUtils.isBlank(categoryName)) {
            removeCategory(resourceOrRefIds);
        } else {
            if (resourceOrRefIds == null) {
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }

            resourceOrRefIds.stream().forEach(resOrRefId -> setCategory(resOrRefId, categoryName));
        }
    }

    /**
     * Remove the category of the resource / resource reference
     *
     * @param resourceOrRefId the id of the resource / resource reference
     */
    public void removeCategory(Long resourceOrRefId) {
        logger.debug("remove category of abstract resource #{}", resourceOrRefId);

        AbstractResource resourceOrRef = resourceManager.assertAndGetResourceOrRef(resourceOrRefId);

        resourceOrRef.setCategory(null);
    }

    /**
     * Remove the category of a list of resources / resource references
     *
     * @param resourceOrRefIds the id of the resources / resource references
     */
    public void removeCategory(List<Long> resourceOrRefIds) {
        logger.debug("remove category to abstract resources #{}", resourceOrRefIds);

        if (resourceOrRefIds == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        resourceOrRefIds.stream().forEach(resOrRefId -> removeCategory(resOrRefId));
    }

    /**
     * Rename the category in a card type / card type reference
     *
     * @param cardTypeOrRefId the id of the card type / card type reference (scope of the renaming)
     * @param projectId       the id of the project concerned (scope of the renaming)
     * @param oldName         the old name of the category
     * @param newName         the new name of the category
     */
    public void renameCategoryInCardType(Long cardTypeOrRefId, Long projectId, String oldName,
        String newName) {
        logger.debug("rename category {} to {} in the abstract card type #{}", oldName, newName,
            cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeOrRefId);

        Long effectiveProjectId = projectId;
        if (projectId == null) {
            effectiveProjectId = cardTypeOrRef.getProjectId();
        }

        renameCategory(cardTypeOrRef, effectiveProjectId, oldName, newName);
    }

    /**
     * Rename the category in a card
     *
     * @param cardId  the id of the card
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    public void renameCategoryInCard(Long cardId, String oldName, String newName) {
        logger.debug("rename category {} to {} in the card #{}", oldName, newName, cardId);

        Card card = cardManager.assertAndGetCard(cardId);

        renameCategory(card, oldName, newName);
    }

    /**
     * Rename the category in a card content
     *
     * @param cardContentId the id of the card content
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    public void renameCategoryInCardContent(Long cardContentId, String oldName, String newName) {
        logger.debug("rename category {} to {} in the card content #{}", oldName, newName,
            cardContentId);

        CardContent cardContent = cardContentManager.assertAndGetCardContent(cardContentId);

        renameCategory(cardContent, oldName, newName);
    }

    // Note : the sub cards card type / card type reference are not changed. Should they ?

    /**
     * Rename the category in a card type / card type reference<br>
     * And do it also for the implementing cards as long as they are of the same project
     *
     * @param cardTypeOrRef the card type / card type reference (scope of the renaming)
     * @param projectId     the id of the project concerned (scope of the renaming)
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    private void renameCategory(AbstractCardType cardTypeOrRef, Long projectId, String oldName,
        String newName) {
        cardTypeOrRef.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        cardTypeOrRef.getImplementingCards().stream()
            .filter(card -> Objects.equals(projectId, card.getProject().getId()))
            .forEach(card -> renameCategory(card, oldName, newName));

        cardTypeOrRef.getDirectReferences().stream()
            .forEach(cardRef -> renameCategory(cardRef, projectId, oldName, newName));
    }

    /**
     * Rename the category in a card<br>
     * And do it also for each card's variants
     *
     * @param card    the card (scope of the renaming)
     * @param oldName the old name of the category
     * @param newName the new name of the category
     */
    private void renameCategory(Card card, String oldName, String newName) {
        card.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        card.getContentVariants().stream()
            .forEach(cardContent -> renameCategory(cardContent, oldName, newName));
    }

    /**
     * Rename the category in a card content<br>
     * And do it also for each sub cards
     *
     * @param cardContent the card content (scope of the renaming)
     * @param oldName     the old name of the category
     * @param newName     the new name of the category
     */
    private void renameCategory(CardContent cardContent, String oldName, String newName) {
        cardContent.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        cardContent.getSubCards().stream().forEach(card -> renameCategory(card, oldName, newName));
    }

    /**
     * Replace the category of the resource if it matches the oldName
     *
     * @param resourceOrRef the resource or resource reference
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    private void renameCategoryIfMatch(AbstractResource resourceOrRef, String oldName,
        String newName) {
        if (Objects.equals(resourceOrRef.getCategory(), oldName)) {
            if (StringUtils.isBlank(newName)) {
                resourceOrRef.setCategory(null);
            } else {
                resourceOrRef.setCategory(StringUtils.trim(newName));
            }
        }
    }
}
