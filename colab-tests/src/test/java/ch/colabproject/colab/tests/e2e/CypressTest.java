/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.e2e;

import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class CypressTest extends AbstractArquillianTest {

    /**
     * Test application with cypress
     */
    @Test
    public void cypressSuiteTest() {

        try {
            Map<String, String> env = new HashMap<>();

            env.put("COLAB_URL", this.deploymentURL.toString());
            env.put("ADMIN_USERNAME", ADMIN_USERNAME);
            env.put("ADMIN_EMAIL", ADMIN_EMAIL);
            env.put("ADMIN_PASSWORD", ADMIN_PASSWORD);

            String envOpt = env.entrySet().stream()
                .map(entry -> entry.getKey()+ "=" +entry.getValue())
                .collect(Collectors.joining(","));


            boolean interractive = System.getProperty("cypress", "false").equals("true");

            String cypressSubcommand = interractive ? "open" : "run";

            String cypressCommand = "yarn cypress " + cypressSubcommand + " --env " +envOpt;

            boolean isWindows = System.getProperty("os.name").toLowerCase().startsWith("windows");

            ProcessBuilder builder = new ProcessBuilder();
            if (isWindows) {
                builder.command("cmd.exe", "/c", cypressCommand);
            } else {
                builder.command("sh", "-c", cypressCommand);
            }

            Path cypressPath = Paths.get("src", "test", "node");

            builder.directory(cypressPath.toFile());

            Process process = builder.start();
            //make sure to consume output
            StreamGobbler streamGobbler
                = new StreamGobbler(process.getInputStream(), System.out::println);

            Executors.newSingleThreadExecutor().submit(streamGobbler);

            int exitCode = process.waitFor();

            Assertions.assertEquals(0, exitCode);
        } catch (IOException ex) {
            Assertions.fail("Run cypress failed with ", ex);
        } catch (InterruptedException ex) {
            Assertions.fail("Cypress has been interrupted ", ex);
        }
    }

    private static class StreamGobbler implements Runnable {

        private final InputStream inputStream;
        private final Consumer<String> consumer;

        public StreamGobbler(InputStream inputStream, Consumer<String> consumer) {
            this.inputStream = inputStream;
            this.consumer = consumer;
        }

        @Override
        public void run() {
            new BufferedReader(new InputStreamReader(inputStream)).lines()
                .forEach(consumer);
        }
    }
}
