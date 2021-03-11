/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.exceptions.ColabErrorMessage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.function.Executable;

/**
 *
 * @author maxence
 */
public class TestHelper {

    /**
     * Assert ColabErrorMessage is thrown with expected error code
     *
     * @param code       expected error code
     * @param executable code to check
     */
    public static void assertThrows(ColabErrorMessage.MessageCode code, Executable executable) {
        try {
            executable.execute();
        } catch (ColabErrorMessage ex) {
            if (ex.getMessageCode().equals(code)) {
                return;
            } else {
                Assertions.fail("Expect " + code + " error but got " + ex.getMessageCode());
            }
        } catch (Throwable ex) {
            Assertions.fail("Expect ColabErrorMessage Exception but got " + ex);
        }
        Assertions.fail("Did not thown anything");
    }
}
