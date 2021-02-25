/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
import ch.colabproject.colab.api.tests.TestUser;
import javax.ws.rs.ClientErrorException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class UserControllerTest extends AbstractArquillianTest {

    /**
     * Create a user, login and logout
     */
    @Test
    public void testCreateUser() {
        TestUser myUser = this.signup("GoulashSensei", "user@test.local", "SoSecuredPassword");

        this.signIn(myUser);

        User user = client.getCurrentUser();
        Assertions.assertNotNull(user);

        this.signOut();
        Assertions.assertNull(client.getCurrentUser());
    }

    /**
     * Assert authenticate with wrong password fails
     */
    @Test
    public void testAuthenticationFailure() {
        TestUser myUser = this.signup("GoulashSensei", "user@test.local", "SoSecuredPassword");

        myUser.setPassword("WrongPassword");

        Assertions.assertThrows(ClientErrorException.class, () -> {
            this.signIn(myUser);
        });

        User user = client.getCurrentUser();

        Assertions.assertNull(user);
    }

}
