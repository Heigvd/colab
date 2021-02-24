/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.exceptions.ColabErrorMessage;
import ch.colabproject.colab.api.model.user.AuthInfo;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.SignUpInfo;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class UserControllerTest extends AbstractArquillianTest {

    /**
     * Create a user, login and logout
     *
     * @throws ColabErrorMessage
     */
    @Test
    public void testCreateUser() throws ColabErrorMessage {
        // Create a brand new user with a local account
        AuthMethod authMethod = userController.getAuthMethod("user@test.local");
        String password = "SoSecuredPassword";

        authMethod.getMandatoryMethod();

        SignUpInfo signup = new SignUpInfo();
        signup.setUsername("GoulashSensei");
        signup.setEmail("user@test.local");
        signup.setSalt(authMethod.getSalt());
        signup.setHashMethod(authMethod.getMandatoryMethod());

        String hash = Helper.bytesToHex(
            authMethod.getMandatoryMethod().hash(password, signup.getSalt()));

        signup.setHash(hash);

        userController.signUp(signup);

        // Log in
        AuthInfo authInfo = new AuthInfo();
        authInfo.setEmail("user@test.local");
        authInfo.setMandatoryHash(hash);

        userController.signIn(authInfo);

        User user = requestManager.getCurrentUser();
        Assertions.assertNotNull(user);

        // Log out
        userController.signOut();
        Assertions.assertNull(requestManager.getCurrentUser());
    }
}
