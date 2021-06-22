package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalDocLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
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

        Long cardContentId = client.cardRestEndpoint.getContentVariantsOfCard(cardId).get(0).getId();

        Long subCardTypeId = ColabFactory.createCardType(client, projectId).getId();

        Long subCardId = ColabFactory.createNewCard(client, cardContentId, subCardTypeId).getId();

        Long subCardContentId  = client.cardRestEndpoint.getContentVariantsOfCard(subCardId).get(0).getId();

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

}
