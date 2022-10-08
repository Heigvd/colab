/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api;

import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.ws.channel.model.WebsocketChannel;
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
     * The co.LAB base uniform resource name
     */
    public static final String COLAB_BASE_URN = "urn:coLAB:/";

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
     * Make a full comparison of array. Do not return false as soon as array. Prevent timing-attack.
     *
     * @param a first array
     * @param b second array
     *
     * @return array equals or not
     */
    public static boolean constantTimeArrayEquals(byte[] a, byte[] b) {
        boolean result = true;
        int aSize = a.length;
        int bSize = b.length;
        int max = Math.max(aSize, bSize);
        for (int i = 0; i < max; i++) {
            if (i >= aSize || i >= bSize) {
                result = false;
            } else {
                result = a[i] == b[i] && result;
            }
        }
        return result;
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
     * Convert camelCase string to userscrore_separated_lower_case_string
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
     * Get base urn to identify websocket channel.
     *
     * @param channel the channel to identify
     *
     * @return uniform resource name for the given channel
     */
    public static String getColabBaseUrn(WebsocketChannel channel) {
        return COLAB_BASE_URN + "WebsocketChannel/" + channel.getJsonDiscriminator();
    }

    /**
     * Convert given stack trace to string but skip some first elements.
     *
     * @param stackTrace list of stack trace element to print
     * @param skip       number of element to slip
     *
     * @return string to be logged
     */
    private static String prettyPrintColabStackTrace(StackTraceElement[] stackTrace, int skip) {
        StringBuilder sb = new StringBuilder();

        for (int i = skip ; i < stackTrace.length; i++) {
            StackTraceElement elem = stackTrace[i];
            if (elem.getClassName().startsWith("ch.colab")) {
                sb.append("\n\tat ");
                sb.append(elem);
            }
        }
        return sb.toString();
    }

    /**
     * Export the current colab-only stack trace to string.
     *
     * @return string which represent the current stack trace
     */
    public static String getStringifiedColabStackTrace() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        return prettyPrintColabStackTrace(stackTrace, 2);
    }

    /**
     * Dump the colab-only stack trace to string from given throwable.
     *
     * @param t the throwable to dump the stack from
     *
     * @return string which represent the throwable stack trace
     */
    public static String getStringifiedColabStackTrace(Throwable t) {
        StackTraceElement[] stackTrace = t.getStackTrace();
        return prettyPrintColabStackTrace(stackTrace, 0);
    }

    /**
     * Convert given stack trace to string but skip some first elements.
     *
     * @param stackTrace list of stack trace element to print
     * @param skip       number of element to slip
     *
     * @return string to be logged
     */
    private static String prettyPrintStackTrace(StackTraceElement[] stackTrace, int skip) {
        StringBuilder sb = new StringBuilder();

        for (int i = skip ; i < stackTrace.length; i++) {
            StackTraceElement elem = stackTrace[i];
            sb.append("\n\tat ");
            sb.append(elem);
        }
        return sb.toString();
    }

    /**
     * Export the current stack trace to string.
     *
     * @return string which represent the current stack trace
     */
    public static String getStringifiedStackTrace() {
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        return prettyPrintStackTrace(stackTrace, 2);
    }

    /**
     * Dump the stack trace to string from given throwable.
     *
     * @param t the throwable to dump the stack from
     *
     * @return string which represent the throwable stack trace
     */
    public static String getStringifiedStackTrace(Throwable t) {
        StackTraceElement[] stackTrace = t.getStackTrace();
        return prettyPrintStackTrace(stackTrace, 0);
    }

    /**
     * Lookup instances
     *
     * @param <T>   class to lookup
     * @param klass class to lookup
     *
     * @return instance of <code>klass</code>
     *
     * @throws NamingException if lookup failed
     */
    public static <T> T lookup(Class<T> klass) throws NamingException {
        return (T) new InitialContext().lookup(
            "java:global/coLAB/" + klass.getSimpleName() + "!" + klass.getName());
    }
}
