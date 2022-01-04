/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin.rest;

import java.io.File;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataMultiPart;

/**
 * Represent a rest method
 *
 * @author maxence
 */
public class RestMethod {

    /**
     * HTTP method. One of GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS.
     */
    private String httpMethod;

    /**
     * Method name
     */
    private String name;

    /**
     * full path. class path + method path
     */
    private String fullPath;

    /**
     * List of path parameters
     */
    private List<Param> pathParameters = new ArrayList<>();

    /**
     * List of querystring parameters
     */
    private List<Param> queryParameters = new ArrayList<>();

    /**
     * List of form parameters
     */
    private List<Param> formParameters = new ArrayList<>();

    /**
     * body param
     */
    private Param bodyParam;

    /**
     * return type
     */
    private Type returnType;

    /**
     * Is return type generic ?
     */
    private boolean returnTypeGeneric;

    /**
     * is this class only for admin ?
     */
    private boolean adminResource;

    /**
     * does this class restricted to authenticated users ?
     */
    private boolean authenticationRequired;

    /**
     * MIME Type the method produces.
     */
    private List<String> produces;

    /**
     * Effective MIME Type the method consumes.
     */
    private List<String> consumes;

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
     * Get the value of returnTypeGeneric
     *
     * @return the value of returnTypeGeneric
     */
    public boolean isReturnTypeGeneric() {
        return returnTypeGeneric;
    }

    /**
     * Set the value of returnTypeGeneric
     *
     * @param returnTypeGeneric new value of returnTypeGeneric
     */
    public void setReturnTypeGeneric(boolean returnTypeGeneric) {
        this.returnTypeGeneric = returnTypeGeneric;
    }

    /**
     * Get the value of returnType
     *
     * @return the value of returnType
     */
    public Type getReturnType() {
        return returnType;
    }

    /**
     * Set the value of returnType
     *
     * @param returnType new value of returnType
     */
    public void setReturnType(Type returnType) {
        this.returnType = returnType;
    }

    /**
     * Get the value of bodyParam
     *
     * @return the value of bodyParam
     */
    public Param getBodyParam() {
        return bodyParam;
    }

    /**
     * Set the value of bodyParam
     *
     * @param bodyParam new value of bodyParam
     */
    public void setBodyParam(Param bodyParam) {
        this.bodyParam = bodyParam;
    }

    /**
     * Get the value of queryParameters
     *
     * @return the value of queryParameters
     */
    public List<Param> getQueryParameters() {
        return queryParameters;
    }

    /**
     * Set the value of queryParameters
     *
     * @param queryParameters new value of queryParameters
     */
    public void setQueryParameters(List<Param> queryParameters) {
        this.queryParameters = queryParameters;
    }

    /**
     * Get the value of formParameters
     *
     * @return the value of formParameters
     */
    public List<Param> getFormParameters() {
        return formParameters;
    }

    /**
     * Set the value of formParameters
     *
     * @param formParameters new value of formParameters
     */
    public void setFormParameters(List<Param> formParameters) {
        this.formParameters = formParameters;
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
     * Get the value of name
     *
     * @return the value of name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the value of name
     *
     * @param name new value of name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get the value of fullPath
     *
     * @return the value of fullPath
     */
    public String getFullPath() {
        return fullPath;
    }

    /**
     * Set the value of fullPath
     *
     * @param fullPath new value of fullPath
     */
    public void setFullPath(String fullPath) {
        this.fullPath = fullPath;
    }

    /**
     * Get the value of httpMethod
     *
     * @return the value of httpMethod
     */
    public String getHttpMethod() {
        return httpMethod;
    }

    /**
     * Set the value of httpMethod
     *
     * @param httpMethod new value of httpMethod
     */
    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    /**
     * Get the value of produces
     *
     * @return the value of produces
     */
    public List<String> getProduces() {
        return produces;
    }

    /**
     * Set the value of produces
     *
     * @param produces new value of produces
     */
    public void setProduces(List<String> produces) {
        this.produces = produces;
    }

    /**
     * Get the value of consumes
     *
     * @return the value of consumes
     */
    public List<String> getConsumes() {
        return consumes;
    }

    /**
     * Set the value of consumes
     *
     * @param consumes new value of consumes
     */
    public void setConsumes(List<String> consumes) {
        this.consumes = consumes;
    }

    /**
     * Register a path parameter
     *
     * @param name           name of the parameter
     * @param annotationName PathParam name
     * @param javadoc        some documentation
     * @param type           type of the parameter
     */
    public void addPathParameter(String name, String annotationName, String javadoc, Type type) {
        Param param = new Param();
        param.setName(name);
        param.setInAnnotationName(annotationName);
        param.setJavadoc(javadoc);
        param.setType(type);

        this.pathParameters.add(param);
    }

    /**
     * Register a query parameter
     *
     * @param name           name of the parameter
     * @param annotationName QueryParam name
     * @param javadoc        some documentation
     * @param type           type of the parameter
     */
    public void addQueryParameter(String name, String annotationName, String javadoc, Type type) {
        Param param = new Param();
        param.setName(name);
        param.setInAnnotationName(annotationName);
        param.setJavadoc(javadoc);
        param.setType(type);

        this.queryParameters.add(param);
    }

    /**
     * Register a query parameter
     *
     * @param name           name of the parameter
     * @param annotationName FormData name
     * @param javadoc        some documentation
     * @param type           type of the parameter
     */
    public void addFormParameter(String name, String annotationName, String javadoc, Type type) {
        Optional<Param> findFirst
            = this.formParameters.stream().filter(p -> p.getInAnnotationName().equals(annotationName)).findFirst();
        if (findFirst.isEmpty()) {
//            Param param = findFirst.get();
//            // hack: Files are injected with two disctinct parameter: one InputStream for bytes, one
//            // FormDataBodyPart for metadata
//            if (param.getType() instanceof Class
//                && type instanceof Class
//                && ((InputStream.class.isAssignableFrom((Class) type)
//                && ContentDisposition.class.isAssignableFrom((Class) param.getType()))
//                || (InputStream.class.isAssignableFrom((Class) type)
//                && ContentDisposition.class.isAssignableFrom((Class) param.getType())))) {
//                // Both ContentDisposition and InputStream exists: only keep InputStream
//                param.setType(File.class);
//            } else {
//                Logger.warn("Duplicate Form Data");
//            }
//
//        } else {
            Param param = new Param();
            param.setName(name);
            param.setInAnnotationName(annotationName);
            param.setJavadoc(javadoc);
            param.setType(type);

            // hack: MultiPartFile
            if (FormDataBodyPart.class.isAssignableFrom((Class) type)
                || FormDataContentDisposition.class.isAssignableFrom((Class) type)
                || InputStream.class.isAssignableFrom((Class) type)) {
                param.setType(File.class);
            }

            this.formParameters.add(param);
        }
    }

    /**
     * Get all parameters. PathParams + queryParams + fromParam + body
     *
     * @return list of all non-null parameters
     */
    public List<Param> getAllParameters() {
        List<Param> list = new ArrayList<>();
        list.addAll(this.pathParameters);
        list.addAll(this.queryParameters);
        list.addAll(this.formParameters);

        if (bodyParam != null) {
            list.add(bodyParam);
        }
        return list;
    }

    /**
     * Get URL parameters. PathParams + queryParams
     *
     * @return list of all non-null parameters
     */
    public List<Param> getUrlParameters() {
        List<Param> list = new ArrayList<>();
        list.addAll(this.pathParameters);
        list.addAll(this.queryParameters);

        return list;
    }

    @Override
    public String toString() {
        return MessageFormat.format("{0} {1}", this.getHttpMethod(), this.getFullPath());
    }
}
