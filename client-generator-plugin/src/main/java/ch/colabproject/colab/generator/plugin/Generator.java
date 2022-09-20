/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin;

import ch.colabproject.colab.generator.model.interfaces.WithId;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.ClassDoc;
import ch.colabproject.colab.generator.model.tools.JavaDocExtractor;
import ch.colabproject.colab.generator.model.tools.JsonbProvider;
import ch.colabproject.colab.generator.plugin.rest.RestEndpoint;
import java.io.BufferedWriter;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.bind.Jsonb;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Path;
import org.apache.maven.plugin.MojoFailureException;
import org.reflections.Reflections;

/**
 *
 * @author maxence
 */
public class Generator {

    /**
     * Reflections one-stop-shop object.
     */
    private final Reflections reflections;

    /**
     * All rest controller found.
     */
    private Set<RestEndpoint> restEndpoints;

    /**
     * Client will be generated in this package
     */
    private final String packageName;

    /**
     * Generated client name
     */
    private final String clientName;

    /**
     * Javadoc as extracted by the annotation processor
     */
    private final Map<String, ClassDoc> javadoc;

    /**
     * Main REST application path
     */
    private String applicationPath = null;

    /**
     * Initialize the client generator.
     *
     * @param restPackages packages to analyze
     * @param packageName  package in which generate the client
     * @param clientName   client class name
     */
    public Generator(String[] restPackages,
        String packageName, String clientName
    ) {
        this.packageName = packageName;
        this.clientName = clientName;

        List<Object> pkgs = new ArrayList<>();
        pkgs.add("ch.colabproject.colab.generator.model");
        pkgs.addAll(Arrays.asList(restPackages));

        this.reflections = new Reflections(pkgs.toArray());
        this.javadoc = JavaDocExtractor.loadJavaDocFromJson();
    }

    /**
     *
     * Initialize the client generator.
     *
     * @param pkgs packages to analyze
     */
    public Generator(String[] pkgs) {
        this(pkgs, null, null);
    }

    /**
     * get JSON-B to use.
     *
     * @return jsbonb mapper
     */
    public Jsonb getJsonBMapper() {
        return JsonbProvider.getJsonb();
    }

    /**
     * Process all classes annotated with {@link Path}. Generate a {@link RestEndpoint} instance
     * for each class and store them in {@link #restEndpoints}
     */
    public void processPackages() {
        Set<Class<?>> appConfig = reflections.getTypesAnnotatedWith(ApplicationPath.class);
        if (!appConfig.isEmpty()) {
            if (appConfig.size() > 1) {
                Logger.warn("Several ApplicationPath found");
            }
            Class<?> applicationConfig = appConfig.iterator().next();
            ApplicationPath annotation = applicationConfig.getAnnotation(ApplicationPath.class);
            if (annotation != null) {
                this.applicationPath = annotation.value();
            }
        }

        Set<Class<?>> restClasses = reflections.getTypesAnnotatedWith(Path.class);

        this.restEndpoints = restClasses.stream()
            .map(klass -> RestEndpoint.build(klass, applicationPath))
            .collect(Collectors.toSet());
        /* .map(p -> p.generateJavaClient()) .innerClasses(Collectors.toList());
         */
    }

    /**
     * One all classes have been processed with {@link #processPackages() }, this method will create
     * subdirectories that match the <code>packageName</code>.Then the client will be generated in
     * the <code>clientName</code>.java file.
     *
     * @param targetDir target directory
     * @param dryRun    if true, do not generate files but print output to console
     *
     * @throws org.apache.maven.plugin.MojoFailureException if generation fails
     */
    public void generateJavaClient(String targetDir, boolean dryRun) throws MojoFailureException {
        Map<String, String> imports = new HashMap<>();
        imports.put("RestClient", "ch.colabproject.colab.generator.plugin.rest.RestClient");
        imports.put("Jsonb", "javax.json.bind.Jsonb");
        imports.put("GenericType", "javax.ws.rs.core.GenericType");
        imports.put("PathPattern", "org.glassfish.jersey.uri.PathPattern");
        imports.put("UriTemplate", "org.glassfish.jersey.uri.UriTemplate");
        imports.put("void", null); // null means no import statement

        String innerClasses = this.restEndpoints.stream().map(controller -> {
        String javaCode = controller.generateJavaClient(
                imports,
                clientName,
                javadoc,
                reflections
            );
            return javaCode;
        }).collect(Collectors.joining(System.lineSeparator()));

        StringBuilder sb = new StringBuilder();

        sb.append("package ").append(packageName).append(";\n\n")
            .append(
                imports.values().stream()
                    .filter(pkg -> pkg != null)
                    .sorted()
                    .map(pkg -> "import " + pkg + ";")
                    .collect(Collectors.joining(System.lineSeparator()))
            )
            .append("\n"
                + "/**\n"
                + " * The ")
            .append(clientName)
            .append(" REST client"
                + " */\n"
                + "@SuppressWarnings(\"PMD.FieldDeclarationsShouldBeAtStartOfClass\")\n"
                + "public class ")
            .append(clientName)
            .append(" extends RestClient {"
                + "\n"
                + "\n"
                + "    /**\n"
                + "     * Get a REST client\n"
                + "     *\n"
                + "     * @param baseUri        base URI\n"
                + "     * @param cookieName     session cookie name\n"
                + "     * @param jsonb          jsonb\n"
                + "     * @param clientFeatures addition http client feature\n"
                + "     */\n"
                + "    public ")
            .append(clientName)
            .append("(String baseUri, String cookieName, Jsonb jsonb, Object... clientFeatures) {\n"
                + "        super(baseUri, cookieName, jsonb, clientFeatures);\n"
                + "    }")
            .append(innerClasses)
            .append("}");

        if (dryRun) {
            Logger.debug(sb.toString());
        } else {
            String packagePath = targetDir + "/" + packageName.replaceAll("\\.", "/");
            writeFile(sb.toString(), packagePath, clientName + ".java");
        }
    }

    /**
     * Get rest service description
     *
     * @return all rest resource
     */
    public Set<RestEndpoint> getRestEndpoints() {
        return restEndpoints;
    }

    /**
     * Generate typescript client in targetDir
     *
     * @param targetDir generate TS module in this directory
     * @param dryRun    if true, do not generate any file but print output to console
     *
     * @throws org.apache.maven.plugin.MojoFailureException if generation fails
     */
    public void generateTypescriptClient(String targetDir, boolean dryRun)
        throws MojoFailureException {
        Map<String, Type> extraTypes = new HashMap<>();
        StringBuilder sb = new StringBuilder();
        sb.append(this.getTsClientTemplate());
        extraTypes.put("WithJsonDiscriminator", WithJsonDiscriminator.class);
        extraTypes.put("WithId", WithId.class);

        String modules = this.restEndpoints.stream().map(controller
            -> controller.generateTypescriptClient(extraTypes, this.javadoc, reflections)
        ).collect(Collectors.joining(System.lineSeparator()));

        // TS interface name => list of @class values
        Map<String, List<String>> inheritance = new HashMap<>();

        List<Entry<String, Type>> queue = new ArrayList<>(extraTypes.entrySet());
        while (!queue.isEmpty()) {
            Map<String, Type> snowballedTypes = new HashMap<>();

            Entry<String, Type> entry = queue.remove(0);

            String tsInterface = TypeScriptHelper.generateInterface(
                entry.getValue(),
                snowballedTypes,
                inheritance,
                reflections,
                javadoc
            );
            sb.append(tsInterface);

            snowballedTypes.forEach((name, type) -> {
                if (!extraTypes.containsKey(name)) {
                    extraTypes.put(name, type);
                    queue.add(0, new SimpleEntry<>(name, type));
                }
            });
        }

        sb.append("/**\n"
            + " * Some orthopedic tools\n"
            + " */\n\n"
            + "export interface TypeMap {\n  ")
            .append(
                inheritance.keySet().stream().map((key)
                    -> key + ": " + key + ";")
                    .collect(Collectors.joining("\n  "))
            )
            .append("\n}\n\n")
            .append("const inheritance : {[key: string]: string[]} = {\n")
            .append(
                inheritance.entrySet().stream().map((entry)
                    -> entry.getKey() + ": [" + entry.getValue().stream()
                .map(v -> "'" + v + "'")
                .collect(Collectors.joining(", ")) + "]"
                ).collect(Collectors.joining(",\n  ")))
            .append("\n}\n\n")
            .append("export const entityIs = <T extends keyof TypeMap>(entity: unknown, klass: T)\n"
                + "    : entity is TypeMap[T] => {\n"
                + "\n"
                + "    if (typeof entity === 'object' && entity != null) {\n"
                + "        if (\"@class\" in entity) {\n"
                + "            const dis = entity[\"@class\"];\n"
                + "            if (typeof dis === 'string') {\n"
                + "                return inheritance[klass].includes(dis);\n"
                + "            }\n"
                + "        }\n"
                + "    }\n"
                + "    return false;\n"
                + "}")
            .append("\n\n\n/**\n"
                + "* The ").append(clientName).append(" REST client\n"
            + " */\n"
            + "export const ").append(clientName)
            .append(" = function (baseUrl: string, defaultErrorHandler: (error: unknown) => void) {")
            .append("\n    return {")
            .append(modules)
            .append("    }\n")
            .append("}");

        if (dryRun) {
            Logger.debug(sb.toString());
        } else {
            String srcPath = targetDir + "/src";
            writeFile(sb.toString(), srcPath, clientName + ".ts");

            writeFile("export * from './dist/" + clientName + "';", targetDir, "index.ts");
            writeFile(generatePackageDotJson(), targetDir, "package.json");
            writeFile(generateTsconfigDotJson(), targetDir, "tsconfig.json");
        }
    }

    /**
     * Write file to disk.
     *
     * @param content   file content
     * @param directory directory, will be created if missing
     * @param filename  filename
     */
    private void writeFile(String content, String directory, String filename)
        throws MojoFailureException {
        try {
            Files.createDirectories(java.nio.file.Path.of(directory));

            try (BufferedWriter writer = Files.newBufferedWriter(
                java.nio.file.Path.of(directory, filename))) {
                writer.write(content);
            } catch (IOException ex) {
                if (Logger.isInit()) {
                    throw new MojoFailureException("Failed to write '"
                        + filename + "' in '" + directory + "'", ex);
                }
            }

        } catch (IOException ex) {
            if (Logger.isInit()) {
                throw new MojoFailureException("Failed to create package directory "
                    + directory, ex);
            }
        }
    }

    /**
     * Convert Java className-like to dash-separated-lower-case version.
     *
     * @param name eg. MyAwesomeRestClient
     *
     * @return eg. my-awesome-rest-client
     */
    private String generateModuleName(String name) {
        return name
            .trim()
            // prefix all uppercase char preceded by something with an dash
            .replaceAll("(?<!^)[A-Z](?!$)", "-$0")
            .toLowerCase();
    }

    /**
     * get TS client tempalte
     *
     * @return intial content of the TS client
     */
    private String getTsClientTemplate() {
        String tsConfig = FileHelper.readFile("templates/client.ts");
        return tsConfig.replaceAll(
            "\\{\\{MODULE_NAME\\}\\}",
            generateModuleName(clientName)
        );
    }

    /**
     * generate package.json
     *
     * @return content of package.json
     */
    private String generatePackageDotJson() {
        String tsConfig = FileHelper.readFile("templates/package.json");
        return tsConfig.replaceAll(
            "\\{\\{MODULE_NAME\\}\\}",
            generateModuleName(clientName)
        );
    }

    /**
     * generate tsconfig.json
     *
     * @return content of package.json
     */
    private String generateTsconfigDotJson() {
        String tsConfig = FileHelper.readFile("templates/tsconfig.json");
        return tsConfig.replaceAll("\\{\\{CLIENT_NAME\\}\\}", this.clientName);
    }
}
