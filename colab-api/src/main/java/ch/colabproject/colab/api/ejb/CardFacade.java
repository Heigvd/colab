/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.card.CardContentStatus;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.card.CardTypeRef;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.card.CardContentDao;
import ch.colabproject.colab.api.persistence.card.CardDao;
import ch.colabproject.colab.api.persistence.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.document.DocumentDao;
import ch.colabproject.colab.api.persistence.project.ProjectDao;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.List;
import java.util.Optional;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Card, card type and card content specific logic
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class CardFacade {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(CardFacade.class);

    /**
     * Minimal completion level
     */
    private static final int MIN_COMPLETION_LEVEL = 0;

    /**
     * Initial card status
     */
    private static final CardContentStatus CARD_CONTENT_INITIAL_STATUS = CardContentStatus.ACTIVE;

    // *********************************************************************************************
    // injections
    // *********************************************************************************************
    /**
     * Card type persistence handling
     */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Card persistence
     */
    @Inject
    private CardDao cardDao;

    /**
     * Card content persistence handling
     */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Project persistence handling
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Document persistence handling
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * To check access rights
     */
    @Inject
    private SecurityFacade securityFacade;

    // *********************************************************************************************
    // card type stuff
    // *********************************************************************************************
    /**
     * Create a new card type. The new type will be a global type if the type is not bound to
     * any project.
     *
     * @param cardType the type to create
     *
     * @return a new, persisted card type
     */
    public CardType createNewCardType(CardType cardType) {
        Long projectId = cardType.getProjectId();
        if (projectId != null) {
            logger.debug("create a new card type in the project #{}", projectId);
            Project project = projectDao.getProject(projectId);
            if (project == null) {
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }
            securityFacade.assertCanCreateCardType(project);
            project.getElementsToBeDefined().add(cardType);
            cardType.setProject(project);
        } else {
            logger.debug("create a new global card type");
            securityFacade.assertCurrentUserIsAdmin();
            cardType.setProject(null);
        }

        initNewCardType(cardType);
        cardTypeDao.createCardType(cardType);

        return cardType;
    }

    /**
     * @return a new card type initialized object
     */
    private CardType initNewCardType(CardType cardType) {
        // see if uniqueId must be initialized
        return cardType;
    }

    /**
     * Get all abstract resources of a given card type.
     *
     * @param cardTypeId the id of the card type
     *
     * @return all abstract resources directly linked to the card type
     */
    public List<AbstractResource> getDirectAbstractResourcesOfCardType(Long cardTypeId) {
        logger.debug("get abstract resources directly linked to card type #{}", cardTypeId);
        CardType cardType = cardTypeDao.getCardType(cardTypeId);
        if (cardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return cardType.getDirectAbstractResources();
    }

    // *********************************************************************************************
    // card stuff
    // *********************************************************************************************
    /**
     * Initialize a new root card. This card contains every other cards of a project.
     * <p>
     * No persistence stuff in there
     *
     * @return a new card dedicated to be the root card of a project
     */
    public Card initNewRootCard() {
        logger.debug("initialize a new root card");

        Card rootCard = initNewCard();
        rootCard.setIndex(0);

        return rootCard;
    }

    /**
     * Create a new card into a card content with a card type
     *
     * @param parentId   parent id of the new card
     * @param cardTypeId card type id of the new card
     *
     * @return a new, initialized and persisted card
     */
    public Card createNewCard(Long parentId, Long cardTypeId) {
        logger.debug("create a new sub card of #{} with the type of #{}", parentId,
            cardTypeId);

        CardContent parent = cardContentDao.getCardContent(parentId);
        if (parent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        AbstractCardType cardType = cardTypeDao.getAbstractCardType(cardTypeId);
        if (cardType == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // check type read access and parent write right
        securityFacade.assertCanCreateCard(parent, cardType);

        Card card = initNewCard(parent, cardType);

        return cardDao.createCard(card);
    }

    /**
     * Create a type reference to the given type. The ref will belongs to the given project.
     *
     * @param cardType type to reference
     * @param project  reference owner
     *
     * @return the reference
     */
    private CardTypeRef createReference(AbstractCardType cardType, Project project) {
        CardTypeRef ref = new CardTypeRef();
        ref.setProject(project);
        ref.setAbstractCardType(cardType);
        // TODO: copy deprecated state or do never deprecate just created types?
        //ref.setDeprecated(cardType.isDeprecated());
        ref.setDeprecated(false);
        ref.setPublished(false);

        cardTypeDao.createCardType(ref);
        project.getElementsToBeDefined().add(ref);
        return ref;
    }

    /**
     * Initialize card. Card will be bound to the given type. If the type does not belongs to the
     * same project as the card do, a type ref is created.
     *
     * @param parent   Parent of the new card
     * @param cardType Related card type
     *
     * @return a new card containing a new card content with cardType
     */
    private Card initNewCard(CardContent parent, AbstractCardType cardType) {
        Card card = initNewCard();

        card.setParent(parent);
        parent.getSubCards().add(card);

        Project project = parent.getProject();

        if (project != null) {
            AbstractCardType effectiveType = null;
            if (project.equals(cardType.getProject())) {
                //Given type belongs to the project
                // it can be used as-is
                effectiveType = cardType;
            } else {
                // second case: cardType belongs to another project

                // shall we check something to prevent extending same type several times?
                //
                // Check if the project already got a direct reference the super-type
                Optional<AbstractCardType> findFirst = project.getElementsToBeDefined().stream()
                    .filter(type -> {
                        return this.isDirectRef(type, cardType);
                    }).findFirst();

                if (findFirst.isPresent()) {
                    // direct ref found, reuse it
                    effectiveType = findFirst.get();
                } else {
                    // no direct ref. Create one.
                    effectiveType = createReference(cardType, project);
                }
            }

            if (effectiveType != null) {
                card.setCardType(effectiveType);
                effectiveType.getImplementingCards().add(card);

            } else {
                logger.error("Unable to find effective type for {}", cardType);
                throw HttpErrorMessage.relatedObjectNotFoundError();
            }
        }

        return card;
    }

    /**
     * Is the given child a direct reference to the given parent
     *
     * @param child  the child
     * @param parent the parent
     *
     * @return true if child is a direct reference to the parent
     */
    public boolean isDirectRef(AbstractCardType child, AbstractCardType parent) {
        if (child instanceof CardTypeRef) {
            CardTypeRef ref = (CardTypeRef) child;
            AbstractCardType refTarget = ref.getAbstractCardType();
            return parent != null && parent.equals(refTarget);
        }
        return false;
    }

    /**
     * Is the given ancestor an ancestor of the given child
     *
     * @param child    the child
     * @param ancestor the ancestor
     *
     * @return true if child is a ref and if ancestor is an ancestor of the ref
     */
    public boolean isTransitiveRef(AbstractCardType child, AbstractCardType ancestor) {
        if (isDirectRef(child, ancestor)) {
            return true;
        } else if (child instanceof CardTypeRef) {
            AbstractCardType parent = ((CardTypeRef) child).getAbstractCardType();
            return this.isTransitiveRef(parent, ancestor);
        }

        return false;
    }

    /**
     * @return a new card containing a new card content
     */
    private Card initNewCard() {
        Card card = new Card();

        initNewCardContent(card);

        return card;
    }

    /**
     * Get all variants content for the given card
     *
     * @param cardId id of the card
     *
     * @return all card contents of the card
     */
    public List<CardContent> getContentVariants(Long cardId) {
        logger.debug("Get card contents of card #{}", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getContentVariants();
    }

    /**
     * Get all abstract resources of a given card.
     *
     * @param cardId the id of the card
     *
     * @return all abstract resources directly linked to the card
     */
    public List<AbstractResource> getDirectAbstractResourcesOfCard(Long cardId) {
        logger.debug("get abstract resources directly linked to card #{}", cardId);
        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return card.getDirectAbstractResources();
    }

    // *********************************************************************************************
    // card content stuff
    // *********************************************************************************************

    /**
     * Create a new card content variant for the card
     *
     * @param cardId id of the card needing a new card content variant
     *
     * @return a new, initialized and persisted card content
     */
    public CardContent createNewCardContent(Long cardId) {
        logger.debug("create a new card content for the card #{}", cardId);

        Card card = cardDao.getCard(cardId);
        if (card == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        securityFacade.assertCanCreateCardContent(card);

        CardContent cardContent = initNewCardContent(card);

        return cardContentDao.createCardContent(cardContent);
    }

    /**
     * @param card the card needing a new card content
     *
     * @return a new, initialized card content
     */
    private CardContent initNewCardContent(Card card) {
        CardContent cardContent = new CardContent();
        cardContent.setStatus(CARD_CONTENT_INITIAL_STATUS);
        cardContent.setCompletionLevel(MIN_COMPLETION_LEVEL);
        cardContent.setCard(card);
        card.getContentVariants().add(cardContent);
        return cardContent;
    }

    /**
     * Get all sub cards of a given card content
     *
     * @param cardContentId id of the card content
     *
     * @return all cards of the card content
     */
    public List<Card> getSubCards(Long cardContentId) {
        logger.debug("get sub cards of card content #{}", cardContentId);
        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return cardContent.getSubCards();
    }

    /**
     * Set the deliverable to the card content
     *
     * @param cardContentId the id of the card content
     * @param document      the document to use as deliverable. It must be a new document
     *
     * @return the newly created document
     */
    public Document assignDeliverable(Long cardContentId, Document document) {
        logger.debug("set deliverable {} to card content #{}", document, cardContentId);

        if (document == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        // A document can be related at max to one card content
        if (document.hasDeliverableCardContent()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        securityFacade.assertCanCreateDeliverable(document, cardContent);

        cardContent.setDeliverable(document);
        document.setDeliverableCardContent(cardContent);

        Document persistedDocument = documentDao.persistDocument(document);

        return persistedDocument;
    }

    /**
     * Get all abstract resources of a given card content.
     *
     * @param cardContentId the id of the card content
     *
     * @return all abstract resources directly linked to the card content
     */
    public List<AbstractResource> getDirectAbstractResourcesOfCardContent(Long cardContentId) {
        logger.debug("get abstract resources directly linked to card content #{}", cardContentId);
        CardContent cardContent = cardContentDao.getCardContent(cardContentId);
        if (cardContent == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }
        return cardContent.getDirectAbstractResources();
    }

}
