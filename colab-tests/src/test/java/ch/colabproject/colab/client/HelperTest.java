/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.client;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.model.user.HashMethod;
import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class HelperTest {

    public HelperTest() {
    }

    @Test
    public void testBytesToHex() {
        String s ="Hello";
        byte[] bytes = s.getBytes(StandardCharsets.UTF_8);
        String hex = Helper.bytesToHex(bytes);

        byte[] reBytes = Helper.hextToBytes(hex);

        String s2 = new String(reBytes, StandardCharsets.UTF_8);

        Assertions.assertEquals(s, s2);
    }

    @Test
    public void testAuthMethod() {
        byte[] salt = Helper.generateSalt(64);
        System.out.println("Salt: " + salt);

        for (HashMethod m : HashMethod.values()) {
            byte[] hash = m.hash("MySecurePassword", salt);
            String bytesToHex = Helper.bytesToHex(hash);
            System.out.println("Hex for " + m.name() + " => " + bytesToHex);
        }
    }

    @Test
    public void testIsEmailAddress() {
        Assertions.assertTrue(Helper.isEmailAddress("alice@domain.tld"));

        Assertions.assertTrue(Helper.isEmailAddress("bob+colab@domain.tld"));
    }
}
