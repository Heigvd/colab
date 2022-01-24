/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationBean;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import com.google.common.collect.Lists;

/**
 * Testing of the resource rest end point from a client point of view
 * <p>
 * Focus on category handling
 *
 * @author sandra
 */
public class ResourceCategoryRestEndpointTest extends AbstractArquillianTest {

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

        TextDataBlock teaserBlock = new TextDataBlock();
        teaserBlock.setMimeType("text/markdown");
        teaserBlock.setTextData(teaser);

        ExternalLink document = new ExternalLink();
        document.setUrl(url);

        ResourceCreationBean resourceCreationBean = new ResourceCreationBean();
        resourceCreationBean.setTitle(title);
        resourceCreationBean.setTeaser(teaserBlock);
        resourceCreationBean.setDocuments(List.of(document));
        resourceCreationBean.setAbstractCardTypeId(cardTypeId);

        Long persistedResourceId = client.resourceRestEndpoint.createResource(resourceCreationBean);

        return (Resource) client.resourceRestEndpoint.getAbstractResource(persistedResourceId);
    }

    private ResourceRef retrieveResourceRefForCard(Long cardId) {
        return (ResourceRef) client.resourceRestEndpoint.getResourceChainForCard(cardId)
            .get(0).get(0);
    }

    private ResourceRef retrieveResourceRefForCardContent(Long cardContentId) {
        return (ResourceRef) client.resourceRestEndpoint
            .getResourceChainForCardContent(cardContentId).get(0).get(0);
    }

}
