/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.Helper;
import ch.colabproject.colab.api.model.user.HashMethod;
import ch.colabproject.colab.api.model.user.InternalHashMethod;
import java.security.NoSuchAlgorithmException;

/**
 *
 * @author maxence
 */
public class BenchmarkTest {

    public void doRun(int nbRun, InternalHashMethod m, int dataLength) throws NoSuchAlgorithmException {
        String[] data = new String[nbRun];

        for (int i = 0; i < nbRun; i++) {
            data[i] = Helper.generateHexSalt(dataLength);
        }
        long start = System.currentTimeMillis();
        for (int i = 0; i < nbRun; i++) {
            m.hash(data[i]);
        }
        long duration = System.currentTimeMillis() - start;
        System.out.println(m.toString() + ": " + nbRun + " in " + duration);
    }

    //@Test
    //  not a real test
    public void benchmarkSha512() throws NoSuchAlgorithmException {
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);
        doRun(10000, InternalHashMethod.SHA_512, 128);

        doRun(100, HashMethod.PBKDF2WithHmacSHA512_65536_64, 128);
        doRun(100, HashMethod.PBKDF2WithHmacSHA512_65536_64, 128);
        doRun(100, HashMethod.PBKDF2WithHmacSHA512_65536_64, 128);
        doRun(100, HashMethod.PBKDF2WithHmacSHA512_65536_64, 128);
    }

    public void doRun(int nbRun, HashMethod m, int dataLength) throws NoSuchAlgorithmException {
        String[] data = new String[nbRun];
        String[] salts = new String[nbRun];

        for (int i = 0; i < nbRun; i++) {
            data[i] = Helper.generateHexSalt(dataLength);
            salts[i] = Helper.generateHexSalt(32);
        }

        long start = System.currentTimeMillis();
        for (int i = 0; i < nbRun; i++) {
            m.hash(data[i], salts[i]);
        }
        long duration = System.currentTimeMillis() - start;
        System.out.println(m.toString() + ": " + nbRun + " in " + duration);
    }
}
