package ch.colabproject.colab.tests.rest.document;

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
public class ResourceRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testOnCardType() {
        helper(Access.CARD_TYPE,
            Set.of(),
            Set.of(Access.CARD_TYPE, Access.CARD, Access.CARD_CONTENT));
    }

    @Test
    public void testOnCardTypePublished() {
        helper(Access.CARD_TYPE,
            Set.of(ResourceState.PUBLISHED),
            Set.of(Access.CARD_TYPE, Access.CARD, Access.CARD_CONTENT,
                Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnCard() {
        helper(Access.CARD,
            Set.of(),
            Set.of(Access.CARD, Access.CARD_CONTENT));
    }

    @Test
    public void testOnCardPublished() {
        helper(Access.CARD,
            Set.of(ResourceState.PUBLISHED),
            Set.of(Access.CARD, Access.CARD_CONTENT, Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnCardContent() {
        helper(Access.CARD_CONTENT,
            Set.of(),
            Set.of(Access.CARD_CONTENT));
    }

    @Test
    public void testOnCardContentPublished() {
        helper(Access.CARD_CONTENT,
            Set.of(ResourceState.PUBLISHED),
            Set.of(Access.CARD_CONTENT, Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardType() {
        helper(Access.SUB_CARD_TYPE,
            Set.of(),
            Set.of(Access.SUB_CARD_TYPE, Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCard() {
        helper(Access.SUB_CARD,
            Set.of(),
            Set.of(Access.SUB_CARD, Access.SUB_CARD_CONTENT));
    }

    @Test
    public void testOnSubCardContent() {
        helper(Access.SUB_CARD_CONTENT,
            Set.of(),
            Set.of(Access.SUB_CARD_CONTENT));
    }

    private enum Access {
        CARD_TYPE,
        CARD,
        CARD_CONTENT,
        SUB_CARD_TYPE,
        SUB_CARD,
        SUB_CARD_CONTENT;
    }

    private enum ResourceState {
        PUBLISHED,
        REQUESTING_FOR_GLORY,
        DEPRECATED;
    }

    private void helper(Access resourceSpace, Set<ResourceState> resourceState,
        Set<Access> accessToResource) {
        // creation of the context : project, 2 card types, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        Long cardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, cardTypeId).getId();

        Long cardContentId = ColabFactory.getCardContent(client, cardId).getId();

        Long subCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long subCardId = ColabFactory.createNewCard(client, cardContentId, subCardTypeId).getId();

        Long subCardContentId = ColabFactory.getCardContent(client, subCardId).getId();

        // creation of a resource

        String title = "The game encyclopedia #" + ((int) (Math.random() * 1000));
        String teaser = "Word by word descriptions #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chat/theGameEncyclopedia.pdf";

        ExternalDocLink doc = new ExternalDocLink();
        doc.setTitle(title);
        doc.setTeaser(teaser);
        doc.setUrl(url);

        Resource persistedResource;

        switch (resourceSpace) {
            case CARD_TYPE:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardType(cardTypeId, doc);
                break;
            case CARD:
                persistedResource = client.resourceRestEndpoint.createResourceForCard(cardId, doc);
                break;
            case CARD_CONTENT:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardContent(cardContentId, doc);
                break;
            case SUB_CARD_TYPE:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardType(subCardTypeId, doc);
                break;
            case SUB_CARD:
                persistedResource = client.resourceRestEndpoint.createResourceForCard(subCardId,
                    doc);
                break;
            case SUB_CARD_CONTENT:
                persistedResource = client.resourceRestEndpoint
                    .createResourceForCardContent(subCardContentId, doc);
                break;
            default:
                Assertions.fail();
                persistedResource = new Resource(); // just for compilation / code checks
                break;
        }

        if (!resourceState.isEmpty()) {
            if (resourceState.contains(ResourceState.PUBLISHED)) {
                persistedResource.setPublished(true);
            }

            if (resourceState.contains(ResourceState.REQUESTING_FOR_GLORY)) {
                persistedResource.setRequestingForGlory(true);
            }

            if (resourceState.contains(ResourceState.DEPRECATED)) {
                persistedResource.setDeprecated(true);
            }

            client.resourceRestEndpoint.updateResource(persistedResource);

            persistedResource = client.resourceRestEndpoint.getResource(persistedResource.getId());
        }

        Assertions.assertNotNull(persistedResource);
        Assertions.assertNotNull(persistedResource.getId());
        switch (resourceSpace) {
            case CARD_TYPE:
                Assertions.assertEquals(cardTypeId, persistedResource.getAbstractCardTypeId());
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
        Assertions.assertTrue(
            resourceState.contains(ResourceState.PUBLISHED) == persistedResource.isPublished());
        Assertions.assertTrue(resourceState.contains(
            ResourceState.REQUESTING_FOR_GLORY) == persistedResource.isRequestingForGlory());
        Assertions.assertTrue(
            resourceState.contains(ResourceState.DEPRECATED) == persistedResource.isDeprecated());
        Assertions.assertNotNull(persistedResource.getDocumentId());

        Long documentId = persistedResource.getDocumentId();
        Document persistedDocument = client.documentRestEndPoint.getDocument(documentId);
        Assertions.assertNotNull(persistedDocument);
        Assertions.assertEquals(documentId, persistedDocument.getId());
        Assertions.assertEquals(title, persistedDocument.getTitle());
        Assertions.assertEquals(teaser, persistedDocument.getTeaser());
        Assertions.assertTrue(persistedDocument instanceof ExternalDocLink);
        ExternalDocLink persistedExtDocLink = (ExternalDocLink) persistedDocument;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());

        if (accessToResource.contains(Access.CARD_TYPE)) {
            List<Resource> persistedCardTypeResources = client.cardTypeRestEndpoint
                .getAvailableActiveLinkedResources(cardTypeId);
            Assertions.assertNotNull(persistedCardTypeResources);
            Assertions.assertEquals(1, persistedCardTypeResources.size());
            Assertions.assertEquals(persistedResource, persistedCardTypeResources.get(0));
        } else {
            List<Resource> persistedCardTypeResources = client.cardTypeRestEndpoint
                .getAvailableActiveLinkedResources(cardTypeId);
            Assertions.assertNotNull(persistedCardTypeResources);
            Assertions.assertEquals(0, persistedCardTypeResources.size());
        }

        if (accessToResource.contains(Access.CARD)) {
            List<Resource> persistedCardResources = client.cardRestEndpoint
                .getAvailableActiveLinkedResources(cardId);
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(1, persistedCardResources.size());
            Assertions.assertEquals(persistedResource, persistedCardResources.get(0));
        } else {
            List<Resource> persistedCardResources = client.cardRestEndpoint
                .getAvailableActiveLinkedResources(cardId);
            Assertions.assertNotNull(persistedCardResources);
            Assertions.assertEquals(0, persistedCardResources.size());
        }

        if (accessToResource.contains(Access.CARD_CONTENT)) {
            List<Resource> persistedCardContentResources = client.cardContentRestEndpoint
                .getAvailableActiveLinkedResources(cardContentId);
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(1, persistedCardContentResources.size());
            Assertions.assertEquals(persistedResource, persistedCardContentResources.get(0));
        } else {
            List<Resource> persistedCardContentResources = client.cardContentRestEndpoint
                .getAvailableActiveLinkedResources(cardContentId);
            Assertions.assertNotNull(persistedCardContentResources);
            Assertions.assertEquals(0, persistedCardContentResources.size());
        }

        if (accessToResource.contains(Access.SUB_CARD_TYPE)) {
            List<Resource> persistedCardTypeResources = client.cardTypeRestEndpoint
                .getAvailableActiveLinkedResources(subCardTypeId);
            Assertions.assertNotNull(persistedCardTypeResources);
            Assertions.assertEquals(1, persistedCardTypeResources.size());
            Assertions.assertEquals(persistedResource, persistedCardTypeResources.get(0));
        } else {
            List<Resource> persistedCardTypeResources = client.cardTypeRestEndpoint
                .getAvailableActiveLinkedResources(subCardTypeId);
            Assertions.assertNotNull(persistedCardTypeResources);
            Assertions.assertEquals(0, persistedCardTypeResources.size());
        }

        if (accessToResource.contains(Access.SUB_CARD)) {
            List<Resource> persistedSubCardResources = client.cardRestEndpoint
                .getAvailableActiveLinkedResources(subCardId);
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(1, persistedSubCardResources.size());
            Assertions.assertEquals(persistedResource, persistedSubCardResources.get(0));
        } else {
            List<Resource> persistedSubCardResources = client.cardRestEndpoint
                .getAvailableActiveLinkedResources(subCardId);
            Assertions.assertNotNull(persistedSubCardResources);
            Assertions.assertEquals(0, persistedSubCardResources.size());
        }

        if (accessToResource.contains(Access.SUB_CARD_CONTENT)) {
            List<Resource> persistedSubCardContentResources = client.cardContentRestEndpoint
                .getAvailableActiveLinkedResources(subCardContentId);
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(1, persistedSubCardContentResources.size());
            Assertions.assertEquals(persistedResource, persistedSubCardContentResources.get(0));
        } else {
            List<Resource> persistedSubCardContentResources = client.cardContentRestEndpoint
                .getAvailableActiveLinkedResources(subCardContentId);
            Assertions.assertNotNull(persistedSubCardContentResources);
            Assertions.assertEquals(0, persistedSubCardContentResources.size());
        }
    }

    // *********************************************************************************************
    // Category
    // *********************************************************************************************

    @Test
    public void testCategory() {
        Long projectId = ColabFactory
            .createProject(client, "test resources project #" + ((int) (Math.random() * 1000)))
            .getId();

        Long cardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Resource persistedResource1 = createResourceForCardType(cardTypeId);
        Long resource1Id = persistedResource1.getId();
        Assertions.assertNull(persistedResource1.getCategory());

        Resource persistedResource2 = createResourceForCardType(cardTypeId);
        Long resource2Id = persistedResource2.getId();
        Assertions.assertNull(persistedResource2.getCategory());

        String categoryNameA = "Guides #" + ((int) (Math.random() * 1000));
        String categoryNameB = "Work files +\"*ç%&/()=?^±“#Ç[]|{}≠¿´<>,.-¨$"
            + ((int) (Math.random() * 1000));

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameA);
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource2Id, categoryNameA);
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList("   ",
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint
            .removeCategoryForList(Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertNull(persistedResource1.getCategory());
        Assertions.assertNull(persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resource1Id, resource2Id));
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertEquals(categoryNameA, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.setCategory(resource1Id, categoryNameB);
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
        Assertions.assertEquals(categoryNameB, persistedResource1.getCategory());
        Assertions.assertEquals(categoryNameA, persistedResource2.getCategory());

        client.resourceRestEndpoint.removeCategory(resource1Id);
        persistedResource1 = client.resourceRestEndpoint.getResource(resource1Id);
        persistedResource2 = client.resourceRestEndpoint.getResource(resource2Id);
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

        Long subCardType2Id = ColabFactory.createCardType(client, projectId).getId();

        Long subCard2Id = ColabFactory.createNewCard(client, cardContent1Id, subCardType2Id)
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
        Resource resourceOfCardType1 = createResourceForCardType(cardType1Id);
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

        Resource persistedResource3 = createResourceForCardType(cardType1Id);
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
        persistedResource3 = client.resourceRestEndpoint.getResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // set categoryNameA for each

        client.resourceRestEndpoint.setCategoryForList(categoryNameA,
            Lists.newArrayList(resourceOfCardType1Id,
                resourceRefOfCard1Id, resourceRefOfCardContent1Id,
                resourceRefOfSubCard2Id//,
//                resourceRefOfCardIIId
                ));
        // no category for resourceRefOfSubCardContent2Id

        resourceOfCardType1 = client.resourceRestEndpoint.getResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameA, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = client.resourceRestEndpoint.getResourceReference(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameA, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        resourceRefOfCardII = client.resourceRestEndpoint.getResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category A -> B at card type level
        client.resourceRestEndpoint.renameCategoryForCardType(project.getId(), cardType1Id,
            categoryNameA, categoryNameB);

        resourceOfCardType1 = client.resourceRestEndpoint.getResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = client.resourceRestEndpoint.getResourceReference(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameB, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        // in another project, stay category A
//        resourceRefOfCardII = client.resourceRestEndpoint.getResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());

        // rename category B -> C at card 1 level
        client.resourceRestEndpoint.renameCategoryForCard(card1Id, categoryNameB,
            categoryNameC);

        resourceOfCardType1 = client.resourceRestEndpoint.getResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = client.resourceRestEndpoint.getResourceReference(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category C -> D at card content 1 level
        client.resourceRestEndpoint.renameCategoryForCardContent(cardContent1Id, categoryNameC,
            categoryNameD);

        resourceRefOfCard1 = client.resourceRestEndpoint.getResourceReference(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // rename category D -> E at sub card 2 level
        client.resourceRestEndpoint.renameCategoryForCard(subCard2Id, categoryNameD,
            categoryNameE);

        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());

        // recapitulation at this point
//        resourceRefOfCardII = client.resourceRestEndpoint.getResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameA, resourceRefOfCardII.getCategory());
        resourceOfCardType1 = client.resourceRestEndpoint.getResource(resourceOfCardType1Id);
        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
        resourceRefOfCard1 = client.resourceRestEndpoint.getResourceReference(resourceRefOfCard1Id);
        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
        resourceRefOfCardContent1 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfCardContent1Id);
        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
        resourceRefOfSubCard2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCard2Id);
        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
            .getResourceReference(resourceRefOfSubCardContent2Id);
        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
        persistedResource3 = client.resourceRestEndpoint.getResource(resource3Id);
        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());

        // rename category A -> B at card type level
//        client.resourceRestEndpoint.renameCategoryForCardType(projectII.getId(), cardType1Id,
//            categoryNameA, categoryNameF);
//
//        resourceRefOfCardII = client.resourceRestEndpoint.getResource(resourceRefOfCardIIId);
//        Assertions.assertEquals(categoryNameF, resourceRefOfCardII.getCategory());
//        resourceOfCardType1 = client.resourceRestEndpoint.getResource(resourceOfCardType1Id);
//        Assertions.assertEquals(categoryNameB, resourceOfCardType1.getCategory());
//        resourceRefOfCard1 = client.resourceRestEndpoint.getResource(resourceRefOfCard1Id);
//        Assertions.assertEquals(categoryNameC, resourceRefOfCard1.getCategory());
//        resourceRefOfCardContent1 = client.resourceRestEndpoint
//            .getResource(resourceRefOfCardContent1Id);
//        Assertions.assertEquals(categoryNameD, resourceRefOfCardContent1.getCategory());
//        resourceRefOfSubCard2 = client.resourceRestEndpoint
//            .getResource(resourceRefOfSubCard2Id);
//        Assertions.assertEquals(categoryNameE, resourceRefOfSubCard2.getCategory());
//        resourceRefOfSubCardContent2 = client.resourceRestEndpoint
//            .getResource(resourceRefOfSubCardContent2Id);
//        Assertions.assertNull(resourceRefOfSubCardContent2.getCategory());
//        persistedResource3 = client.resourceRestEndpoint.getResource(resource3Id);
//        Assertions.assertEquals(categoryNameO, persistedResource3.getCategory());
    }

    // TODO check propagation with particular attention with multiple projects / sub card / card +
    // type + content consistency

    private Resource createResourceForCardType(Long cardTypeId) {
        String title = "All you need to know part #" + ((int) (Math.random() * 1000));
        String teaser = "and even more #" + ((int) (Math.random() * 1000));
        String url = "http://www.123soleil.chameau/Allyouneed.pdf";

        ExternalDocLink doc2 = new ExternalDocLink();
        doc2.setTitle(title + "2");
        doc2.setTeaser(teaser + "2");
        doc2.setUrl(url + "/2");

        return client.resourceRestEndpoint.createResourceForCardType(cardTypeId, doc2);
    }

    private ResourceRef retrieveResourceRefForCard(Long cardId) {
        return (ResourceRef) client.cardRestEndpoint.getDirectAbstractResourcesOfCard(cardId)
            .get(0);
    }

    private ResourceRef retrieveResourceRefForCardContent(Long cardContentId) {
        return (ResourceRef) client.cardContentRestEndpoint
            .getDirectAbstractResourcesOfCardContent(cardContentId).get(0);
    }

}
