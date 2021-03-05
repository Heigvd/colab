/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator;

import ch.colabproject.colab.generator.rest.RestController;
import java.io.BufferedWriter;
import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.file.Files;
import java.util.AbstractMap.SimpleEntry;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Path;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugin.logging.Log;
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
    private Set<RestController> restControllers;

    /**
     * Maven process logger
     */
    private final Log log;

    /**
     * Client will be generated in this package
     */
    private final String packageName;

    /**
     * Generated client name
     */
    private final String clientName;

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
     * @param log          maven logger
     */
    public Generator(String[] restPackages,
        String packageName, String clientName,
        Log log
    ) {
        this.log = log;
        this.packageName = packageName;
        this.clientName = clientName;

        this.reflections = new Reflections((Object[]) restPackages);
    }

    /**
     *
     * Initialize the client generator.
     *
     * @param pkgs packages to analyze
     */
    public Generator(String[] pkgs) {
        this(pkgs, null, null, null);
    }

    /**
     * Process all classes annotated with {@link Path}. Generate a {@link RestController} instance
     * for each class and store them in {@link #restControllers}
     */
    public void processPackages() {
        Set<Class<?>> appConfig = reflections.getTypesAnnotatedWith(ApplicationPath.class);
        if (!appConfig.isEmpty()) {
            if (appConfig.size() > 1 && log != null) {
                log.warn("Several ApplicationPath found");
            }
            Class<?> applicationConfig = appConfig.iterator().next();
            ApplicationPath annotation = applicationConfig.getAnnotation(ApplicationPath.class);
            if (annotation != null) {
                this.applicationPath = annotation.value();
            }
        }

        Set<Class<?>> restClasses = reflections.getTypesAnnotatedWith(Path.class);

        this.restControllers = restClasses.stream()
            .map(klass -> RestController.build(klass, applicationPath, log))
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
        imports.put("RestClient", "ch.colabproject.colab.generator.rest.RestClient");
        imports.put("GenericType", "javax.ws.rs.core.GenericType");
        imports.put("PathPattern", "org.glassfish.jersey.uri.PathPattern");
        imports.put("UriTemplate", "org.glassfish.jersey.uri.UriTemplate");
        imports.put("void", null); // null means no import statement

        String innerClasses = this.restControllers.stream().map(controller -> {
            String javaCode = controller.generateJavaClient(imports, clientName);
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
                + "@SuppressWarnings(\"PMD.FieldDeclarationsShouldBeAtStartOfClass\")"
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
                + "     * @param clientFeatures addition http client feature\n"
                + "     */\n"
                + "    public ")
            .append(clientName)
            .append("(String baseUri, String cookieName, Object... clientFeatures) {\n"
                + "        super(baseUri, cookieName, clientFeatures);\n"
                + "    }")
            .append(innerClasses)
            .append("}");

        if (dryRun) {
            if (log != null) {
                log.debug(sb.toString());
            }
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
    public Set<RestController> getRestControllers() {
        return restControllers;
    }

    /**
     * Generate typescript client in targetDir
     *
     * @param targetDir generate TS module in this directory
     * @param dryRun    if true, do not generate any file but print output to console
     *
     * @throws org.apache.maven.plugin.MojoFailureException if generation fails
     */
    public void generateTypescriptClient(String targetDir, boolean dryRun) throws MojoFailureException {
        Map<String, Type> extraTypes = new HashMap<>();
        StringBuilder sb = new StringBuilder();
        sb.append("/**\n"
            + " * build fetch options\n"
            + " */\n"
            + "function getOptions({\n"
            + "    method,\n"
            + "    body,\n"
            + "    contentType\n"
            + "}: {\n"
            + "    method?: string;\n"
            + "    body?: {} | string | FormData;\n"
            + "    contentType?: string;\n"
            + "}): RequestInit {\n"
            + "    let headers;\n"
            + "    if (contentType) {\n"
            + "        // do not set multipart/form-data by hand but let the\n"
            + "        // browser do it\n"
            + "        if (contentType != \"multipart/form-data\") {\n"
            + "            headers = new Headers({\n"
            + "                \"content-type\": contentType\n"
            + "            });\n"
            + "        }\n"
            + "    } else {\n"
            + "        headers = new Headers({\n"
            + "            \"content-type\": \"application/json\"\n"
            + "        });\n"
            + "    }\n"
            + "\n"
            + "    return {\n"
            + "        headers: headers,\n"
            + "        method: method || \"GET\",\n"
            + "        body: body\n"
            + "            ? body instanceof FormData\n"
            + "                ? (body as FormData)\n"
            + "                : JSON.stringify(body)\n"
            + "            : undefined\n"
            + "    };\n"
            + "}\n"
            + "\n"
            + "const sendRequest = async <T>(\n"
            + "  method: string,\n"
            + "  path: string,\n"
            + "  body: string | {} | undefined,\n"
            + "): Promise<T> => {\n"
            + "  const res = await fetch(\n"
            + "    path,\n"
            + "    getOptions({\n"
            + "      method: method,\n"
            + "      body: body\n"
            + "    })\n"
            + "  );\n"
            + "\n"
            + "  if (res.ok) {\n"
            + "    if (res.status != 204) {\n"
            + "      return res.json();\n"
            + "    } else {\n"
            + "      return new Promise<void>((resolve) => resolve()) as unknown as Promise<T>;\n"
            + "    }\n"
            + "  } else {\n"
            + "    let error;"
            + "    try {\n"
            + "      error = await res.json();\n"
            + "    } catch (e) {\n"
            + "      throw new Error(\"Failure\");\n"
            + "    }\n"
            + "    throw error;\n"
            + "  }\n"
            + "}\n\n");

        String modules = this.restControllers.stream().map(controller
            -> controller.generateTypescriptClient(extraTypes)
        ).collect(Collectors.joining(System.lineSeparator()));

        List<Entry<String, Type>> queue = new ArrayList<>(extraTypes.entrySet());
        while (!queue.isEmpty()) {
            Map<String, Type> snowballedTypes = new HashMap<>();

            Entry<String, Type> entry = queue.remove(0);

            String tsInterface = TypeScriptHelper.generateInterface(
                entry.getValue(),
                snowballedTypes,
                reflections
            );
            sb.append(tsInterface);

            snowballedTypes.forEach((name, type) -> {
                if (!extraTypes.containsKey(name)) {
                    extraTypes.put(name, type);
                    queue.add(0, new SimpleEntry(name, type));
                }
            });
        }

        sb.append("/**\n"
            + "* The ").append(clientName).append(" REST client\n"
            + " */\n"
            + "export const ").append(clientName)
            .append(" = function (baseUrl: string) {")
            .append("\n    return {")
            .append(modules)
            .append("    }\n")
            .append("}");

        if (dryRun) {
            if (log != null) {
                log.debug(sb.toString());
            }
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
    private void writeFile(String content, String directory, String filename) throws MojoFailureException {
        try {
            Files.createDirectories(java.nio.file.Path.of(directory));

            try (BufferedWriter writer = Files.newBufferedWriter(
                java.nio.file.Path.of(directory, filename))) {
                writer.write(content);
            } catch (IOException ex) {
                if (log != null) {
                    throw new MojoFailureException("Failed to write '" + filename + "' in '" + directory + "'", ex);
                }
            }

        } catch (IOException ex) {
            if (log != null) {
                throw new MojoFailureException("Failed to create package directory " + directory, ex);
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
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < name.length(); i++) {
            char c = name.charAt(i);
            if (Character.isUpperCase(c)) {
                sb.append('-').append(Character.toLowerCase(c));
            } else {
                sb.append(c);
            }
        }

        return sb.toString();
    }

    /**
     * generate package.json
     *
     * @return content of package.json
     */
    private String generatePackageDotJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n"
            + "    \"name\": \"" + generateModuleName(this.clientName) + "\",\n"
            + "    \"version\": \"1.0.0\",\n"
            + "    \"keywords\": [\"restClient\"],\n"
            + "    \"author\": \"albabot\",\n"
            + "    \"main\": \"dist/index.js\",\n"
            + "    \"private\": true,\n"
            + "    \"scripts\": {\n"
            + "      \"build\": \"rimraf dist && tsc\",\n"
            + "      \"lint\": \"eslint 'src' --ext '.js,.ts,.tsx'\"\n"
            + "    },\n"
            + "    \"contributors\": [],\n"
            + "    \"dependencies\": {},\n"
            + "      \"devDependencies\": {\n"
            + "        \"rimraf\": \"^3.0.0\",\n"
            + "        \"typescript\": \"^3.7.5\",\n"
            + "        \"tslint\" : \"^5.1.0\",\n"
            + "        \"copyfiles\": \"^2.3.0\"\n"
            + "  }\n"
            + "}");
        return sb.toString();
    }

    /**
     * generate tsconfig.json
     *
     * @return content of package.json
     */
    private String generateTsconfigDotJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("{\n"
            + "    \"compilerOptions\": {\n"
            + "        \"target\": \"esnext\",\n"
            + "        \"allowJs\": false,\n"
            + "        \"module\": \"esnext\",\n"
            + "        \"outDir\": \"dist\",\n"
            + "        \"sourceMap\":true,\n"
            + "        \"strict\": true,\n"
            + "        \"moduleResolution\": \"node\",\n"
            + "        \"allowSyntheticDefaultImports\": true,\n"
            + "        \"suppressImplicitAnyIndexErrors\": true,\n"
            + "        \"declaration\": true\n"
            + "    },\n"
            + "    \"files\": [\n"
            + "        \"src/" + this.clientName + ".ts\"\n"
            + "    ],\n"
            + "    \"exclude\": [\n"
            + "        \"node_modules\"\n"
            + "    ]\n"
            + "}");
        return sb.toString();
    }

}
