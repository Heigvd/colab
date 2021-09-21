package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalDocLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import com.google.common.collect.Lists;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view
 *
 * @author sandra
 */
// TODO refuse stuff
// TODO publish / requestForGlory / deprecated stuff
public class ResourceRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testOnGlobalCardType() {
        doTest(Access.GLOBAL_CARD_TYPE,
            Set.of(Access.CARD_TYPE_REF, Access.CARD, Access.CARD_CONTENT));
        // the resources on a card type are not accessible from the sub cards
    }

    @Test
    public void testOnCardTypeRef() {
        doTest(Access.CARD_TYPE_REF,
            Set.of(Access.CARD, Access.CARD_CONTENT));
        // the resources on a card type reference are not accessible from the sub cards
    }

    @Test
    public void testOnCard() {
        doTest(Access.CARD,
            Set.of(Access.CARD_CONTENT,
                Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnCardContent() {
        doTest(Access.CARD_CONTENT,
            Set.of(Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardType() {
        doTest(Access.SUB_CARD_TYPE,
            Set.of(Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCard() {
        doTest(Access.SUB_CARD,
            Set.of(Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardContent() {
        doTest(Access.SUB_CARD_CONTENT,
            Set.of());
    }

    private enum Access {
        GLOBAL_CARD_TYPE,
        CARD_TYPE_REF,
        CARD,
        CARD_CONTENT,
        SUB_CARD_TYPE,
        SUB_CARD,
        SUB_CARD_CONTENT;
    }

    private void doTest(Access resourceLocation, Set<Access> accessToResourceRef) {
        // creation of the context : project, global card type, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();

        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        Long cardTypeRefId = client.cardRestEndpoint.getCard(cardId).getCardTypeId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        Long subCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long subCardId = ColabFactory.createNewCard(client, cardContentId, subCardTypeId).getId();

        Long subCardContentId = ColabFactory.getCardContent(client, subCardId).getId();

        // creation of a resource

        String category = "awesome resources #" + ((int) (Math.random() * 1000));
        String title = "The game encyclopedia #" + ((int) (Math.random() * 1000));
        String teaser = "Word by word descriptions #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalDocLink doc = new ExternalDocLink();
        doc.setTitle(title);
        doc.setTeaser(teaser);
        doc.setUrl(url);

        Resource persistedResource;

        switch (resourceLocation) {
            case GLOBAL_CARD_TYPE:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForAbstractCardTypeWithCategory(globalCardTypeId, category, doc);
                break;
            case CARD_TYPE_REF:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForAbstractCardTypeWithCategory(cardTypeRefId, category, doc);
                break;
            case CARD:
                persistedResource = client.resourceRestEndpoint.createResourceForCardWithCategory(
                    cardId,
                    category, doc);
                break;
            case CARD_CONTENT:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardContentWithCategory(cardContentId, category, doc);
                break;
            case SUB_CARD_TYPE:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForAbstractCardTypeWithCategory(subCardTypeId, category, doc);
                break;
            case SUB_CARD:
                persistedResource = client.resourceRestEndpoint.createResourceForCardWithCategory(
                    subCardId,
                    category, doc);
                break;
            case SUB_CARD_CONTENT:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardContentWithCategory(subCardContentId, category, doc);
                break;
            default:
                Assertions.fail();
                persistedResource = new Resource(); // just for compilation / code checks
                break;
        }

        // check the abstract card type / card / card content link with the resource

        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        switch (resourceLocation) {
            case GLOBAL_CARD_TYPE:
                Assertions.assertEquals(globalCardTypeId,
                    persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD_TYPE_REF:
                Assertions.assertEquals(cardTypeRefId, persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertEquals(cardId, persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case CARD_CONTENT:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertEquals(cardContentId, persistedResource.getCardContentId());
                break;
            case SUB_CARD_TYPE:
                Assertions.assertEquals(subCardTypeId, persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case SUB_CARD:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertEquals(subCardId, persistedResource.getCardId());
                Assertions.assertNull(persistedResource.getCardContentId());
                break;
            case SUB_CARD_CONTENT:
                Assertions.assertNull(persistedResource.getAbstractCardTypeId());
                Assertions.assertNull(persistedResource.getCardId());
                Assertions.assertEquals(subCardContentId, persistedResource.getCardContentId());
                break;
            default:
                Assertions.fail();
        }

        // check the document

        Long documentId = persistedResource.getDocumentId();
        Document persistedDocument = client.documentRestEndPoint.getDocument(documentId);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(documentId, persistedDocument.getId());
        Assertions.assertEquals(title, persistedDocument.getTitle());
        Assertions.assertEquals(teaser, persistedDocument.getTeaser());
        Assertions.assertTrue(persistedDocument instanceof ExternalDocLink);
        ExternalDocLink persistedExtDocLink = (ExternalDocLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
        Assertions.assertEquals(persistedResource.getId(), persistedDocument.getResourceId());

        // check the resource references

        AbstractResource persistedGlobalCardTypeAbstractResource = null;
        List<List<AbstractResource>> persistedGlobalCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(globalCardTypeId);
        if (resourceLocation == Access.GLOBAL_CARD_TYPE) {
            Assertions.assertNotNull(persistedGlobalCardTypeResources);
            Assertions.assertEquals(1, persistedGlobalCardTypeResources.size());
            Assertions.assertEquals(1, persistedGlobalCardTypeResources.get(0).size());
            Assertions.assertNotNull(persistedGlobalCardTypeResources.get(0).get(0));
            Assertions
                .assertTrue(persistedGlobalCardTypeResources.get(0).get(0) instanceof Resource);
            persistedGlobalCardTypeAbstractResource = persistedGlobalCardTypeResources.get(0)
                .get(0);
            Assertions.assertEquals(persistedResource, persistedGlobalCardTypeAbstractResource);
        } else {
            Assertions.assertNotNull(persistedGlobalCardTypeResources);
            Assertions.assertEquals(0, persistedGlobalCardTypeResources.size());
        }

        AbstractResource persistedCardTypeRefAbstractResource = null;
        List<List<AbstractResource>> persistedCardTypeRefResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(cardTypeRefId);
        if (resourceLocation == Access.CARD_TYPE_REF) {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(1, persistedCardTypeRefResources.size());
            Assertions.assertEquals(1, persistedCardTypeRefResources.get(0).size());
            Assertions.assertNotNull(persistedCardTypeRefResources.get(0).get(0));
            Assertions.assertTrue(persistedCardTypeRefResources.get(0).get(0) instanceof Resource);
            persistedCardTypeRefAbstractResource = persistedCardTypeRefResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardTypeRefAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD_TYPE_REF)) {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(1, persistedCardTypeRefResources.size());
            Assertions.assertTrue(persistedCardTypeRefResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedCardTypeRefResources.get(0).get(0) instanceof ResourceRef);
            persistedCardTypeRefAbstractResource = persistedCardTypeRefResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedGlobalCardTypeAbstractResource);
            Assertions.assertEquals(persistedGlobalCardTypeAbstractResource.getId(),
                ((ResourceRef) persistedCardTypeRefAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardTypeRefResources);
            Assertions.assertEquals(0, persistedCardTypeRefResources.size());
        }

        AbstractResource persistedCardAbstractResource = null;
        List<List<AbstractResource>> persistedCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(cardId);
        if (resourceLocation == Access.CARD) {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(1, persistedCardResources.size());
            Assertions.assertEquals(1, persistedCardResources.get(0).size());
            Assertions.assertNotNull(persistedCardResources.get(0).get(0));
            Assertions.assertTrue(persistedCardResources.get(0).get(0) instanceof Resource);
            persistedCardAbstractResource = persistedCardResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD)) {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(1, persistedCardResources.size());
            Assertions.assertTrue(persistedCardResources.get(0).size() > 1);
            Assertions.assertTrue(persistedCardResources.get(0).get(0) instanceof ResourceRef);
            persistedCardAbstractResource = persistedCardResources.get(0).get(0);
            Assertions.assertNotNull(persistedCardTypeRefAbstractResource);
            Assertions.assertEquals(persistedCardTypeRefAbstractResource.getId(),
                ((ResourceRef) persistedCardAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(0, persistedCardResources.size());
        }

        AbstractResource persistedCardContentAbstractResource = null;
        List<List<AbstractResource>> persistedCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId);
        if (resourceLocation == Access.CARD_CONTENT) {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(1, persistedCardContentResources.size());
            Assertions.assertEquals(1, persistedCardContentResources.get(0).size());
            Assertions.assertNotNull(persistedCardContentResources.get(0).get(0));
            Assertions.assertTrue(persistedCardContentResources.get(0).get(0) instanceof Resource);
            persistedCardContentAbstractResource = persistedCardContentResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedCardContentAbstractResource);
        } else if (accessToResourceRef.contains(Access.CARD_CONTENT)) {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(1, persistedCardContentResources.size());
            Assertions.assertTrue(persistedCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedCardContentAbstractResource = persistedCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedCardAbstractResource);
            Assertions.assertEquals(persistedCardAbstractResource.getId(),
                ((ResourceRef) persistedCardContentAbstractResource).getTargetId());
        } else {
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(0, persistedCardContentResources.size());
        }

        AbstractResource persistedSubCardTypeAbstractResource = null;
        List<List<AbstractResource>> persistedSubCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(subCardTypeId);
        if (resourceLocation == Access.SUB_CARD_TYPE) {
            Assertions.assertNotNull(persistedSubCardTypeResources);
            Assertions.assertEquals(1, persistedSubCardTypeResources.size());
            Assertions.assertEquals(1, persistedSubCardTypeResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardTypeResources.get(0).get(0));
            Assertions.assertTrue(persistedSubCardTypeResources.get(0).get(0) instanceof Resource);
            persistedSubCardTypeAbstractResource = persistedSubCardTypeResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardTypeAbstractResource);
        } else if (accessToResourceRef.contains(Access.SUB_CARD_TYPE)) {
            Assertions.fail("not handled in current example");
        } else {
            Assertions.assertNotNull(persistedSubCardTypeResources);
            Assertions.assertEquals(0, persistedSubCardTypeResources.size());
        }

        AbstractResource persistedSubCardResourceRef = null;
        List<List<AbstractResource>> persistedSubCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(subCardId);
        if (resourceLocation == Access.SUB_CARD) {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(1, persistedSubCardResources.size());
            Assertions.assertEquals(1, persistedSubCardResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardResources.get(0).get(0));
            Assertions.assertTrue(persistedSubCardResources.get(0).get(0) instanceof Resource);
            persistedSubCardResourceRef = persistedSubCardResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardResourceRef);
        } else if (accessToResourceRef.contains(Access.SUB_CARD)) {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(1, persistedSubCardResources.size());
            Assertions.assertTrue(persistedSubCardResources.get(0).size() > 1);
            Assertions.assertTrue(persistedSubCardResources.get(0).get(0) instanceof ResourceRef);
            persistedSubCardResourceRef = persistedSubCardResources.get(0).get(0);
            Assertions.assertTrue(persistedCardContentAbstractResource != null
                || persistedSubCardTypeAbstractResource != null);
            if (persistedCardContentAbstractResource != null) {
                Assertions.assertEquals(persistedCardContentAbstractResource.getId(),
                    ((ResourceRef) persistedSubCardResourceRef).getTargetId());
            } else if (persistedSubCardTypeAbstractResource != null) {
                Assertions.assertEquals(persistedSubCardTypeAbstractResource.getId(),
                    ((ResourceRef) persistedSubCardResourceRef).getTargetId());
            } else {
                Assertions.fail(
                    "a sub card resource reference must be linked to its card type reference or to its parent card content reference ");
            }
        } else {
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(0, persistedSubCardResources.size());
        }

        AbstractResource persistedSubCardContentResourceRef = null;
        List<List<AbstractResource>> persistedSubCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(subCardContentId);
        if (resourceLocation == Access.SUB_CARD_CONTENT) {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(1, persistedSubCardContentResources.size());
            Assertions.assertEquals(1, persistedSubCardContentResources.get(0).size());
            Assertions.assertNotNull(persistedSubCardContentResources.get(0).get(0));
            Assertions
                .assertTrue(persistedSubCardContentResources.get(0).get(0) instanceof Resource);
            Assertions.assertEquals(persistedResource,
                persistedSubCardContentResources.get(0).get(0));
            persistedSubCardContentResourceRef = persistedSubCardContentResources.get(0).get(0);
            Assertions.assertEquals(persistedResource, persistedSubCardContentResourceRef);
        } else if (accessToResourceRef.contains(Access.SUB_CARD_CONTENT)) {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(1, persistedSubCardContentResources.size());
            Assertions.assertTrue(persistedSubCardContentResources.get(0).size() > 1);
            Assertions
                .assertTrue(persistedSubCardContentResources.get(0).get(0) instanceof ResourceRef);
            persistedSubCardContentResourceRef = persistedSubCardContentResources
                .get(0).get(0);
            Assertions.assertNotNull(persistedSubCardResourceRef);
            Assertions.assertEquals(persistedSubCardResourceRef.getId(),
                ((ResourceRef) persistedSubCardContentResourceRef).getTargetId());
        } else {
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(0, persistedSubCardContentResources.size());
        }

        // And now, delete the resource

        Long resourceId = persistedResource.getId();

        client.resourceRestEndpoint.deleteResource(resourceId);

        Assertions.assertNull(client.resourceRestEndpoint.getAbstractResource(resourceId));

        persistedGlobalCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(globalCardTypeId);
        Assertions.assertNotNull(persistedGlobalCardTypeResources);
        Assertions.assertEquals(0, persistedGlobalCardTypeResources.size());

        persistedCardTypeRefResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(cardTypeRefId);
        Assertions.assertNotNull(persistedCardTypeRefResources);
        Assertions.assertEquals(0, persistedCardTypeRefResources.size());

       persistedCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(cardId);
       Assertions.assertNotNull(persistedCardResources);
       Assertions.assertEquals(0, persistedCardResources.size());

        persistedCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId);
        Assertions.assertNotNull(persistedCardContentResources);
        Assertions.assertEquals(0, persistedCardContentResources.size());

        persistedSubCardTypeResources = client.resourceRestEndpoint
            .getResourceChainForAbstractCardType(subCardTypeId);
        Assertions.assertNotNull(persistedSubCardTypeResources);
        Assertions.assertEquals(0, persistedSubCardTypeResources.size());


        persistedSubCardResources = client.resourceRestEndpoint
            .getResourceChainForCard(subCardId);
        Assertions.assertNotNull(persistedSubCardResources);
        Assertions.assertEquals(0, persistedSubCardResources.size());

        persistedSubCardContentResources = client.resourceRestEndpoint
            .getResourceChainForCardContent(subCardContentId);
        Assertions.assertNotNull(persistedSubCardContentResources);
        Assertions.assertEquals(0, persistedSubCardContentResources.size());
    }

    // old stuff when using getAvailableActiveLinkedResources

//    private enum ResourceState {
//        PUBLISHED,
//        REQUESTING_FOR_GLORY,
//        DEPRECATED;
//    }

//    if (!resourceStatus.isEmpty()) {
//        if (resourceStatus.contains(ResourceState.PUBLISHED)) {
//            persistedResource.setPublished(true);
//        }
//
//        if (resourceStatus.contains(ResourceState.REQUESTING_FOR_GLORY)) {
//            persistedResource.setRequestingForGlory(true);
//        }
//
//        if (resourceStatus.contains(ResourceState.DEPRECATED)) {
//            persistedResource.setDeprecated(true);
//        }
//
//        client.resourceRestEndpoint.updateResource(persistedResource);
//
//        persistedResource = (Resource) client.resourceRestEndpoint
//            .getAbstractResource(persistedResource.getId());
//    }

//    Assertions.assertTrue(
//        resourceStatus.contains(ResourceState.PUBLISHED) == persistedResource.isPublished());
//    Assertions.assertTrue(resourceStatus.contains(
//        ResourceState.REQUESTING_FOR_GLORY) == persistedResource.isRequestingForGlory());
//    Assertions.assertTrue(
//        resourceStatus.contains(ResourceState.DEPRECATED) == persistedResource.isDeprecated());
//    Assertions.assertNotNull(persistedResource.getDocumentId());

    // *********************************************************************************************
    // Category
    // *********************************************************************************************

    @Test
    public void testCategory() {
        Long projectId = ColabFactory
            .createProject(client, "test resources project #" + ((int) (Math.random() * 1000)))
            .getId();

        Long cardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Resource persistedResource1 = createResourceForAbstractCardType(cardTypeId);
        Long resource1Id = persistedResource1.getId();
        Assertions.assertNull(persistedResource1.getCategory());

        Resource persistedResource2 = createResourceForAbstractCardType(cardTypeId);
        Long resource2Id = persistedResource2.getId();
        Assertions.assertNull(persistedResource2.getCategory());

        String categoryNameA = "Guides #" + ((int) (Math.random() * 1000));
        String categoryNameB = "Work files +\"*ç%&/()=?^±“#Ç[]|{}≠¿´<>,.-¨$"
            + ((int) (Math.random() * 1000));

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameA);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource2Id, categoryNameA);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList("   ",
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint
            .removeCategoryForList(Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameB);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertEquals(categoryNameB, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.removeCategory(resource1Id);
        persistedResource1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource1Id);
        persistedResource2 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());
    }

    @Test
    public void testCategoryRenaming() {
        // context : a project with a card and a sub card
        Project project = ColabFactory.createProject(client,
            "testCategoryRenaming #" + ((int) (Math.random() * 1000)));
        Long projectId = project.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long cardType1Id = ColabFactory.createCardType(client, projectId).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, cardType1Id).getId();

        Long cardContent1Id = ColabFactory.getCardContent(client, card1Id).getId();

        Long subCard2Id = ColabFactory.createNewCard(client, cardContent1Id, cardType1Id)
            .getId();

        Long subCardContent2Id = ColabFactory.getCardContent(client, subCard2Id).getId();

//        // another project with a card using a cardType of the previous project
//        Project projectII = ColabFactory.createProject(client,
//            "projectII #" + ((int) (Math.random() * 1000)));
//
//        Long rootCardContentIIId = ColabFactory.getRootContent(client, projectII).getId();
//
//        Long cardIIId = ColabFactory.createNewCard(client, rootCardContentIIId, cardType1Id)
//            .getId();

        // set and retrieve the resources / resources references
        Resource resourceOfCardType1 = createResourceForAbstractCardType(cardType1Id);
        Long resourceOfCardType1Id = resourceOfCardType1.getId();
        Assertions.assertNull(resourceOfCardType1.getCategory());

        ResourceRef resourceRefOfCard1 = retrieveResourceRefForCard(card1Id);
        Long resourceRefOfCard1Id = resourceRefOfCard1.getId();

        ResourceRef resourceRefOfCardContent1 = retrieveResourceRefForCardContent(
            cardContent1Id);
        Long resourceRefOfCardContent1Id = resourceRefOfCardContent1.getId();

        ResourceRef resourceRefOfSubCard2 = retrieveResourceRefForCard(subCard2Id);
        Long resourceRefOfSubCard2Id = resourceRefOfSubCard2.getId();

        ResourceRef resourceRefOfSubCardContent2 = retrieveResourceRefForCardContent(
            subCardContent2Id);
        Long resourceRefOfSubCardContent2Id = resourceRefOfSubCardContent2.getId();

//        ResourceRef resourceRefOfCardII = retrieveResourceRefForCard(cardIIId);
//        Long resourceRefOfCardIIId = resourceRefOfCardII.getId();

        Resource persistedResource3 = createResourceForAbstractCardType(cardType1Id);
        Long resource3Id = persistedResource3.getId();
        Assertions.assertNull(persistedResource3.getCategory());

        // play with the categories

        String categoryNameA = "Guides #" + ((int) (Math.random() * 1000));
        String categoryNameB = "Guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameC = "Nice guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameD = "Awesome guidelines #" + ((int) (Math.random() * 1000));
        String categoryNameE = "Valuable guidelines #" + ((int) (Math.random() * 1000));
//        String categoryNameF = "No interest guidelines #" + ((int) (Math.random() * 1000));

        String categoryNameO = "work files #" + ((int) (Math.random() * 1000));

        client.resourceRestEndpoint.setCategory(resource3Id, categoryNameO);
        persistedResource3 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // set categoryNameA for each

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resourceOfCardType1Id,
                resourceRefOfCard1Id, resourceRefOfCardContent1Id,
                resourceRefOfSubCard2Id// ,
//                resourceRefOfCardIIId
            ));
        // no category for resourceRefOfSubCardContent2Id

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameA, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category A -> B at card type level
        client.resourceRestEndpoint.renameCategoryForCardType(project.getId(), cardType1Id,
            categoryNameA, categoryNameB);

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        // in another project, stay category A
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category B -> C at card 1 level
        client.resourceRestEndpoint.renameCategoryForCard(card1Id, categoryNameB,
            categoryNameC);

        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category C -> D at card content 1 level
        client.resourceRestEndpoint.renameCategoryForCardContent(cardContent1Id, categoryNameC,
            categoryNameD);

        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category D -> E at sub card 2 level
        client.resourceRestEndpoint.renameCategoryForCard(subCard2Id, categoryNameD,
            categoryNameE);

        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // recapitulation at this point
//        resourceRefOfCardII = client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());
        resourceOfCardType1 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
            .getAbstractResource(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        persistedResource3 = (Resource) client.resourceRestEndpoint
            .getAbstractResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // rename category A -> B at card type level
//        client.resourceRestEndpoint.renameCategoryForCardType(projectII.getId(), cardType1Id,
//            categoryNameA, categoryNameF);
//
//        resourceRefOfCardII = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameF, resourceRefOfCardII.getCategory());
//        resourceOfCardType1 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceOfCardType1Id);
//        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
//        resourceRefOfCard1 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resourceRefOfCard1Id);
//        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
//        resourceRefOfCardContent1 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfCardContent1Id);
//        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
//        resourceRefOfSubCard2 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfSubCard2Id);
//        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
//        resourceRefOfSubCardContent2 = (ResourceRef) client.resourceRestEndpoint
//            .getAbstractResource(resourceRefOfSubCardContent2Id);
//        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        persistedResource3 = (ResourceRef) client.resourceRestEndpoint.getAbstractResource(resource3Id);
//        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());
    }

    // TODO check propagation with particular attention with multiple projects / sub card / card +
    // type + content consistency

    private Resource createResourceForAbstractCardType(Long cardTypeId) {
        String title = "All you need to know part #" + ((int) (Math.random() * 1000));
        String teaser = "and even more #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chameau/Allyouneed.pdf";

        ExternalDocLink doc2 = new ExternalDocLink();
        doc2.setTitle(title + "2");
        doc2.setTeaser(teaser + "2");
        doc2.setUrl(url + "/2");

        return client.resourceRestEndpoint.createResourceForAbstractCardType(cardTypeId, doc2);
    }

    private ResourceRef retrieveResourceRefForCard(Long cardId) {
        return (ResourceRef) client.resourceRestEndpoint.getResourceChainForCard(cardId)
            .get(0).get(0);
    }

    private ResourceRef retrieveResourceRefForCardContent(Long cardContentId) {
        return (ResourceRef) client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId).get(0).get(0);
    }

    // TODO delete test
}
