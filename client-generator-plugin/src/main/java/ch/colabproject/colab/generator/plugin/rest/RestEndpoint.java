/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpException;
import ch.colabproject.colab.generator.model.tools.ClassDoc;
import ch.colabproject.colab.generator.plugin.Logger;
import ch.colabproject.colab.generator.plugin.TypeScriptHelper;
import java.io.Serializable;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.Parameter;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import javax.ws.rs.HttpMethod;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.QueryParam;
import org.glassfish.jersey.uri.PathPattern;
import org.glassfish.jersey.uri.UriTemplate;
import org.reflections.Reflections;

/**
 * Represent a rest controller.
 *
 * @author maxence
 */
public class RestEndpoint {

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

    /**
     * Guess a Class based on its simple name.
     *
     * @param simpleName  simple name of the class
     * @param reflections reflections stores
     *
     * @return class the class if found, null otherwise
     */
    private Class<? extends Serializable> getClassFromSimpleName(
        String simpleName, Reflections reflections
    ) {
        Optional<Class<? extends Serializable>> any
            = reflections.getSubTypesOf(Serializable.class).stream()
                .filter(type -> {
                    return type.getSimpleName().equals(simpleName);
                }).findAny();
        if (any.isPresent()) {
            return any.get();
        } else {
            return null;
        }
    }

    /**
     * Process java doc and make it exportable
     *
     * @param javadoc     javadoc text
     * @param reflections reflections store
     *
     * @return processed javadoc
     */
    private String processJavaDoc(String javadoc, boolean keepJava, Reflections reflections) {
        Pattern atLink = Pattern.compile("\\{@link ([a-zA-Z]+)\\}");
        Matcher atLinkMatcher = atLink.matcher(javadoc);
        String atLinkProcessed = atLinkMatcher.replaceAll(match -> {
            var klass = this.getClassFromSimpleName(match.group(1), reflections);
            if (keepJava && klass != null) {
                return "{@link " + klass.getName() + " " + match.group(1) + "}";
            } else {
                return match.group(1);
            }
        });

        Pattern throwsPattern = Pattern.compile("@throws ([a-zA-Z]+)");
        Matcher throwsMatcher = throwsPattern.matcher(atLinkProcessed);

        return throwsMatcher.replaceAll(match -> {
            Class<? extends Serializable> klass
                = this.getClassFromSimpleName(match.group(1), reflections);
            if (klass != null && HttpException.class.isAssignableFrom(klass)) {
                return "@throws " + klass.getName();
            } else {
                return "";
            }
        });
    }

    /**
     * Write a multi-line block, prefixing each line by the prefix
     *
     * @param sb     sink
     * @param prefix to be added
     */
    private void appendBlock(StringBuilder sb, String prefix, String block) {
        StringBuilder sbPrefix = new StringBuilder();
        newLine(sbPrefix);
        if (prefix != null) {
            sbPrefix.append(prefix);
        }
        String formattedComment = block.replaceAll("\n", sbPrefix.toString());
        sb.append(sbPrefix).append(formattedComment);
    }

    /**
     * Process javadoc block and append it to string builder.
     *
     * @param sb          the string builder
     * @param prefix      prefix each block line with this prefix
     * @param block       block to append
     * @param keepJava    should keep java specific tags (eg @link)
     * @param reflections reflections store
     */
    private void appendJavadocBlock(
        StringBuilder sb, String prefix, String block, boolean keepJava, Reflections reflections
    ) {
        this.appendBlock(sb, prefix, processJavaDoc(block, keepJava, reflections));
    }

    /**
     * Try to imports given class. If the import is possible (ie no simple name collision), register
     * the import in {@code imports} and return the simpleName. If importing the class is not
     * possible, return the class fullname.
     * <p>
     * This method works for simple types, not for parametrized
     *
     * @param name    class full name
     * @param imports map of simplename to fullname to be imported
     *
     * @return the name to use
     */
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

    /**
     * Try to imports given class. If the import is possible (ie no simple name collision), register
     * the import in {@code imports} and return the simpleName. If importing the class is not
     * possible, return the class fullname.
     * <p>
     * This method works for simple types and for parametrized ones.
     *
     * @param name    class full name
     * @param imports map of simplename to fullname to be imported
     *
     * @return the name to use
     */
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
                Logger.warn("Very Complex generic type " + template);
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
     * Camelcasify simpleClassname (eg ArrayList, UserRestEndpoint, ...)
     *
     * @param simpleClassName className
     *
     * @return camel-case version of className eg(arrayList, userRestEndpoint, ...)
     */
    private String camelcasify(String simpleClassName) {
        String firstChar = simpleClassName.substring(0, 1);
        return firstChar.toLowerCase() + simpleClassName.substring(1);
    }

    /**
     * Write java class as string.The generated class is an inner class which has to be included in
     * a main class.
     *
     * @param imports     map of imports
     * @param clientName  name of client class
     * @param javadoc     javadoc as extracted by the JavaDocEtractor
     * @param reflections reflections store
     *
     * @return generated java inner static class
     */
    public String generateJavaClient(
        Map<String, String> imports,
        String clientName,
        Map<String, ClassDoc> javadoc,
        Reflections reflections
    ) {
        tabSize = 4;
        StringBuilder sb = new StringBuilder();
        Logger.debug("Generate client class " + this);

        newLine(sb);
        newLine(sb);
        sb.append("/**");
        ClassDoc classDoc = javadoc.get(this.className);
        if (classDoc != null) {
            appendJavadocBlock(sb, " *", classDoc.getDoc(), true, reflections);
            newLine(sb);
            sb.append(" * <p>");
            newLine(sb);
        }
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
            Logger.debug(" * generate " + method);
            ////////////////////////////////////////////////////////////////////////////////////////
            // JAVADOC
            ////////////////////////////////////////////////////////////////////////////////////////
            // @TODO extract effective java doc from api and reuse it here
            newLine(sb);
            newLine(sb);
            sb.append("/**");
            newLine(sb);
            sb.append(" * ").append(method.getHttpMethod()).append(" ")
                .append(method.getFullPath()).append(" calls {@link ")
                // do not resolve imports in javadoc links
                // one would not imports classes unless they are used in the code
                .append(this.className)
                .append("#").append(method.getName()).append("}");

            String methodDoc = classDoc.getMethods().getOrDefault(method.getName(), "");
            newLine(sb);
            sb.append(" *");
            appendJavadocBlock(sb, " *", methodDoc, true, reflections);

            newLine(sb);
            sb.append(" */");
            newLine(sb);
            ////////////////////////////////////////////////////////////////////////////////////////
            // SIGNATURE
            ////////////////////////////////////////////////////////////////////////////////////////
            String resolvedReturnType
                = resolveImport(method.getReturnType().getTypeName(), imports);
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
                    + " qs.add(\"" + queryParam.getInAnnotationName()
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
     * Write ts client for this controller.This method will populate types map with type which
     * requires a dedicated TS interface
     *
     * @param types       map of types which requires
     * @param javadoc     javadoc as extracted by the JavaDocEtractor
     * @param reflections reflections store
     *
     * @return Typscript REST client
     */
    public String generateTypescriptClient(Map<String, Type> types,
        Map<String, ClassDoc> javadoc,
        Reflections reflections
    ) {
        tabSize = 2;
        Logger.debug("Generate typescript class " + this);

        indent++;
        StringBuilder sb = new StringBuilder();
        newLine(sb);
        sb.append("/**");
        ClassDoc classDoc = javadoc.get(this.className);
        if (classDoc != null) {
            appendJavadocBlock(sb, " *", classDoc.getDoc(), false, reflections);
        }
        newLine(sb);
        sb.append(" */");
        newLine(sb);
        sb.append(this.simpleClassName).append(" : {");
        indent++;
        newLine(sb);

        restMethods.forEach(method -> {
            Logger.debug(" * generate " + method);

            // JSDOC
            ////////////////////////
            newLine(sb);
            sb.append("/**");
            newLine(sb);
            sb.append(" * ").append(method.getHttpMethod()).append(" ")
                .append(method.getFullPath());
            newLine(sb);
            sb.append(" * <p> ");
            String methodDoc = classDoc.getMethods().getOrDefault(method.getName(), "");
            appendJavadocBlock(sb, " *", methodDoc, false, reflections);
            newLine(sb);
            sb.append(" */");
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
            newLine(sb);
            sb.append("const queryString : string[] = [];");
            newLine(sb);

            method.getQueryParameters().forEach(queryParam -> {
                sb.append("if (").append(queryParam.getName()).append(" != null){");
                indent++;
                newLine(sb);
                sb.append("queryString.push('")
                    .append(queryParam.getInAnnotationName())
                    .append("=' + encodeURIComponent(").append(queryParam.getName())
                    .append("+')'));");
                indent--;
                newLine(sb);
                sb.append("}");
            });
            newLine(sb);

            Map<String, String> pathParams = method.getPathParameters().stream()
                .collect(Collectors.toMap(
                    p -> p.getInAnnotationName(),
                    p -> "${" + p.getName() + "}")
                );

            UriTemplate pathTemplate = new PathPattern(method.getFullPath()).getTemplate();
            String tsPath = pathTemplate.createURI(pathParams);
            sb.append("const path = `${baseUrl}").append(tsPath)
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
                .append(", errorHandler);");
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
    private void addPathParameter(String name, String pathParamName, String javadoc, Type type) {
        Param param = new Param();
        param.setName(name);
        param.setInAnnotationName(pathParamName);
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
     * Build a RestEndpoint based on a klass
     *
     * @param klass           the class must be annotated with {@link Path}
     * @param applicationPath main application path
     *
     * @return RestEndpoint instance, ready for code generation
     */
    public static RestEndpoint build(Class<?> klass, String applicationPath) {
        RestEndpoint restEndpoint = new RestEndpoint();

        restEndpoint.setAdminResource(klass.getAnnotation(AdminResource.class) != null);
        restEndpoint.setAuthenticationRequired(
            klass.getAnnotation(AuthenticationRequired.class) != null);

        restEndpoint.simpleClassName = klass.getSimpleName();
        restEndpoint.className = klass.getName();

        Path classPath = klass.getAnnotation(Path.class);
        // eg @Path("project/{pId: [regex]}/card/{}")   or "project"
        Map<String, Class<?>> mainPathParam = splitPath(classPath);

        Logger.debug("Build RestEndpoint for " + klass);
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
                    restEndpoint.registerMethod(restMethod);

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
                                    p.getName(),
                                    pathParam.value(),
                                    "path param",
                                    p.getType());
                            } else if (mainPathParam.containsKey(pathParam.value())) {
                                mainPathParam.put(pathParam.value(), p.getType());

                                restEndpoint.addPathParameter(
                                    p.getName(),
                                    pathParam.value(),
                                    "path param",
                                    p.getType());
                            } else {
                                Logger.error("@PathParam "
                                    + pathParam.value() + " not found in @Path");
                                // error !
                            }
                        } else if (queryParam != null) {
                            restMethod.addQueryParameter(
                                p.getName(),
                                queryParam.value(),
                                "query param",
                                p.getType());
                        } else if (p.getAnnotations().length == 0) {
                            // request body
                            if (restMethod.getBodyParam() != null) {
                                // several body param ????
                                Logger.warn("Several body parameters ???");
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
        return restEndpoint;
    }

}
