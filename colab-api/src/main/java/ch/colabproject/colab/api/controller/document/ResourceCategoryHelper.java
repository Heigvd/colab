/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.document.ResourceDao;
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
     * Resource persistence handler
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * Card type persistence handler
     */
    @Inject
    private CardTypeDao cardTypeDao;

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
    private CardManager cardManager;

    /**
     * Card content specific logic management
     */
    @Inject
    private CardContentManager cardContentManager;
    /**
     * TO sudo
     */
    @Inject
    private RequestManager requestManager;

    // *********************************************************************************************
    // Category management
    // *********************************************************************************************

    /**
     * Set the category of the resource.
     * <p>
     * Also update the resources that reference this one, as long as the category is synchronized
     *
     * @param resourceOrRefId the id of the resource / resource reference
     * @param categoryName    the name of the category that apply to the resource / resource
     *                        reference
     */
    public void changeCategory(Long resourceOrRefId, String categoryName) {
        logger.debug("set category {} to abstract resource #{}", categoryName, resourceOrRefId);

        AbstractResource resourceOrRef = resourceManager.assertAndGetResourceOrRef(resourceOrRefId);

        String oldCategoryName = resourceOrRef.getCategory();
        String newCategoryName = StringUtils.trimToNull(categoryName);

        resourceOrRef.setCategory(newCategoryName);

        requestManager.sudo(() -> {
            // also change the resources based on the given one
            // but only if the category is still synchronized
            List<ResourceRef> directRefs = resourceDao.findDirectReferences(resourceOrRef);
            for (ResourceRef ref : directRefs) {
                if (StringUtils.equals(ref.getCategory(), oldCategoryName)) {
                    changeCategory(ref.getId(), newCategoryName);
                }

            }
        });
    }

    /**
     * Set the category of a list of resources
     *
     * @param resourceOrRefIds the id of the resources / resource references
     * @param categoryName     the name of the category that apply to the resource / resource
     *                         reference
     */
    public void changeCategory(List<Long> resourceOrRefIds, String categoryName) {
        logger.debug("set category {} to abstract resources #{}", categoryName, resourceOrRefIds);

        if (resourceOrRefIds == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        resourceOrRefIds.stream().forEach(resOrRefId -> changeCategory(resOrRefId, categoryName));
    }

    /**
     * Rename the category in a card type / card type reference
     *
     * @param cardTypeOrRefId the id of the card type / card type reference (scope of the renaming)
     * @param oldName         the old name of the category
     * @param newName         the new name of the category
     */
    public void renameCategoryInCardType(Long cardTypeOrRefId, String oldName,
        String newName) {
        logger.debug("rename category {} to {} in the abstract card type #{}", oldName, newName,
            cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeOrRefId);

        requestManager.sudo(() -> {
            renameCategory(cardTypeOrRef, oldName, newName);
        });
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

        requestManager.sudo(() -> {
            renameCategory(card, oldName, newName);
        });
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

        requestManager.sudo(() -> {
            renameCategory(cardContent, oldName, newName);
        });
    }

    /**
     * Rename the category in a card type / card type reference<br>
     * And do it also for the implementing cards and for its reference card types
     *
     * @param cardTypeOrRef the card type / card type reference (scope of the renaming)
     * @param oldName       the old name of the category
     * @param newName       the new name of the category
     */
    private void renameCategory(AbstractCardType cardTypeOrRef,
        String oldName, String newName) {
        cardTypeOrRef.getDirectAbstractResources().stream()
            .forEach(resourceOrRef -> renameCategoryIfMatch(resourceOrRef, oldName, newName));

        cardTypeOrRef.getImplementingCards().stream()
            .forEach(card -> renameCategory(card, oldName, newName));

        cardTypeDao.findDirectReferences(cardTypeOrRef).stream()
            .forEach(cardRef -> renameCategory(cardRef, oldName, newName));
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
        if (Objects.equals(
            StringUtils.trimToNull(resourceOrRef.getCategory()),
            StringUtils.trimToNull(oldName))) {
            resourceOrRef.setCategory(StringUtils.trimToNull(newName));
        }
    }
}
