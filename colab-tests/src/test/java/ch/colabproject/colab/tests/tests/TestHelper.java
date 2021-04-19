/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.function.Executable;
import org.slf4j.Logger;
import org.slf4j.event.Level;

/**
 *
 * @author maxence
 */
public class TestHelper {

    /**
     * Assert HttpErrorMessage is thrown with expected error code
     *
     * @param code       expected error code
     * @param executable code to check
     */
    public static void assertThrows(HttpErrorMessage.MessageCode code, Executable executable) {
        try {
            executable.execute();
        } catch (HttpErrorMessage ex) {
            if (ex.getMessageCode().equals(code)) {
                return;
            } else {
                Assertions.fail("Expect " + code + " error but got " + ex.getMessageCode());
            }
        } catch (Throwable ex) {
            Assertions.fail("Expect HttpErrorMessage Exception but got " + ex);
        }
        Assertions.fail("Did not thown anything");
    }

    /**
     * Set the level of the given logger
     *
     * @param logger logger
     * @param level  new level
     */
    public static void setLoggerLevel(Logger logger, Level level) {
        ch.qos.logback.classic.Logger lLogger = (ch.qos.logback.classic.Logger) logger;
        lLogger.setLevel(ch.qos.logback.classic.Level.valueOf(level.toString()));
    }
}
