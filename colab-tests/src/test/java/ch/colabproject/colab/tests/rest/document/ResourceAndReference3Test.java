/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.ResourceRef;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationData;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.util.List;
import java.util.Objects;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the resource rest end point from a client point of view.
 * <p>
 * Focus on the advanced life cycle of a resource : publish, discard and restore.
 *
 * @author sandra
 */
public class ResourceAndReference3Test extends AbstractArquillianTest {

    @Test
    public void testPublicationAndResidualOnGlobalType() {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        ColabFactory.createNewCardContent(client, rootCardId).getId();

        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        ColabFactory.getCardContent(client, card1Id).getId();

        ColabFactory.createNewCardContent(client, card1Id).getId();

        ////////////////////////////////////////////////////////////////////////////////////////////
        // now add a resource on the global card type
        // on creation : not published
        // no reference
        ResourceCreationData globalCardTypeResource = new ResourceCreationData();
        globalCardTypeResource.setDocuments(List.of(new ExternalLink()));
        globalCardTypeResource.setAbstractCardTypeId(globalCardTypeId);
        Long globalCardTypeResourceId = client.resourceRestEndpoint
            .createResource(globalCardTypeResource);

        List<AbstractResource> abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(0, abstractResourcesInProject.size());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // publish the resource
        // the references are created
        client.resourceRestEndpoint.publishResource(globalCardTypeResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 reference on card type reference
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertTrue(abstractResourcesInProject.stream()
            .allMatch(resOrRef -> ((resOrRef instanceof ResourceRef)
                && !(((ResourceRef) resOrRef).isResidual()))));

        ////////////////////////////////////////////////////////////////////////////////////////////
        // un-publish the resource
        // the references are set as residual
        client.resourceRestEndpoint.unpublishResource(globalCardTypeResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 reference on card type reference, marked as residual
        // 1 reference on card 1, marked as residual
        // 2 references on card 1's card contents, marked as residual
        Assertions.assertTrue(abstractResourcesInProject.stream()
            .allMatch(resOrRef -> ((resOrRef instanceof ResourceRef)
                && (((ResourceRef) resOrRef).isResidual()))));
    }

    @Test
    public void testPublicationAndResidualOnLocalType() {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // creation of the context : project, local card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        ColabFactory.createNewCardContent(client, rootCardId).getId();

        Long localCardTypeId = ColabFactory.createCardType(client, project).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, localCardTypeId)
            .getId();

        ColabFactory.getCardContent(client, card1Id).getId();

        ColabFactory.createNewCardContent(client, card1Id).getId();

        ////////////////////////////////////////////////////////////////////////////////////////////
        // now add a resource on the local card type
        // on creation : not published
        // no reference
        ResourceCreationData localCardTypeResource = new ResourceCreationData();
        localCardTypeResource.setDocuments(List.of(new ExternalLink()));
        localCardTypeResource.setAbstractCardTypeId(localCardTypeId);
        Long localCardTypeResourceId = client.resourceRestEndpoint
            .createResource(localCardTypeResource);

        List<AbstractResource> abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(1, abstractResourcesInProject.size());
        // 1 resource on local card type
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), localCardTypeResourceId))
            ).count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // publish the resource
        // the references are created
        client.resourceRestEndpoint.publishResource(localCardTypeResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 resource on local card type
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), localCardTypeResourceId))
            ).count());
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(resOrRef -> ((resOrRef instanceof ResourceRef)
                && !(((ResourceRef) resOrRef).isResidual())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // un-publish the resource
        // the references are set as residual
        client.resourceRestEndpoint.unpublishResource(localCardTypeResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 resource on local card type
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), localCardTypeResourceId))
            ).count());
        // 1 reference on card 1, marked as residual
        // 2 references on card 1's card contents, marked as residual
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(resOrRef -> ((resOrRef instanceof ResourceRef)
                && (((ResourceRef) resOrRef).isResidual())))
            .count());
    }

    @Test
    public void testPublicationAndResidualOnCard() {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        ColabFactory.createNewCardContent(client, rootCardId).getId();

        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        ColabFactory.createNewCardContent(client, card1Id).getId();

        ////////////////////////////////////////////////////////////////////////////////////////////
        // now add a resource on the root card
        // on creation : not published
        // references created just for the direct card contents
        ResourceCreationData rootCardResource = new ResourceCreationData();
        rootCardResource.setDocuments(List.of(new ExternalLink()));
        rootCardResource.setCardId(rootCardId);
        Long rootCardResourceId = client.resourceRestEndpoint.createResource(rootCardResource);

        List<AbstractResource> abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(3, abstractResourcesInProject.size());
        // one resource on root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // one ref per root card content
        Assertions.assertEquals(2, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isResidual())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // publish the resource
        // the references are created only for the subcards
        client.resourceRestEndpoint.publishResource(rootCardResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // 1 resource on root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root's card content
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isResidual())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // un-publish the resource
        // the references from the subcards are set as residual
        // the references of the variant are kept
        client.resourceRestEndpoint.unpublishResource(rootCardResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // 1 resource on root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId)))
            .count());
        // 2 references on root's card contents
        Assertions.assertEquals(2, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && Objects.equals(((ResourceRef) resOrRef).getTargetId(),
                        rootCardResourceId)
                    && !(((ResourceRef) resOrRef).isResidual()))
            ).count());
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(Objects.equals(((ResourceRef) resOrRef).getTargetId(),
                        rootCardResourceId))
                    && (((ResourceRef) resOrRef).isResidual())))
            .count());
    }

    @Test
    public void testPublicationAndResidualOnCardContent() {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();

        ColabFactory.createNewCardContent(client, rootCardId).getId();

        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        Long card1Id = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId)
            .getId();

        ColabFactory.createNewCardContent(client, card1Id).getId();

        ////////////////////////////////////////////////////////////////////////////////////////////
        // now add a resource on the root card content
        // on creation : not published
        // references created just for the direct card contents
        ResourceCreationData rootCardContentResource = new ResourceCreationData();
        rootCardContentResource.setDocuments(List.of(new ExternalLink()));
        rootCardContentResource.setCardContentId(rootCardContentId);
        Long rootCardContentResourceId = client.resourceRestEndpoint
            .createResource(rootCardContentResource);

        List<AbstractResource> abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);

        Assertions.assertEquals(1, abstractResourcesInProject.size());
        // 1 resource on root card content
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardContentResourceId))
            ).count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // publish the resource
        // the references are created only for the subcards
        client.resourceRestEndpoint.publishResource(rootCardContentResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 resource on root card content
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardContentResourceId))
            ).count());
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isResidual())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // un-publish the resource
        // the references from the subcards are set as residual
        // the references of the variant are kept
        client.resourceRestEndpoint.unpublishResource(rootCardContentResourceId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(4, abstractResourcesInProject.size());
        // 1 resource on root card content
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardContentResourceId)))
            .count());
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (((ResourceRef) resOrRef).isResidual())))
            .count());
    }

    @Test
    public void testDiscardAndRestoreOnCard() {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // creation of the context : project, global card types, card type, card, sub card
        Project project = ColabFactory.createProject(client, "testResource");
        Long projectId = project.getId();

        Long rootCardId = ColabFactory.getRootCard(client, project).getId();

        Long rootCardContentAId = ColabFactory.getRootContent(client, project).getId();

        Long rootCardContentBId = ColabFactory.createNewCardContent(client, rootCardId).getId();

        Long globalCardTypeId = ColabFactory.createGlobalCardType(client).getId();

        Long cardA1Id = ColabFactory.createNewCard(client, rootCardContentAId, globalCardTypeId)
            .getId();

        client.cardRestEndpoint.getCard(cardA1Id).getCardTypeId();

        Long cardContentA1aId = ColabFactory.getCardContent(client, cardA1Id).getId();

        ColabFactory.createNewCardContent(client, cardA1Id).getId();

        ////////////////////////////////////////////////////////////////////////////////////////////
        // now add a published resource on the root card
        ResourceCreationData rootCardResource = new ResourceCreationData();
        rootCardResource.setDocuments(List.of(new ExternalLink()));
        rootCardResource.setCardId(rootCardId);
        Long rootCardResourceId = client.resourceRestEndpoint.createResource(rootCardResource);
        client.resourceRestEndpoint.publishResource(rootCardResourceId);

        List<AbstractResource> abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource on the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root card's card contents
        // 1 reference on card A 1
        // 2 references on card A 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // discard the resource reference on the root content B
        List<List<AbstractResource>> resources = client.resourceRestEndpoint
            .getResourceChainForCardContent(rootCardContentBId);
        Assertions.assertNotNull(resources);
        Assertions.assertEquals(1, resources.size());
        Assertions.assertNotNull(resources.get(0));
        Assertions.assertTrue(1 <= resources.get(0).size());
        Assertions.assertTrue(resources.get(0).get(0) instanceof ResourceRef);
        Long resourceRefOnRootCardContentBId = ((ResourceRef) resources.get(0).get(0)).getId();

        client.resourceRestEndpoint.discardResourceOrRef(resourceRefOnRootCardContentBId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource of the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // the reference on the root content B
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && Objects.equals(resOrRef.getCardContentId(), rootCardContentBId)
                    && (((ResourceRef) resOrRef).isRefused())))
            .count());
        // 1 reference on root content A
        // 1 reference on card A 1
        // 2 references on card A 1 's card contents
        Assertions.assertEquals(4, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // restore the resource reference on the root content B

        client.resourceRestEndpoint.restoreResourceOrRef(resourceRefOnRootCardContentBId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource on the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root card's card contents
        // 1 reference on card A 1
        // 2 references on card A 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // discard the resource reference on the root content A
        resources = client.resourceRestEndpoint.getResourceChainForCardContent(rootCardContentAId);
        Assertions.assertNotNull(resources);
        Assertions.assertEquals(1, resources.size());
        Assertions.assertNotNull(resources.get(0));
        Assertions.assertTrue(1 <= resources.get(0).size());
        Assertions.assertTrue(resources.get(0).get(0) instanceof ResourceRef);
        Long resourceRefOnRootCardContentAId = ((ResourceRef) resources.get(0).get(0)).getId();

        client.resourceRestEndpoint.discardResourceOrRef(resourceRefOnRootCardContentAId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource of the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 1 references on root card's card content A
        // 1 reference on card A 1
        // 2 references on card A 1's card contents
        Assertions.assertEquals(4, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (((ResourceRef) resOrRef).isRefused())))
            .count());
        // 1 references on root card's card content B
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (Objects.equals(resOrRef.getCardContentId(), rootCardContentBId))
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // restore the resource reference on the root content A

        client.resourceRestEndpoint.restoreResourceOrRef(resourceRefOnRootCardContentAId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource on the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root card's card contents
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // discard the resource reference on the card A 1
        resources = client.resourceRestEndpoint.getResourceChainForCard(cardA1Id);
        Assertions.assertNotNull(resources);
        Assertions.assertEquals(1, resources.size());
        Assertions.assertNotNull(resources.get(0));
        Assertions.assertTrue(1 <= resources.get(0).size());
        Assertions.assertTrue(resources.get(0).get(0) instanceof ResourceRef);
        Long resourceRefOnCardA1Id = ((ResourceRef) resources.get(0).get(0)).getId();

        client.resourceRestEndpoint.discardResourceOrRef(resourceRefOnCardA1Id);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource of the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 1 reference on card A 1
        // 2 references on card A 1's card contents
        Assertions.assertEquals(3, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (((ResourceRef) resOrRef).isRefused())))
            .count());
        // 1 references on root card's card content A
        // 1 references on root card's card content B
        Assertions.assertEquals(2, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (Objects.equals(resOrRef.getCardContentId(), rootCardContentBId)
                        || Objects.equals(resOrRef.getCardContentId(), rootCardContentAId))
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // restore the resource reference on the card A 1

        client.resourceRestEndpoint.restoreResourceOrRef(resourceRefOnCardA1Id);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource on the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root card's card contents
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // discard the resource reference on the card content A 1 a
        resources = client.resourceRestEndpoint.getResourceChainForCardContent(cardContentA1aId);
        Assertions.assertNotNull(resources);
        Assertions.assertEquals(1, resources.size());
        Assertions.assertNotNull(resources.get(0));
        Assertions.assertTrue(1 <= resources.get(0).size());
        Assertions.assertTrue(resources.get(0).get(0) instanceof ResourceRef);
        Long resourceRefOnCardContentA1aId = ((ResourceRef) resources.get(0).get(0)).getId();

        client.resourceRestEndpoint.discardResourceOrRef(resourceRefOnCardContentA1aId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource of the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 1 references on card A 1's card contents a
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && (Objects.equals(resOrRef.getCardContentId(), cardContentA1aId))
                    && (((ResourceRef) resOrRef).isRefused())))
            .count());
        // 1 references on root card's card content A
        // 1 references on root card's card content B
        // 1 reference on card A 1
        // 1 references on card A 1's card contents b
        Assertions.assertEquals(4, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // restore the resource reference on the root content B

        client.resourceRestEndpoint.restoreResourceOrRef(resourceRefOnCardContentA1aId);

        abstractResourcesInProject = client.resourceRestEndpoint
            .getDirectAbstractResourcesOfProject(projectId);
        Assertions.assertEquals(6, abstractResourcesInProject.size());
        // the resource on the root card
        Assertions.assertEquals(1, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof Resource
                    && Objects.equals(resOrRef.getId(), rootCardResourceId))
            ).count());
        // 2 references on root card's card contents
        // 1 reference on card 1
        // 2 references on card 1's card contents
        Assertions.assertEquals(5, abstractResourcesInProject.stream()
            .filter(
                resOrRef -> (resOrRef instanceof ResourceRef
                    && !(((ResourceRef) resOrRef).isRefused())))
            .count());
    }

}
