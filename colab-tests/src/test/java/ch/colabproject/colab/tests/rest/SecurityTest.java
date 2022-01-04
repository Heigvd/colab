/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.TestUser;
import ch.colabproject.colab.generator.plugin.Generator;
import ch.colabproject.colab.generator.plugin.rest.RestEndpoint;
import ch.colabproject.colab.generator.plugin.rest.RestMethod;
import ch.colabproject.colab.tests.tests.TestHelper;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.stmt.BlockStmt;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Assert API security
 *
 * @author maxence
 */
public class SecurityTest extends AbstractArquillianTest {

    /**
     * All assertion grouped in one methods
     */
    public void assertAccessDenied() {
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.getAllUsers();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.projectRestEndpoint.getAllProjects();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.cardTypeRestEndpoint.getAllCardTypes();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.cardTypeRestEndpoint.getAllGlobalCardTypes();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.cardRestEndpoint.getAllCards();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.documentRestEndpoint.getAllDocuments();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.cardContentRestEndpoint.getAllCardContents();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.grantAdminRight(1l);
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.grantAdminRight(1l);
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.revokeAdminRight(1l);
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.switchClientHashMethod(1l);
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.userRestEndpoint.switchServerHashMethod(1l);
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.monitoringRestEndpoint.changeLoggerLevel("abcd", "DEBUG");
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.monitoringRestEndpoint.getLoggerLevels();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.websocketRestEndpoint.getExistingChannels();
        });
        TestHelper.assertThrows(HttpErrorMessage.MessageCode.ACCESS_DENIED, () -> {
            client.blockRestEndpoint.deletePendingChanges(0L);
        });
    }

    /**
     * Analyze {@link #assertAccessDenied() } method source-code and check all resource are tested.
     *
     * @throws NoSuchMethodException not expected
     * @throws IOException           not expected
     */
    @Test
    public void assertAllExistingAdminResourceAreTested() throws NoSuchMethodException, IOException {
        // First, parse this file to analyse sourceCode
        Path file = Path.of("src/test/java/ch/colabproject/colab/tests/rest/SecurityTest.java");
        CompilationUnit compilationUnit = StaticJavaParser.parse(file);
        Optional<ClassOrInterfaceDeclaration> classByName = compilationUnit
            .getClassByName("SecurityTest");
        ClassOrInterfaceDeclaration get = classByName.get();
        List<MethodDeclaration> methodsByName = get.getMethodsByName("assertAccessDenied");
        BlockStmt body = methodsByName.get(0).getBody().get();
        // and keep only assertAccessDenied source code
        String sourceCode = body.toString();

        // Then, use client generator to find all annotated class/methods
        List<String> missings = new ArrayList<>();

        String[] pkgs = {"ch.colabproject.colab.api"};
        Generator generator = new Generator(pkgs);
        generator.processPackages();
        Set<RestEndpoint> restEndpoints = generator.getRestEndpoints();
        restEndpoints.forEach(controller -> {
            boolean isAdminResource = controller.isAdminResource();

            String simpleClassName = controller.getSimpleClassName();
            String fieldName = simpleClassName.substring(0, 1).toLowerCase() + simpleClassName
                .substring(1);

            controller.getRestMethods().forEach((RestMethod method) -> {
                if (isAdminResource || method.isAdminResource()) {
                    String check = ".*TestHelper.assertThrows\\(\\s*"
                        + "HttpErrorMessage.MessageCode.ACCESS_DENIED, \\(\\) -> "
                        + "\\{\\s*client." + fieldName + "."
                        + method.getName() + "\\(.*?\\);\\s*\\}\\);.*";
                    Pattern regex = Pattern.compile(check, Pattern.DOTALL);
                    if (!regex.matcher(sourceCode).matches()) {
                        logger.error("\"{}\" not found in \"{}\"", check, sourceCode);
                        missings.add("Missing check for client." + fieldName + "." + method
                            .getName());
                    }
                }
            });
        });
        Assertions.assertEquals(0, missings.size(), missings.toString());
    }

    /**
     * Make sure non-admin user cannot access admin resources
     */
    @Test
    public void assertAdminResourceAccesIsDeniedToStandardUsers() {
        TestUser lambdaUser = this.signup("lambda", "henri@croivet-batton.xvi", "Louis 16 soupapes");

        this.signIn(lambdaUser);
        this.assertAccessDenied();
    }
}
