/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest;

import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.tests.AbstractArquillianTest;
import ch.colabproject.colab.api.tests.TestUser;
import java.util.Date;
import javax.ws.rs.ClientErrorException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class UserControllerTest extends AbstractArquillianTest {

    /**
     * Create a user, login, update user and account, and logout
     */
    @Test
    public void testCreateUser() {
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);

        User user = client.getCurrentUser();
        Assertions.assertNotNull(user);

        String cn = "Goulash Sensei";
        String fn = "Georges";
        String ln = "Croivet-Batton";

        user.setCommonname(cn);
        user.setFirstname(fn);
        user.setLastname(ln);

        client.updateUser(user);

        user = client.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());

        this.signOut();
        Assertions.assertNull(client.getCurrentUser());
    }

    /**
     * make sure client can not update internal user field
     */
    @Test
    public void testUpdateUserInternalFields() {
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);

        User user = client.getCurrentUser();
        Assertions.assertNotNull(user);

        String cn = "Goulash Sensei";
        String fn = "Georges";
        String ln = "Croivet-Batton";

        // authorized
        user.setCommonname(cn);
        user.setFirstname(fn);
        user.setLastname(ln);

        // not authorized
        user.setAdmin(true);
        user.setLastSeenAt(new Date(0));

        client.updateUser(user);

        user = client.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());

        Assertions.assertFalse(user.isAdmin());

        this.signOut();
        Assertions.assertNull(client.getCurrentUser());
    }

    /**
     * Assert authenticate with wrong password fails
     */
    @Test
    public void testAuthenticationFailure() {
        this.signOut();
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        myUser.setPassword("WrongPassword");

        Assertions.assertThrows(ClientErrorException.class, () -> {
            this.signIn(myUser);
        });

        User user = client.getCurrentUser();

        Assertions.assertNull(user);
    }

    @Test
    public void testGrantAdminRight() {
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);
        User sensei = client.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());

        this.signOut();
        this.signIn(this.admin);

        User adminUser = client.getCurrentUser();
        Assertions.assertTrue(adminUser.isAdmin());

        client.grantAdminRight(sensei.getId());

        this.signOut();
        this.signIn(myUser);
        sensei = client.getCurrentUser();
        Assertions.assertTrue(sensei.isAdmin());
    }

    @Test
    public void testUnauthorizedGrandAdminRight() {
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);
        User sensei = client.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
        Long senseiId = sensei.getId();

        Assertions.assertThrows(ClientErrorException.class, () -> {
            client.grantAdminRight(senseiId);
        });

        sensei = client.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
    }

    @Test
    public void testRotateClientHashMethod() {
        TestUser myUser = this.signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        AuthMethod initialAuthMethod = client.getAuthMethod(myUser.getEmail());

        this.signIn(myUser);
        LocalAccount senseiAccount = (LocalAccount) client.getCurrentAccount();
        System.out.println("snsei: " + senseiAccount.getId());
        System.out.println("snsei: " + senseiAccount.getEmail());

        this.signOut();
        this.signIn(this.admin);

        client.switchClientHashMethod(senseiAccount.getId());

        AuthMethod pendingAuthMethod = client.getAuthMethod(myUser.getEmail());

        // Mandatory method is still the same
        Assertions.assertEquals(initialAuthMethod.getSalt(), pendingAuthMethod.getSalt());
        Assertions.assertEquals(initialAuthMethod.getMandatoryMethod(), pendingAuthMethod.getMandatoryMethod());

        // Optional method is read to be used
        Assertions.assertNotNull(pendingAuthMethod.getNewSalt());
        Assertions.assertNotNull(pendingAuthMethod.getOptionalMethod());

        this.signOut();
        // sign in will trigger method rotation
        this.signIn(myUser);

        AuthMethod newAuthMethod = client.getAuthMethod(myUser.getEmail());

        // Mandatory method is the new one
        Assertions.assertEquals(pendingAuthMethod.getNewSalt(), newAuthMethod.getSalt());
        Assertions.assertEquals(pendingAuthMethod.getOptionalMethod(), newAuthMethod.getMandatoryMethod());
        // there is no optinal method any longer
        Assertions.assertNull(newAuthMethod.getNewSalt());
        Assertions.assertNull(newAuthMethod.getOptionalMethod());

        this.signOut();
        User user = client.getCurrentUser();
        Assertions.assertNull(user);
        // sign in one more time to authentite with new method
        this.signIn(myUser);
        user = client.getCurrentUser();
        Assertions.assertNotNull(user);
    }
}
