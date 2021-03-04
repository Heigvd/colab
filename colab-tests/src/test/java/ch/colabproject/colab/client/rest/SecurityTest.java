/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.client.rest;

import ch.colabproject.colab.client.tests.AbstractArquillianTest;
import ch.colabproject.colab.client.tests.TestUser;
import ch.colabproject.colab.generator.Generator;
import ch.colabproject.colab.generator.rest.RestController;
import ch.colabproject.colab.generator.rest.RestMethod;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.stmt.BlockStmt;
import java.io.IOException;
import java.nio.file.Path;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import javax.ws.rs.ClientErrorException;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Assert API security
 *
 * @author maxence
 */
public class SecurityTest extends AbstractArquillianTest {

    public void assertAccessDenied() {
        try {
            client.projectController.getAllProjects();
            Assertions.fail("");
        } catch (ClientErrorException ex) {
            Assertions.assertEquals(403, ex.getResponse().getStatus());
        }
        try {
            client.userController.grantAdminRight(1l);
            Assertions.fail("");
        } catch (ClientErrorException ex) {
            Assertions.assertEquals(403, ex.getResponse().getStatus());
        }
        try {
            client.userController.switchClientHashMethod(1l);
            Assertions.fail("");
        } catch (ClientErrorException ex) {
            Assertions.assertEquals(403, ex.getResponse().getStatus());
        }
        try {
            client.userController.switchServerHashMethod(1l);
            Assertions.fail("");
        } catch (ClientErrorException ex) {
            Assertions.assertEquals(403, ex.getResponse().getStatus());
        }
    }

    @Test
    public void assertAllExistingAdminResourceAreTested() throws NoSuchMethodException, IOException {
        // First, parse this file to analyse sourceCode
        Path file = Path.of("src/test/java/ch/colabproject/colab/client/rest/SecurityTest.java");
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
        Set<RestController> restControllers = generator.getRestControllers();
        restControllers.forEach(controller -> {
            boolean isAdminResource = controller.isAdminResource();

            String simpleClassName = controller.getSimpleClassName();
            String fieldName = simpleClassName.substring(0, 1).toLowerCase() + simpleClassName
                .substring(1);

            controller.getRestMethods().forEach((RestMethod method) -> {
                if (isAdminResource || method.isAdminResource()) {
                    String check = MessageFormat
                        .format(".*client.{0}.{1}\\(.*\\);\\s*Assertions.fail\\(\".*",
                            fieldName, method.getName());
                    Pattern regex = Pattern.compile(check, Pattern.DOTALL);
                    if (!regex.matcher(sourceCode).matches()) {
                        missings.add("Missing check for client." + fieldName + "." + method
                            .getName());
                    }
                }
            });
        });
        Assertions.assertEquals(0, missings.size(), missings.toString());
    }

    @Test
    public void assertAdminResourceAccesIsDeniedToStandardUsers() {
        TestUser lambdaUser = this.signup("lamba", "henri@croivet-batton.xvi", "Louis 16 soupapes");

        this.signIn(lambdaUser);
        this.assertAccessDenied();
    }
}
