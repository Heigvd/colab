/**
 * Wegas
 * http://wegas.albasim.ch
 *
 * Copyright (c) 2013-2021 School of Management and Engineering Vaud, Comem, MEI
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.user;

import ch.colabproject.colab.api.Helper;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

/**
 * Hash method supported by the coLAB platform
 *
 * @author maxence
 */
public enum HashMethod {
    PBKDF2WithHmacSHA512_65536_64 {

        /**
         * {@inheritDoc }
         */
        @Override
        public byte[] hash(String value, byte[] salt) {
            try {
                KeySpec spec = new PBEKeySpec(value.toCharArray(), salt, 65536, 512);
                SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");

                return factory.generateSecret(spec).getEncoded();
            } catch (NoSuchAlgorithmException | InvalidKeySpecException ex) {
                return null;
            }
        }
    };

    /**
     * compute digest from value.If given, the value is prefixed with the salt.
     *
     * @param value the value to hash
     * @param salt  optional salt
     *
     * @return digested salted value
     *
     */
    public abstract byte[] hash(String value, byte[] salt);

    /**
     * @see #hash(java.lang.String, byte[])
     * @param value   value to hash
     * @param hexSalt hexEncoded salt
     *
     * @return digested salted value
     */
    public byte[] hash(String value, String hexSalt) {
        return this.hash(value, Helper.hextToBytes(hexSalt));
    }
}
