/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.tests;

import ch.colabproject.colab.api.ws.message.WsMessage;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.ws.WebsocketClient;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
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

    /**
     * Wait for websocket messages.
     *
     * @param <T>      the type of the messages
     * @param wsClient the websocket client
     * @param count    number of exepected messages
     * @param timeout  stop waiting after this amount of seconds
     * @param klass    the T concrete class
     *
     * @return list of {@code count} meessages of type T
     */
    public static <T> List<T> waitForMessagesAndAssert(WebsocketClient wsClient, int count, int timeout, Class<? extends T> klass) {

        List<T> result = new ArrayList<>();

        List<WsMessage> messages = wsClient.getMessages(count, timeout);
        Assertions.assertEquals(count, messages.size());

        for (var message : messages) {
            Assertions.assertTrue(klass.isAssignableFrom(message.getClass()));
            result.add((T) message);
        }
        return result;
    }

    /**
     *
     * First this method filter the list to keep inly instance of the given class. Then, the method
     * asserts the filtered list contains exactly {@code count} items.
     *
     * @param <T>   T
     * @param list  the list to filter
     * @param count expected instance of T
     * @param klass T class
     *
     * @return list which contains {@code count} item of type T
     */
    public static <T> List<T> filterAndAssert(List list, int count, Class< ? extends T> klass) {
        List<T> result = new ArrayList<>();
        for (var item : list) {
            if (klass.isAssignableFrom(item.getClass())) {
                result.add((T) item);
            }
        }

        Assertions.assertEquals(count, result.size());
        return result;
    }

    /**
     * Find first instance of T of fails
     *
     * @param <T>        type
     * @param collection the collection
     * @param klass      targeted class
     *
     * @return the first item which is instance of klass
     */
    public static <T> T findFirst(Collection collection, Class< ? extends T> klass) {
        for (var item : collection) {
            if (klass.isAssignableFrom(item.getClass())) {
                return (T) item;
            }
        }

        Assertions.fail("No " + klass + " instance in " + collection);
        return null;
    }
}
