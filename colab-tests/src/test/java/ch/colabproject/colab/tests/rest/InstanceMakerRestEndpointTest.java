/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.api.model.project.InstanceMaker;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.token.ModelSharingToken;
import ch.colabproject.colab.api.model.token.Token;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.client.ColabClient;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.mailhog.model.Message;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import java.util.List;
import java.util.regex.Matcher;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of instance maker controller from a client point of view
 *
 * @author sandra
 */
public class InstanceMakerRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testShareModelToSomeone() {
        String mateAddress = "pietro" + ((int) (Math.random() * 1000)) + "@junittest.local";

        ////////////////////////////////////////////////////////////////////////////////////////////
        // this.client sign up as MasterOfModel
        ////////////////////////////////////////////////////////////////////////////////////////////
        TestUser user = this.signup("MasterOfModel",
            "mmaster" + ((int) (Math.random() * 1000)) + "@test.local", "SoSecure");
        this.signIn(user);

        ////////////////////////////////////////////////////////////////////////////////////////////
        // MasterOfModel creates a project model
        // No instance maker is linked
        ////////////////////////////////////////////////////////////////////////////////////////////
        Project projectModel = ColabFactory.createProjectModel(client, "Ultimate model");
        Long projectModelId = projectModel.getId();

        // no instance maker for the moment
        List<InstanceMaker> instanceMakers = client.projectRestEndpoint
            .getInstanceMakers(projectModelId);
        Assertions.assertEquals(0, instanceMakers.size());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // MasterOfModel shares its project to Pietro
        // A pending instance maker is created
        ////////////////////////////////////////////////////////////////////////////////////////////
        mailClient.deleteAllMessages();
        client.projectRestEndpoint.shareModel(projectModelId, mateAddress);

        instanceMakers = client.projectRestEndpoint.getInstanceMakers(projectModelId);
        Assertions.assertEquals(1, instanceMakers.size());

        InstanceMaker theInstanceMaker = instanceMakers.get(0);
        Assertions.assertEquals(projectModelId, theInstanceMaker.getProjectId());
        Assertions.assertNull(theInstanceMaker.getUserId());
        Assertions.assertEquals(mateAddress, theInstanceMaker.getDisplayName());

        ////////////////////////////////////////////////////////////////////////////////////////////
        // Fetch e-mail and extract the token
        ////////////////////////////////////////////////////////////////////////////////////////////
        List<Message> messages = TestHelper.getMessageByRecipient(mailClient, mateAddress);
        Assertions.assertEquals(1, messages.size());
        Message modelSharingMessage = messages.get(0);

        Matcher matcher = TestHelper.extractToken(modelSharingMessage);
        Assertions.assertTrue(matcher.matches());

        Long tokenId = Long.getLong(matcher.group(1));
        String plainToken = matcher.group(2);

        this.mailClient.deleteMessage(modelSharingMessage.getId());

//        ////////////////////////////////////////////////////////////////////////////////////////////
//        // With its own http client 'pietroClient', Pietro fetches the token
//        ////////////////////////////////////////////////////////////////////////////////////////////
//        ColabClient pietroClient = this.createRestClient();
//
//        Token token = pietroClient.tokenRestEndpoint.getToken(tokenId);
//
//        Assertions.assertTrue(token instanceof ModelSharingToken);
//        Assertions.assertTrue(token.isAuthenticationRequired());
//
//        // a try to consume the token without being unauthenticated
//        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_REQUIRED, () -> {
//            // consuming the token without being authenticated is not possible
//            pietroClient.tokenRestEndpoint.consumeToken(tokenId, plainToken);
//        });
//
//        ////////////////////////////////////////////////////////////////////////////////////////////
//        // Pietro sign up as Pietrolino
//        // and tries to fetch the model, but got an access denied
//        ////////////////////////////////////////////////////////////////////////////////////////////
//        TestUser mateUser = this.signup("Pietrolino", "pietrolino@cat.local", "SoSoSoSecure");
//        signIn(pietroClient, mateUser);
//
//        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
//            pietroClient.projectRestEndpoint.getProject(projectModelId);
//        });
//
//        ////////////////////////////////////////////////////////////////////////////////////////////
//        // Pietro consumes the model sharing tokens
//        // The instance maker is then linked to Pietro
//        // and, thus, Pietro can read the project model
//        ////////////////////////////////////////////////////////////////////////////////////////////
//        pietroClient.tokenRestEndpoint.consumeToken(tokenId, plainToken);
//
//        instanceMakers = client.projectRestEndpoint.getInstanceMakers(projectModelId);
//        Assertions.assertEquals(1, instanceMakers.size());
//
//        theInstanceMaker = instanceMakers.get(0);
//        Assertions.assertEquals(projectModelId, theInstanceMaker.getProjectId());
//
//        User pietroUser = pietroClient.userRestEndpoint.getCurrentUser();
//        Assertions.assertEquals(pietroUser.getId(), theInstanceMaker.getUserId());
//        Assertions.assertNull(theInstanceMaker.getDisplayName());
//
//        Project modelProjectForPietro = pietroClient.projectRestEndpoint.getProject(projectModelId);
//        Assertions.assertNotNull(modelProjectForPietro);
    }

}
