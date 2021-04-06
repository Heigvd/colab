/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.api.model.user.AuthMethod;
import ch.colabproject.colab.api.model.user.LocalAccount;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.persistence.user.UserDao;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.TestHelper;
import ch.colabproject.colab.tests.tests.TestUser;
import java.util.Arrays;
import java.util.Date;
import javax.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class UserControllerTest extends AbstractArquillianTest {

    /**
     * Internal userManagement logic. Required to inspect properties not exposed through REST API.
     */
    @Inject
    private UserDao userDao;

    /**
     * Create a user, login, update user and account, and logout
     */
    @Test
    public void testCreateUser() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);

        User user = client.userController.getCurrentUser();
        Assertions.assertNotNull(user);

        String cn = "Goulash Sensei";
        String fn = "Georges";
        String ln = "Croivet-Batton";

        user.setCommonname(cn);
        user.setFirstname(fn);
        user.setLastname(ln);

        client.userController.updateUser(user);

        user = client.userController.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());

        this.signOut();
        Assertions.assertNull(client.userController.getCurrentUser());
    }

    /**
     * make sure client can not update internal user field
     */
    @Test
    public void testUpdateUserInternalFields() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        this.signIn(myUser);

        User user = client.userController.getCurrentUser();
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

        client.userController.updateUser(user);

        user = client.userController.getCurrentUser();
        Assertions.assertEquals(cn, user.getCommonname());
        Assertions.assertEquals(fn, user.getFirstname());
        Assertions.assertEquals(ln, user.getLastname());

        Assertions.assertFalse(user.isAdmin());

        this.signOut();
        Assertions.assertNull(client.userController.getCurrentUser());
    }

    /**
     * Assert authenticate with wrong password fails
     */
    @Test
    public void testAuthenticationFailure() {
        this.signOut();
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        myUser.setPassword("WrongPassword");

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.AUTHENTICATION_FAILED, () -> {
            this.signIn(myUser);
        });

        User user = client.userController.getCurrentUser();

        Assertions.assertNull(user);
    }

    /**
     * Assert one admin can give admin rights to some other user
     */
    @Test
    public void testGrantAdminRight() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword"
        );

        this.signIn(myUser);
        User sensei = client.userController.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());

        this.signOut();
        this.signIn(this.admin);

        User adminUser = client.userController.getCurrentUser();
        Assertions.assertTrue(adminUser.isAdmin());

        client.userController.grantAdminRight(sensei.getId());

        this.signOut();
        this.signIn(myUser);
        sensei = client.userController.getCurrentUser();
        Assertions.assertTrue(sensei.isAdmin());
    }


    /**
     * Assert a non-admin can not give admin rights to some other user
     */
    @Test
    public void testUnauthorizedGrantAdminRight() {
        TestUser myUser = this
            .signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        this.signIn(myUser);
        User sensei = client.userController.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
        Long senseiId = sensei.getId();

        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userController.grantAdminRight(senseiId);
        });

        sensei = client.userController.getCurrentUser();
        Assertions.assertFalse(sensei.isAdmin());
    }

    /**
     * Test switch to new client hash method
     */
    @Test
    public void testRotateClientHashMethod() {
        TestUser myUser = this
            .signup("GoulashSensei", "goulashsensei@test.local", "SoSecuredPassword");

        AuthMethod initialAuthMethod = client.userController.getAuthMethod(myUser.getEmail());

        this.signIn(myUser);
        LocalAccount senseiAccount = (LocalAccount) client.userController.getCurrentAccount();

        this.signOut();
        this.signIn(this.admin);

        client.userController.switchClientHashMethod(senseiAccount.getId());

        AuthMethod pendingAuthMethod = client.userController.getAuthMethod(myUser.getEmail());

        // Mandatory method is still the same
        Assertions.assertEquals(initialAuthMethod.getSalt(), pendingAuthMethod.getSalt());
        Assertions.assertEquals(initialAuthMethod.getMandatoryMethod(), pendingAuthMethod
            .getMandatoryMethod());

        // Optional method is read to be used
        Assertions.assertNotNull(pendingAuthMethod.getNewSalt());
        Assertions.assertNotNull(pendingAuthMethod.getOptionalMethod());

        this.signOut();
        // sign in will trigger method rotation
        this.signIn(myUser);

        AuthMethod newAuthMethod = client.userController.getAuthMethod(myUser.getEmail());

        // Mandatory method is the new one
        Assertions.assertEquals(pendingAuthMethod.getNewSalt(), newAuthMethod.getSalt());
        Assertions.assertEquals(pendingAuthMethod.getOptionalMethod(), newAuthMethod
            .getMandatoryMethod());
        // there is no optinal method any longer
        Assertions.assertNull(newAuthMethod.getNewSalt());
        Assertions.assertNull(newAuthMethod.getOptionalMethod());

        this.signOut();
        User user = client.userController.getCurrentUser();
        Assertions.assertNull(user);
        // sign in one more time to authenticate with new method
        this.signIn(myUser);
        user = client.userController.getCurrentUser();
        Assertions.assertNotNull(user);
    }

    /**
     * Test switch to new server hash method
     */
    @Test
    public void testRotateServerHashMethod() {
        TestUser myUser = this.signup("GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount senseiAccount = (LocalAccount) client.userController.getCurrentAccount();

        User internalUser = userDao.findUserByUsername(myUser.getUsername());
        LocalAccount internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        byte[] dbSalt = internalAccount.getDbSalt();

        this.signOut();
        this.signIn(this.admin);

        client.userController.switchServerHashMethod(senseiAccount.getId());

        // assert next db method is staged
        internalUser = userDao.findUserByUsername(myUser.getUsername());
        internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        Assertions.assertNotNull(internalAccount.getNextDbHashMethod());

        // sign in again will trigger method rotation
        this.signOut();
        this.signIn(myUser);

        internalUser = userDao.findUserByUsername(myUser.getUsername());
        internalAccount = (LocalAccount) internalUser.getAccounts().get(0);
        Assertions.assertNull(internalAccount.getNextDbHashMethod());
        Assertions.assertFalse(Arrays.equals(dbSalt, internalAccount.getDbSalt()));

        // sign in one more time to authenticate with new method
        this.signOut();
        User user = client.userController.getCurrentUser();
        Assertions.assertNull(user);
        this.signIn(myUser);
        user = client.userController.getCurrentUser();
        Assertions.assertNotNull(user);
    }

    /**
     * Test verifiy account process
     */
    @Test
    public void testVerify() {
        TestUser myUser = this.signup(
            "GoulashSensei",
            "goulashsensei@test.local",
            "SoSecuredPassword");

        this.signIn(myUser);
        LocalAccount account = (LocalAccount) this.client.userController.getCurrentAccount();
        Assertions.assertFalse(account.isVerified());

        this.verifyAccounts();

        account = (LocalAccount) this.client.userController.getCurrentAccount();
        Assertions.assertTrue(account.isVerified());
    }
}
