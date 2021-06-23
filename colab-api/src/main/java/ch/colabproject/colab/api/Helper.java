/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api;

import ch.colabproject.colab.api.model.user.HashMethod;
import java.security.SecureRandom;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.naming.InitialContext;
import javax.naming.NamingException;

/**
 * Some global helper methods
 *
 * @author maxence
 */
public class Helper {

    /**
     * pattern to check if a string looks like an email address
     */
    private static final Pattern EMAIL_PATTERN = Pattern
        .compile("(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)\\])");

    /**
     * never-called private constructor
     */
    private Helper() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Convert byte array to hex string
     *
     * @param hash byte array to convert
     *
     * @return hex string representation of the byte array
     */
    public static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (int i = 0; i < hash.length; i++) {
            String hex = Integer.toHexString(0xff & hash[i]);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Convert byte array to hex string
     *
     * @param hex hex string to convert
     *
     * @return byte array
     */
    public static byte[] hextToBytes(String hex) {
        if (hex != null) {
            byte[] bytes = new byte[hex.length() / 2];

            int j = 0;
            for (int i = 0; i < hex.length(); i += 2) {
                bytes[j] = (byte) Integer.parseInt(hex.substring(i, i + 2), 16);
                j++;
            }
            return bytes;
        } else {
            return new byte[0];
        }
    }

    /**
     * Concatenate arguments
     *
     * @param args list of string to concatenate
     *
     * @return the one string
     */
    public static String concat(String... args) {
        StringBuilder sb = new StringBuilder();
        for (String s : args) {
            if (s != null) {
                sb.append(s);
            }
        }
        return sb.toString();
    }

    /**
     * Check if given address match email address pattern
     *
     * @param address address to check
     *
     * @return true if address looks like an email address
     */
    public static boolean isEmailAddress(String address) {
        if (address != null) {
            Matcher matcher = EMAIL_PATTERN.matcher(address);
            return matcher.matches();
        } else {
            return false;
        }
    }

    /**
     * Generate secure random bytes
     *
     * @param length number of byte to generate
     *
     * @return byte array of request length filled with secured-random data
     */
    public static byte[] generateSalt(int length) {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[length];
        random.nextBytes(salt);
        return salt;
    }

    /**
     * Same as {@link #generateSalt(int) } but return salt as hex string
     *
     * @param length number of bytes to generate
     *
     * @return hex-encoded byte array
     */
    public static String generateHexSalt(int length) {
        return Helper.bytesToHex(Helper.generateSalt(length));
    }

    /**
     * @return the hash method to use for new accounts
     */
    public static HashMethod getDefaultHashMethod() {
        return HashMethod.PBKDF2WithHmacSHA512_65536_64;
    }

    /**
     * Convert camel-case string to userscrore-separated-lower-case-string
     *
     * @param camelCase eg myAsewomeIdentifier
     *
     * @return eg my_aswesome_identifier
     */
    public static String camelCaseToUnderscore(String camelCase) {
        return camelCase
            .trim()
            // prefix all uppercase char preceded by something with an underscore
            .replaceAll("(?<!^)[A-Z](?!$)", "_$0")
            .toLowerCase();
    }

    /**
     * Lookup instances
     *
     * @param <T> class to lookup
     * @param klass class to lookup
     *
     * @return instance of <code>klass</code>
     *
     * @throws NamingException if lookup failed
     */
    public static <T> T lookup(Class<T> klass) throws NamingException {
        return (T) new InitialContext().lookup(
            "java:global/colab-webapp-0.1/" + klass.getSimpleName() + "!" + klass.getName());
    }
}
