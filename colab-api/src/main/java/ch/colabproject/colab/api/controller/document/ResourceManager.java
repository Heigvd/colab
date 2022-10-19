/*
 * The coLAB project
 * Copyright (C) 2021-2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.controller.DuplicationManager;
import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.controller.card.CardContentManager;
import ch.colabproject.colab.api.controller.card.CardManager;
import ch.colabproject.colab.api.controller.card.CardTypeManager;
import ch.colabproject.colab.api.controller.project.ProjectManager;
import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.DuplicationParam;
import ch.colabproject.colab.api.model.card.AbstractCardType;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardContent;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.jpa.card.CardContentDao;
import ch.colabproject.colab.api.persistence.jpa.card.CardDao;
import ch.colabproject.colab.api.persistence.jpa.card.CardTypeDao;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.api.persistence.jpa.document.ResourceDao;
import ch.colabproject.colab.api.rest.document.bean.ResourceExternalReference;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Resource and resource reference specific logic
 *
 * @author sandra
 */
// TODO requestingForGlory handling
@Stateless
@LocalBean
public class ResourceManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ResourceManager.class);

    // *********************************************************************************************
    // injections
    // *********************************************************************************************

    /**
     * Resource / resource reference persistence handling
     */
    @Inject
    private ResourceDao resourceDao;

    /**
     * Document persistence handling
     */
    @Inject
    private DocumentDao documentDao;

    /**
     * Document specific logic
     */
    @Inject
    private DocumentManager documentManager;

    /**
     * Card type specific logic management
     */
    @Inject
    private CardTypeManager cardTypeManager;

    /** to load cardTypes */
    @Inject
    private CardTypeDao cardTypeDao;

    /**
     * Card specific logic management
     */
    @Inject
    private CardManager cardManager;

    /** to load cards */
    @Inject
    private CardDao cardDao;

    /** to load cardContents */
    @Inject
    private CardContentManager cardContentManager;

    /** to load cards */
    @Inject
    private CardContentDao cardContentDao;

    /**
     * Block specific logic management
     */
    @Inject
    private BlockManager blockManager;

    /**
     * Project specific logic management
     */
    @Inject
    private ProjectManager projectManager;
    /**
     * TO sudo
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Index generation specific logic management
     */
    @Inject
    private IndexGeneratorHelper<Document> indexGenerator;

    /**
     * Resource reference spreading specific logic handling
     */
    @Inject
    private ResourceReferenceSpreadingHelper resourceReferenceSpreadingHelper;

    /**
     * File persistence management
     */
    @Inject
    private FileManager fileManager;

    // *********************************************************************************************
    // find resource
    // *********************************************************************************************

    /**
     * Retrieve the resource (or reference). If not found, throw a {@link HttpErrorMessage}.
     *
     * @param resourceOrRefId the id of the resource or reference
     *
     * @return the resource or reference if found
     *
     * @throws HttpErrorMessage if the resource or reference was not found
     */
    public AbstractResource assertAndGetResourceOrRef(Long resourceOrRefId) {
        AbstractResource resourceOrRef = resourceDao.findResourceOrRef(resourceOrRefId);

        if (resourceOrRef == null) {
            logger.error("resource or reference #{} not found", resourceOrRefId);
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return resourceOrRef;
    }

    /**
     * Retrieve the resource. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param resourceId the id of the resource
     *
     * @return the resource if found
     *
     * @throws HttpErrorMessage if the resource was not found
     */
    public Resource assertAndGetResource(Long resourceId) {
        AbstractResource abstractResource = assertAndGetResourceOrRef(resourceId);

        if (!(abstractResource instanceof Resource)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return (Resource) abstractResource;
    }

    /**
     * Retrieve the resource reference. If not found, throw a {@link HttpErrorMessage}.
     *
     * @param resourceRefId the id of the resource reference
     *
     * @return the resource reference if found
     *
     * @throws HttpErrorMessage if the resource reference was not found
     */
    public ResourceRef assertAndGetResourceRef(Long resourceRefId) {
        AbstractResource abstractResource = assertAndGetResourceOrRef(resourceRefId);

        if (!(abstractResource instanceof ResourceRef)) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        return (ResourceRef) abstractResource;

    }

    // *********************************************************************************************
    // find all resources for a card type / card / card content
    // *********************************************************************************************

    /**
     * Retrieve the abstract resources directly linked to an abstract card type and all the chain of
     * references to the concrete resource
     *
     * @param cardTypeOrRefId The id of the card type or reference
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForAbstractCardType(
        Long cardTypeOrRefId) {
        logger.debug("get expanded resources linked to abstract card type #{}", cardTypeOrRefId);

        AbstractCardType cardTypeOrRef = cardTypeManager.assertAndGetCardTypeOrRef(cardTypeOrRefId);

        List<AbstractResource> directResourcesAndRefs = cardTypeOrRef.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card and all the chain of references to
     * the concrete resource
     *
     * @param cardId The id of the card
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForCard(Long cardId) {
        logger.debug("get expanded resources linked to card #{}", cardId);

        Card card = cardManager.assertAndGetCard(cardId);

        List<AbstractResource> directResourcesAndRefs = card.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * Retrieve the abstract resources directly linked to a card content and all the chain of
     * references to the concrete resource
     *
     * @param cardContentId The id of the card content
     *
     * @return For each direct abstract resource, the chain of abstract resources to the resource
     */
    public List<List<AbstractResource>> getExpandedResourcesForCardContent(Long cardContentId) {
        logger.debug("get expanded resources linked to card content #{}", cardContentId);

        CardContent cardContent = cardContentManager.assertAndGetCardContent(cardContentId);

        List<AbstractResource> directResourcesAndRefs = cardContent.getDirectAbstractResources();

        return expandCompleteChains(directResourcesAndRefs);
    }

    /**
     * @param directResourcesAndRefs List of resources or references
     *
     * @return for each resource / resource reference, retrieve the all chain from it until a
     *         concrete resource
     */
    private List<List<AbstractResource>> expandCompleteChains(
        List<AbstractResource> directResourcesAndRefs) {
        return directResourcesAndRefs
            .stream()
            .map(resourceOrRef -> resourceOrRef.expand())
            .collect(Collectors.toList());
    }

    // *********************************************************************************************
    // find all direct resources in the project
    // *********************************************************************************************

    /**
     * Get the resources directly linked to the given project.
     * <p>
     * Does not fetch all chain references.
     *
     * @param projectId the id of the project
     *
     * @return resources directly linked to the given project
     */
    public List<AbstractResource> getDirectAbstractResourcesOfProject(Long projectId) {
        logger.debug("get all the resources directly linked to the project #{}", projectId);

        Project project = projectManager.assertAndGetProject(projectId);

        List<Resourceable> allResourceables = new ArrayList<>();

        allResourceables.addAll(project.getElementsToBeDefined());
        allResourceables.addAll(projectManager.getCards(projectId));
        allResourceables.addAll(projectManager.getCardContents(projectId));

        List<AbstractResource> allDirectResources = new ArrayList<>();

        allDirectResources.addAll(allResourceables.stream().flatMap(card -> {
            return card.getDirectAbstractResources().stream();
        }).collect(Collectors.toList()));

        return allDirectResources;
    }

    /**
     * Get the list of project which reference the given resource, excluding the project which owns
     * the resource.
     *
     * @param abstractResourceId if of the targeted resource
     *
     * @return list of externalReference
     */
    public List<ResourceExternalReference> getResourceExternalReferences(Long abstractResourceId) {
        AbstractResource resource = resourceDao.findResourceOrRef(abstractResourceId);
        Project owner = resource.getProject();

        HashMap<Project, List<ResourceRef>> perProject = new HashMap<>();

        resourceDao.findAllReferences(resource)
            .stream()
            .filter(res -> {
                // onky keep ones not linked to current project
                return res != null && !res.getProject().equals(owner);
            })
            .forEach(res -> {
                Project p = res.getProject();
                if (p != null) {
                    // group resource by project
                    var list = perProject.get(res.getProject());
                    if (list == null) {
                        list = new ArrayList<>();
                        perProject.put(p, list);
                    }
                    list.add(res);
                }
            });

        return perProject.entrySet().stream().map(entry -> {
            Project p = entry.getKey();

            ResourceExternalReference extRef = new ResourceExternalReference();
            extRef.setProject(p);

            List<ResourceRef> leaves = entry.getValue().stream().filter(res -> {
                return res.getCardContentId() != null || res.getCardId() != null;
            }).collect(Collectors.toList());

            if (leaves.isEmpty()) {
                // even if the project references the resource through the cardType,
                // not a single card or card content references the resource
                extRef.setUsage(ResourceExternalReference.Usage.UNUSED);
                return extRef;
            }

            // if at least one leaf is not refused, this is globally not refused
            boolean used = leaves.stream().anyMatch(res -> {
                return !res.isRefused();
            });

            if (used) {
                extRef.setUsage(ResourceExternalReference.Usage.USED);
            } else {
                extRef.setUsage(ResourceExternalReference.Usage.REFUSED);
            }

            return extRef;
        }).collect(Collectors.toList());
    }

    // *********************************************************************************************
    // life cycle
    // *********************************************************************************************

    /**
     * Complete and persist the given resource and create all the references needed.
     * <p>
     * Every child of the entity acquires a reference to that resource.<br>
     * And recursively the grand children acquires a reference to the reference of their parent.
     *
     * @param resource the resource to create
     *
     * @return the brand new resource
     */
    public Resource createResource(Resource resource) {
        logger.debug("create resource {}", resource);

        if (resource.getTeaser() == null) {
            TextDataBlock teaserTextDataBlock = blockManager.makeNewTextDataBlock();

            resource.setTeaser(teaserTextDataBlock);
            teaserTextDataBlock.setTeasingResource(resource);
        }

        // implicitly resource.setPublished(false);
        // implicitly resource.setRequestingForGlory(false);
        // implicitly resource.setDeprecated(false);

        Resourceable owner;
        if (resource.getAbstractCardTypeId() != null) {
            owner = cardTypeManager.assertAndGetCardTypeOrRef(resource.getAbstractCardTypeId());

        } else if (resource.getCardId() != null) {
            owner = cardManager.assertAndGetCard(resource.getCardId());

        } else if (resource.getCardContentId() != null) {
            owner = cardContentManager.assertAndGetCardContent(resource.getCardContentId());

        } else {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        resource.setOwner(owner);
        owner.getDirectAbstractResources().add(resource);

        resourceReferenceSpreadingHelper.spreadAvailableResourceDown(resource);

        return resourceDao.persistResource(resource);
    }

    /**
     * Delete the given resource
     *
     * @param resourceId the id of the resource to delete
     */
    public void deleteResource(Long resourceId) {
        logger.debug("delete resource #{}", resourceId);

        AbstractResource resource = assertAndGetResourceOrRef(resourceId);

        if (!checkDeletionAcceptability(resource)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        deleteResourceAndRefs(resource);
    }

    /**
     * Ascertain that the resource can be deleted.
     *
     * @param resourceOrRef the resource (or reference) to check for deletion
     *
     * @return True iff it can be safely deleted
     */
    private boolean checkDeletionAcceptability(AbstractResource resourceOrRef) {
        // the only resources we delete manually are the concrete resources
        if (!(resourceOrRef instanceof Resource)) {
            return false;
        }

        return true;
    }

    /**
     * Delete each reference pointing at the given resourceOrRef and remove the resource from the
     * card type / card / card content.
     *
     * @param resourceOrRef The initial abstract resource to delete
     */
    private void deleteResourceAndRefs(AbstractResource resourceOrRef) {
        requestManager.sudo(() -> {
            List<ResourceRef> references = resourceDao.findDirectReferences(resourceOrRef);
            if (references != null) {
                references.stream().forEach(ref -> deleteResourceAndRefs(ref));
            }

            if (resourceOrRef.getOwner() != null) {
                Resourceable owner = resourceOrRef.getOwner();
                owner.getDirectAbstractResources().remove(resourceOrRef);
            }

            resourceDao.deleteResourceOrRef(resourceOrRef.getId());

            // Note : the document is deleted by cascade
        });
    }

    // *********************************************************************************************
    // duplication
    // *********************************************************************************************

    /**
     * Duplicate the given resource with the given parameters to fine tune the duplication
     *
     * @param resourceId the id of the project to duplicate
     * @param params     the parameters to fine tune the duplication
     * @param parentType the new owner
     * @param parentId   if of the new owner
     * @param published  new publication status
     *
     * @return the new project
     */
    public Resource copyResourceTo(Long resourceId, DuplicationParam params, String parentType,
        Long parentId, boolean published) {
        AbstractResource originalResourceOrRef = assertAndGetResourceOrRef(resourceId);

        Resource originalResource;
        if (originalResourceOrRef instanceof Resource) {
            originalResource = (Resource) originalResourceOrRef;
        } else if (originalResourceOrRef instanceof ResourceRef) {
            originalResource = originalResourceOrRef.resolve();
        } else {
            throw new IllegalStateException("abstract card type implementation not handled");
        }

        DuplicationManager duplicator = new DuplicationManager(params,
            resourceReferenceSpreadingHelper, fileManager);

        Resource newResourceJavaObject;
        try {
            newResourceJavaObject = (Resource) duplicator.duplicateResource(originalResource);
        } catch (ColabMergeException e) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        Resourceable owner = null;
        if ("Card".equals(parentType)) {
            owner = cardDao.findCard(parentId);
        } else if ("CardContent".equals(parentType)) {
            owner = cardContentDao.findCardContent(parentId);
        } else if ("CardType".equals(parentType)) {
            owner = cardTypeDao.findAbstractCardType(parentId);
        }
        newResourceJavaObject.setOwner(owner);
        owner.getDirectAbstractResources().add(newResourceJavaObject);

        Resource newResource = createResource(newResourceJavaObject);

        duplicator.duplicateDataIntoJCR();

        duplicator.clear();

        // init or revive new references
        resourceReferenceSpreadingHelper.spreadAvailableResourceDown(newResource);

        return newResource;
    }

    // *********************************************************************************************
    // state cycle
    // *********************************************************************************************

    /**
     * Discard the resource (or reference) so that it cannot be visible anymore
     *
     * @param resourceOrRefId the id of the resource or reference
     */
    public void discardResourceOrRef(Long resourceOrRefId) {
        AbstractResource resourceOrRef = assertAndGetResourceOrRef(resourceOrRefId);

        if (resourceOrRef instanceof Resource) {
            Resource resource = (Resource) resourceOrRef;
            resource.setDeprecated(true);

            // if resource in card, refuse also the resource in the variants
            if (resource.getCard() != null) {
                List<ResourceRef> references = resourceDao.findDirectReferences(resource);
                for (ResourceRef ref : references) {
                    if (Objects.equals(resource.getCard(), ref.getCardContent().getCard())) {
                        resourceReferenceSpreadingHelper.refuseRecursively(ref);
                    }
                }
            }

        } else if (resourceOrRef instanceof ResourceRef) {
            ResourceRef resourceRef = (ResourceRef) resourceOrRef;
            resourceReferenceSpreadingHelper.refuseRecursively(resourceRef);
        }
    }

    /**
     * Restore the resource (or reference) so that it can be visible again
     *
     * @param resourceOrRefId the id of the resource or reference
     */
    public void restoreResourceOrRef(Long resourceOrRefId) {
        AbstractResource resourceOrRef = assertAndGetResourceOrRef(resourceOrRefId);

        if (resourceOrRef instanceof Resource) {
            Resource resource = (Resource) resourceOrRef;
            if (resource.isDeprecated()) {
                resource.setDeprecated(false);
            }

            // if resource in card, un refuse also the resource in the variants
            if (resource.getCard() != null) {
                List<ResourceRef> references = resourceDao.findDirectReferences(resource);
                for (ResourceRef ref : references) {
                    if (Objects.equals(resource.getCard(), ref.getCardContent().getCard())) {
                        resourceReferenceSpreadingHelper.unRefuseRecursively(ref);
                    }
                }
            }

        } else if (resourceOrRef instanceof ResourceRef) {
            ResourceRef resourceRef = (ResourceRef) resourceOrRef;
            if (resourceRef.isRefused()) {
                resourceReferenceSpreadingHelper.unRefuseRecursively(resourceRef);

            }

            if (resourceRef.isResidual()) {
                resourceReferenceSpreadingHelper.reviveRecursively(resourceRef);

            }
        }
    }

    /**
     * Set the resource as published or not
     *
     * @param resourceId        the id of the resource
     * @param newPublishedValue if it is published or not
     */
    public void changeResourcePublication(Long resourceId, boolean newPublishedValue) {
        Resource resource = assertAndGetResource(resourceId);

        resource.setPublished(newPublishedValue);

        if (newPublishedValue) {
            resourceReferenceSpreadingHelper.spreadAvailableResourceDown(resource);
        } else {
            resourceReferenceSpreadingHelper.spreadDisableResourceDown(resource);
        }
    }

    /**
     * Move a resource to a new resourceable
     *
     * @param resourceId id of the resource to move
     * @param newOwner   the new owner
     * @param published  new publication status
     */
    public void moveResource(Long resourceId, Resourceable newOwner, boolean published) {
        Resource resource = assertAndGetResource(resourceId);

        if (newOwner == null) {
            throw HttpErrorMessage.relatedObjectNotFoundError();
        }

        Resourceable previousOwner = resource.getOwner();

        if (newOwner.equals(previousOwner)) {
            // not realy a move...
            this.changeResourcePublication(resourceId, published);
        } else {

            // mark all references as residual
            resourceReferenceSpreadingHelper.spreadDisableResourceDown(resource, true);

            // move the resource
            if (previousOwner != null) {
                previousOwner.getDirectAbstractResources().remove(resource);
            }

            newOwner.getDirectAbstractResources().add(resource);
            resource.setOwner(newOwner);
            resource.setPublished(published);

            // init or revive new references
            resourceReferenceSpreadingHelper.spreadAvailableResourceDown(resource);
        }
    }

    /**
     * Move a resource to a new resourceable.
     *
     * @param resourceId id of the resource to move
     * @param parentType the new owner
     * @param parentId   if of the new owner
     * @param published  new publication status
     */
    public void moveResource(Long resourceId, String parentType, Long parentId, boolean published) {
        Resourceable parent = null;
        // not that happy with this resourceable resolver
        // todo: normalize it
        if ("Card".equals(parentType)) {
            parent = cardDao.findCard(parentId);
        } else if ("CardContent".equals(parentType)) {
            parent = cardContentDao.findCardContent(parentId);
        } else if ("CardType".equals(parentType)) {
            parent = cardTypeDao.findAbstractCardType(parentId);
        }
        this.moveResource(resourceId, parent, published);
    }

    // *********************************************************************************************
    // add a document to a resource
    // *********************************************************************************************

    /**
     * Add the document to the end of the resource.
     *
     * @param resourceId the id of the resource
     * @param document   the document to use in the resource. It must be a new document
     *
     * @return the newly created document
     */
    public Document addDocument(Long resourceId, Document document) {
        logger.debug("add document {} to resource #{}", document, resourceId);

        return addDocument(resourceId, document, RelatedPosition.AT_END);
    }

    /**
     * Add the document to the resource. It will be placed on the given relatedPosition.
     *
     * @param resourceId      the id of the resource
     * @param document        the document to use in the resource. It must be a new document
     * @param relatedPosition to define the place where the document will be added in the resource
     *
     * @return the newly created document
     */
    public Document addDocument(Long resourceId, Document document,
        RelatedPosition relatedPosition) {
        logger.debug("add document {} {} to resource #{}", document, relatedPosition, resourceId);

        return addDocument(resourceId, document, relatedPosition, null);
    }

    /**
     * Add the document to the resource.
     *
     * @param resourceId      the id of the resource
     * @param document        the document to use in the resource. It must be a new document
     * @param relatedPosition to define the place where the document will be added in the resource
     * @param neighbourDocId  the existing document which defines where the new document will be
     *                        set. If relatedPosition is BEFOR or AFTER, it must be not null
     *
     * @return the newly created document
     */
    public Document addDocument(Long resourceId, Document document, RelatedPosition relatedPosition,
        Long neighbourDocId) {
        logger.debug("add document {} to resource #{} {} doc #{}", document, resourceId,
            relatedPosition, neighbourDocId);

        Resource resource = assertAndGetResource(resourceId);

        if (document == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (document.hasOwningResource() || document.hasOwningCardContent()) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        if (resource.getDocuments().contains(document)) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        switch (relatedPosition) {
            case BEFORE:
                Document neighbourBDocument = documentManager.assertAndGetDocument(neighbourDocId);
                indexGenerator.moveItemBefore(document, neighbourBDocument,
                    resource.getDocuments());
                break;
            case AFTER:
                Document neighbourADocument = documentManager.assertAndGetDocument(neighbourDocId);
                indexGenerator.moveItemAfter(document, neighbourADocument,
                    resource.getDocuments());
                break;
            case AT_BEGINNING:
                indexGenerator.moveItemToBeginning(document, resource.getDocuments());
                break;
            case AT_END:
            default:
                indexGenerator.moveItemToEnd(document, resource.getDocuments());
                break;
        }

        resource.getDocuments().add(document);
        document.setOwningResource(resource);

        return documentDao.persistDocument(document);
    }

    /**
     * Remove the document of the resource
     *
     * @param resourceId the id of the resource
     * @param documentId the id of the document to remove
     */
    public void removeDocument(Long resourceId, Long documentId) {
        logger.debug("remove document #{} of resource #{}", documentId, resourceId);

        Resource resource = assertAndGetResource(resourceId);

        Document document = documentManager.assertAndGetDocument(documentId);

        if (!(resource.getDocuments().contains(document))) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }

        resource.getDocuments().remove(document);

        documentDao.deleteDocument(document.getId());
    }

    // *********************************************************************************************
    // retrieve the elements of a resource
    // *********************************************************************************************
    /**
     * Get the documents of the resource
     *
     * @param resourceId the id of the resource
     *
     * @return the documents linked to the resource
     */
    public List<Document> getDocumentsOfResource(Long resourceId) {
        logger.debug("get documents of resource #{}", resourceId);

        Resource resource = assertAndGetResource(resourceId);

        return resource.getDocuments();
    }

    /**
     * Get all sticky note links whose source is the given resource / resource reference
     *
     * @param resourceOrRefId the id of the resource / resource reference
     *
     * @return all sticky note links linked to the resource / resource reference
     */
    public List<StickyNoteLink> getStickyNoteLinkAsSrc(Long resourceOrRefId) {
        logger.debug("get sticky note links where the abstract resource #{} is the source",
            resourceOrRefId);

        AbstractResource resource = assertAndGetResourceOrRef(resourceOrRefId);

        return resource.getStickyNoteLinksAsSrc();
    }

    // *********************************************************************************************
    // dedicated to access control
    // *********************************************************************************************

    // *********************************************************************************************
    // integrity check
    // *********************************************************************************************

    /**
     * Check the integrity of the card type (or reference)
     *
     * @param resourceOrRef the resource (or reference) to check
     *
     * @return true iff the project is complete and safe
     */
    public boolean checkIntegrity(AbstractResource resourceOrRef) {
        if (resourceOrRef == null) {
            return false;
        }

        if (resourceOrRef instanceof Resource) {
            Resource resource = (Resource) resourceOrRef;
            if (CollectionUtils.isEmpty(resource.getDocuments())) {
                return false;
            }
        }

        if (resourceOrRef instanceof ResourceRef) {
            ResourceRef reference = (ResourceRef) resourceOrRef;
            Resource finalTarget = reference.resolve();
            if (finalTarget == null) {
                return false;
            }
        }

        int nbCardType = resourceOrRef.getAbstractCardType() == null ? 0 : 1;
        int nbCard = resourceOrRef.getCard() == null ? 0 : 1;
        int nbCardContent = resourceOrRef.getCardContent() == null ? 0 : 1;
        if ((nbCardType + nbCard + nbCardContent) != 1) {
            return false;
        }

        return true;
    }

    // *********************************************************************************************
    //
    // *********************************************************************************************

}
