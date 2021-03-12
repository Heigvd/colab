/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.rest;

import ch.colabproject.colab.generator.TypeScriptHelper;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import org.apache.maven.plugin.logging.Log;
import org.glassfish.jersey.uri.PathPattern;
import org.glassfish.jersey.uri.UriTemplate;

/**
 * Represent a rest controller.
 *
 * @author maxence
 */
public class RestController {

    /**
     * Full class name.
     */
    private String className;

    /**
     * Simple class name
     */
    private String simpleClassName;

    /**
     * is this class only for admin ?
     */
    private boolean adminResource;

    /**
     * does this class restricted to authenticated users ?
     */
    private boolean authenticationRequired;

    /**
     * Class path params.
     */
    private List<Param> pathParameters = new ArrayList<>();

    /**
     * Maven log
     */
    private Log log;

    /**
     * current indentation level. Used for code generation.
     */
    private int indent = 1;

    /**
     * tabSize used for code generation.
     */
    private int tabSize = 4;

    /**
     * List of rest methods defined in this controller.
     */
    private List<RestMethod> restMethods = new ArrayList<>();

    /**
     * Get the value of authenticationRequired
     *
     * @return the value of authenticationRequired
     */
    public boolean isAuthenticationRequired() {
        return authenticationRequired;
    }

    /**
     * Set the value of authenticationRequired
     *
     * @param authenticationRequired new value of authenticationRequired
     */
    public void setAuthenticationRequired(boolean authenticationRequired) {
        this.authenticationRequired = authenticationRequired;
    }

    /**
     * Get the value of adminResource
     *
     * @return the value of adminResource
     */
    public boolean isAdminResource() {
        return adminResource;
    }

    /**
     * Set the value of adminResource
     *
     * @param adminResource new value of adminResource
     */
    public void setAdminResource(boolean adminResource) {
        this.adminResource = adminResource;
    }

    /**
     * Get the value of pathParameters
     *
     * @return the value of pathParameters
     */
    public List<Param> getPathParameters() {
        return pathParameters;
    }

    /**
     * Set the value of pathParameters
     *
     * @param pathParameters new value of pathParameters
     */
    public void setPathParameters(List<Param> pathParameters) {
        this.pathParameters = pathParameters;
    }

    /**
     * Add a new line and indent next line.
     *
     * @param sb sink
     */
    private void newLine(StringBuilder sb) {
        sb.append(System.lineSeparator());
        for (int i = 0; i < indent * tabSize; i++) {
            sb.append(" ");
        }
    }

    private String resolveSimpleImport(String name, Map<String, String> imports) {
        String[] split = name.split("\\.");
        String simpleName = split[split.length - 1];

        if (name.startsWith("java.lang.")) {
            imports.put(simpleName, null);
            return simpleName;
        }

        if (imports.containsKey(simpleName)) {
            if (name.equals(imports.get(simpleName))) {
                return simpleName;
            } else {
                // Same simple name, different packages -> use full name
                return name;
            }
        } else {
            // first simpleName usage, register it
            imports.put(simpleName, name);
            return simpleName;
        }

    }

    private String resolveImport(String name, Map<String, String> imports) {
        // case 1: standard type eg java.lang.Long
        // case 2: generic type eg. java.lang.List<java.lang.Long>

        if (name.contains("<")) {
            int templateStart = name.indexOf('<');
            int templateEnd = name.lastIndexOf('>');

            String type = name.substring(0, templateStart);
            String leftPart = resolveSimpleImport(type, imports);

            String template = name.substring(templateStart + 1, templateEnd);
            if (template.contains(",") && template.contains("<")) {
                // very complex template
                // eg <java.lang.Long, java.lang.List<java.lang.String>>
                // @TODO  not yet implemented
                if (log != null) {
                    log.warn("Very Complex generic type " + template);
                }
                return leftPart + "<" + template + ">";
            } else if (template.contains(",")) {
                // multiple simple parameters
                return leftPart + "<"
                    + Arrays.stream(template.split(","))
                        .map(item -> resolveImport(item, imports))
                        .collect(Collectors.joining(","))
                    + ">";
            } else {
                // simple template or generic template -> simple recursive call
                return leftPart + "<" + resolveImport(template, imports) + ">";
            }

        } else {
            return resolveSimpleImport(name, imports);
        }
    }

    /**
     * Camelcasify simpleClassname (eg ArrayList, UserController, ...)
     *
     * @param simpleClassName className
     *
     * @return camel-case version of className eg(arrayList, userController, ...)
     */
    private String camelcasify(String simpleClassName) {
        String firstChar = simpleClassName.substring(0, 1);
        return firstChar.toLowerCase() + simpleClassName.substring(1);
    }

    /**
     * Write java class as string. The generated class is an inner class which has to be included in
     * a main class.
     *
     * @param imports    map of imports
     * @param clientName name of client class
     *
     * @return generated java inner static class
     */
    public String generateJavaClient(Map<String, String> imports, String clientName) {
        tabSize = 4;
        StringBuilder sb = new StringBuilder();
        if (log != null) {
            log.debug("Generate client class " + this);
        }

        newLine(sb);
        newLine(sb);
        sb.append("/**");
        newLine(sb);
        sb.append(" * {@link ").append(this.className).append(" } client");
        newLine(sb);
        sb.append(" */")
            .append("public ").append(this.simpleClassName).append("ClientImpl ")
            .append(camelcasify(this.simpleClassName))
            .append(" = new ").append(this.simpleClassName).append("ClientImpl();");
        newLine(sb);

        sb.append("/**");
        newLine(sb);
        sb.append(" * {@link ").append(this.className).append("} client implementation");
        newLine(sb);
        sb.append(" */")
            .append("public class ")
            .append(this.simpleClassName).append("ClientImpl").append(" {");
        indent++;

        for (RestMethod method : this.restMethods) {
            if (log != null) {
                log.debug(" * generate " + method);
            }
            ////////////////////////////////////////////////////////////////////////////////////////
            // JAVADOC
            ////////////////////////////////////////////////////////////////////////////////////////
            // @TODO extract effective java doc from api and reuse it here
            newLine(sb);
            newLine(sb);
            sb.append("/**");
            newLine(sb);
            sb.append("* ").append(method.getHttpMethod()).append(" ")
                .append(method.getFullPath()).append(" calls {@link ")
                // do not resolve imports in javadoc links
                // one would not imports classes unless they are used in the code
                .append(this.className)
                .append("#").append(method.getName()).append("}");

            for (Param param : this.getPathParameters()) {
                newLine(sb);
                sb.append("* @param ")
                    .append(param.getName()).append(" ").append(param.getJavadoc());
            }

            for (Param param : method.getAllParameters()) {
                newLine(sb);
                sb.append("* @param ")
                    .append(param.getName()).append(" ").append(param.getJavadoc());
            }

            String resolvedReturnType
                = resolveImport(method.getReturnType().getTypeName(), imports);

            if (method.getReturnType() != null && !method.getReturnType().equals(void.class)) {
                newLine(sb);
                if (method.isReturnTypeGeneric()) {
                    // no way to @link a generic template
                    sb.append("* @return an instance of ")
                        .append(
                            resolvedReturnType.replaceAll("<", "&lt;")
                                .replaceAll(">", "&gt;")
                        );
                } else {
                    sb.append("* @return an instance of {@link ").append(resolvedReturnType)
                        .append("}");
                }
            }

            newLine(sb);
            sb.append("*/");
            newLine(sb);
            ////////////////////////////////////////////////////////////////////////////////////////
            // SIGNATURE
            ////////////////////////////////////////////////////////////////////////////////////////
            sb.append("public ").append(resolvedReturnType)
                .append(" ").append(method.getName()).append("(");

            // parameters
            List<Param> params = new ArrayList<>(this.getPathParameters());
            params.addAll(method.getAllParameters());
            sb.append(params.stream()
                .map(param -> resolveImport(
                param.getType().getTypeName(), imports) + " " + param.getName())
                .collect(Collectors.joining(", ")));
            sb.append(") ");

            ////////////////////////////////////////////////////////////////////////////////////////
            // BODY
            ////////////////////////////////////////////////////////////////////////////////////////
            sb.append("{");
            indent++;
            // generate path
            ///////////////////
            newLine(sb);
            // class path + methodPath
            sb.append("UriTemplate pathTemplate = new PathPattern(\"")
                .append(method.getFullPath());

            sb.append("\").getTemplate();");
            newLine(sb);
            // Aggregate path params
            List<Param> pathParams = new ArrayList<>();
            pathParams.addAll(this.getPathParameters());
            pathParams.addAll(method.getPathParameters());
            // compute the path URL
            sb.append("String path = pathTemplate.createURI(")
                .append(
                    pathParams.stream().map(param -> param.getName() + ".toString()")
                        .collect(Collectors.joining(","))
                ).append(");");
            newLine(sb);

            // query string parameters
            if (!method.getQueryParameters().isEmpty()) {
                sb.append("List<String> qs =new ArrayList<>();");
                newLine(sb);
                if (method.getQueryParameters().size() > 0) {
                    imports.put("ArrayList", "java.util.ArrayList");
                    imports.put("URLEncoder", "java.net.URLEncoder");
                    imports.put("StandardCharsets;", "java.nio.charset.StandardCharsets");
                }
                method.getQueryParameters().stream()
                    .map(queryParam
                        -> "if (" + queryParam.getName() + " != null){ "
                    + " qs.add(\"" + queryParam.getName()
                    + "=\"+URLEncoder.encode("
                    + queryParam.getName() + ".toString(), StandardCharsets.UTF_8)); }"
                    )
                    .forEach(item -> {
                        sb.append(item);
                        newLine(sb);
                    });

                sb.append("if (!qs.isEmpty()) { path += \"?\" + String.join(\"&\", qs);}");
                newLine(sb);
            }

            // make http request
            //////////////////////
            if (!method.getReturnType().equals(void.class)) {
                sb.append("return ");
            }

            sb.append(clientName).append(".this.")
                .append(method.getHttpMethod().toLowerCase())
                .append("(path, ");

            if (method.getBodyParam() != null) {
                sb.append(method.getBodyParam().getName()).append(", ");
            }

            if (method.isReturnTypeGeneric()) {
                sb.append("new GenericType<").append(resolvedReturnType).append(">(){}");
            } else {
                sb.append("new GenericType<>(").append(resolvedReturnType).append(".class)");
            }
            sb.append(");");
            indent--;
            newLine(sb);
            sb.append("}");

        }
        indent--;
        newLine(sb);
        sb.append("}");

        return sb.toString();
    }

    /**
     * Write ts client for this controller. This method will populate types map with type which
     * requires a dedicated TS interface
     *
     * @param types map of types which requires
     *
     * @return Typscript REST client
     */
    public String generateTypescriptClient(Map<String, Type> types) {
        tabSize = 2;
        if (log != null) {
            log.debug("Generate typescript class " + this);
        }

        indent++;
        // TODO jsDoc
        StringBuilder sb = new StringBuilder();
        newLine(sb);
        sb.append(this.simpleClassName).append(" : {");
        indent++;
        newLine(sb);

        restMethods.forEach(method -> {
            if (log != null) {
                log.debug(" * generate " + method);
            }

            // JSDOC (todo: extract javadoc)
            ////////////////////////
            newLine(sb);
            // Signature
            /////////////////////////////
            sb.append(method.getName()).append(": function(");
            List<Param> params = new ArrayList<>(this.getPathParameters());
            params.addAll(method.getAllParameters());
            sb.append(params.stream()
                .map(param -> param.getName() + ": "
                + TypeScriptHelper.convertType(param.getType(), types))
                .collect(Collectors.joining(", ")));
            sb.append(") {");

            // Body
            /////////////////////////////
            indent++;
            UriTemplate pathTemplate = new PathPattern(method.getFullPath()).getTemplate();
            Map<String, String> pathParams = method.getPathParameters().stream()
                .collect(Collectors.toMap(
                    p -> p.getName(),
                    p -> "${" + p.getName() + "}")
                );
            newLine(sb);
            sb.append("const queryString : string[] = [];");
            newLine(sb);
            method.getQueryParameters().forEach(queryParam -> {
                sb.append("if (").append(queryParam.getName()).append(" != null){");
                indent++;
                newLine(sb);
                sb.append("queryString.push('")
                    .append(queryParam.getName())
                    .append("=' + encodeURIComponent(").append(queryParam.getName())
                    .append("+')'));");
                indent--;
                newLine(sb);
                sb.append("}");
            });
            newLine(sb);
            String tsPath = pathTemplate.createURI(pathParams);
            sb.append("const path = `").append(tsPath)
                .append("` + (queryString.length > 0 ? '?' + queryString.join('&') : '');");
            newLine(sb);
            sb.append("return sendRequest")
                .append("<")
                .append(TypeScriptHelper.convertType(method.getReturnType(), types))
                .append(">('").append(method.getHttpMethod())
                .append("', path")
                .append(", ")
                .append(method.getBodyParam() != null
                    ? method.getBodyParam().getName()
                    : "undefined")
                .append(");");
            indent--;
            newLine(sb);
            sb.append("},");
        });

        indent--;
        sb.append("},");
        return sb.toString();
    }

    /**
     * Register rest method
     *
     * @param restMethod method to register
     */
    private void registerMethod(RestMethod restMethod) {
        this.restMethods.add(restMethod);
    }

    /**
     * Register class-level path param
     *
     * @param name    name of the parameter
     * @param javadoc some documentation
     * @param type    type of the parameter
     */
    private void addPathParameter(String name, String javadoc, Type type) {
        Param param = new Param();
        param.setName(name);
        param.setJavadoc(javadoc);
        param.setType(type);

        this.pathParameters.add(param);
    }

    /**
     * Get all rest methods
     *
     * @return list of rest methods
     */
    public List<RestMethod> getRestMethods() {
        return restMethods;
    }

    @Override
    public String toString() {
        return this.className;
    }

    /**
     * Get simple class name
     *
     * @return simple class name
     */
    public String getSimpleClassName() {
        return simpleClassName;
    }

    /**
     * Analyze path and extract path parameters.
     *
     * @param path path to analyze
     *
     * @return path parameters named mapped to null type. Effective type must be resolved while
     *         parsing various methods
     */
    private static Map<String, Class<?>> splitPath(Path path) {
        HashMap<String, Class<?>> parameters = new HashMap<>();

        if (path != null) {
            PathPattern pathPattern = new PathPattern(path.value());
            UriTemplate template = pathPattern.getTemplate();
            for (String param : template.getTemplateVariables()) {
                // no way to detect param type at the moment
                parameters.put(param, null);
            }
        }

        return parameters;
    }

    /**
     * Build a RestController based on a klass
     *
     * @param klass           the class must be annotated with {@link Path}
     * @param applicationPath main application path
     * @param log             maven log
     *
     * @return RestControlle instance, ready for code generation
     */
    public static RestController build(Class<?> klass, String applicationPath, Log log) {
        RestController restController = new RestController();
        restController.log = log;

        restController.setAdminResource(klass.getAnnotation(AdminResource.class) != null);
        restController.setAuthenticationRequired(
            klass.getAnnotation(AuthenticationRequired.class) != null);

        restController.simpleClassName = klass.getSimpleName();
        restController.className = klass.getName();

        Path classPath = klass.getAnnotation(Path.class);
        // eg @Path("project/{pId: [regex]}/card/{}")   or "project"
        Map<String, Class<?>> mainPathParam = splitPath(classPath);

        if (log != null) {
            log.debug("Build RestController for class " + klass);
        }
        // Go through each class methods but only cares about ones annotated with
        // a HttpMethod-like annotation
        for (Method method : klass.getMethods()) {
            for (Annotation annotation : method.getAnnotations()) {
                // @GET @POST, etc ?
                HttpMethod httpMethodAnno = annotation.annotationType()
                    .getAnnotation(HttpMethod.class);
                if (httpMethodAnno != null) {
                    RestMethod restMethod = new RestMethod();
                    restMethod.setName(method.getName());
                    restController.registerMethod(restMethod);

                    String httpMethod = httpMethodAnno.value();
                    restMethod.setHttpMethod(httpMethod);

                    Path methodPath = method.getAnnotation(Path.class);

                    restMethod
                        .setAdminResource(method.getAnnotation(AdminResource.class) != null);
                    restMethod.setAuthenticationRequired(
                        method.getAnnotation(AuthenticationRequired.class) != null);

                    // full path
                    StringBuilder pathBuilder = new StringBuilder(applicationPath).append('/')
                        .append(classPath.value());
                    if (methodPath != null && !methodPath.value().isEmpty() && !"/"
                        .equals(methodPath.value())) {
                        if (methodPath.value().charAt(0) != '/') {
                            pathBuilder.append('/');
                        }
                        pathBuilder.append(methodPath.value());
                    }
                    String fullPath = pathBuilder.toString();

                    restMethod.setFullPath(fullPath);

                    Map<String, Class<?>> methodPathParam = splitPath(methodPath);

                    // Process parameters
                    for (Parameter p : method.getParameters()) {
                        PathParam pathParam = p.getAnnotation(PathParam.class);
                        QueryParam queryParam = p.getAnnotation(QueryParam.class);

                        if (pathParam != null) {
                            // Path param may be a method specific param or a class one
                            // at this point, resolving effective pathParam type is possible
                            if (methodPathParam.containsKey(pathParam.value())) {
                                methodPathParam.put(pathParam.value(), p.getType());
                                restMethod.addPathParameter(
                                    pathParam.value(),
                                    "path param",
                                    p.getType());
                            } else if (mainPathParam.containsKey(pathParam.value())) {
                                mainPathParam.put(pathParam.value(), p.getType());

                                restController.addPathParameter(
                                    pathParam.value(),
                                    "path param",
                                    p.getType());
                            } else {
                                if (log != null) {
                                    log.error("@PathParam "
                                        + pathParam.value() + " not found in @Path");
                                    // error !
                                }
                            }
                        } else if (queryParam != null) {
                            restMethod.addQueryParameter(
                                p.getName(),
                                "query param",
                                p.getType());
                        } else if (p.getAnnotations().length == 0) {
                            // request body
                            if (restMethod.getBodyParam() != null && log != null) {
                                // several body param ????
                                log.warn("Several body parameters ???");
                            }
                            Param bodyParam = new Param();
                            bodyParam.setName(p.getName());
                            bodyParam.setType(p.getParameterizedType());
                            bodyParam.setJavadoc("body payload");
                            restMethod.setBodyParam(bodyParam);
                        }
                    }

                    Class<?> returnType = method.getReturnType();
                    Type genericType = method.getGenericReturnType();

                    String typeName = returnType.getTypeName();
                    String genericTypeName = genericType.getTypeName();

                    boolean isReturnTypeGeneric = !typeName.equals(genericTypeName);
                    if (isReturnTypeGeneric) {
                        restMethod.setReturnTypeGeneric(isReturnTypeGeneric);
                    }

                    restMethod.setReturnType(isReturnTypeGeneric ? genericType : returnType);

                    break;
                }
            }
        }
        return restController;
    }

}
