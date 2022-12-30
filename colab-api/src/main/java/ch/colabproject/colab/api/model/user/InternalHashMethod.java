/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/**
 * Hash method internally supported by the coLAB platform. There is no needs the client to
 * implements those methods.
 *
 * @author maxence
 */
public enum InternalHashMethod {

    /** SHA 256 */
    SHA_256 {

        @Override
        public byte[] hash(String value) throws NoSuchAlgorithmException {
            byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return md.digest(bytes);
        }
    },
    /** SHA 512 */
    SHA_512 {
        @Override
        public byte[] hash(String value) throws NoSuchAlgorithmException {
            MessageDigest md = MessageDigest.getInstance("SHA-512");
            byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
            return md.digest(bytes);
        }

    };

    /**
     * compute digest from value.
     *
     * @param value the value to hash
     *
     * @return digested value
     *
     * @throws java.security.NoSuchAlgorithmException if underlying algorithm does not exist
     *
     */
    public abstract byte[] hash(String value) throws NoSuchAlgorithmException;

}
