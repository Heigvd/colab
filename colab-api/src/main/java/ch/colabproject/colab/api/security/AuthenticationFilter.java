/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.annotations.ConsentRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;

import java.io.IOException;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Priority;
import javax.inject.Inject;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Intercept all request to the API and check user has required permission.
 * <p>
 * This filter has a priority of 10, which means it is executed after {@link CookieFilter } and
 * {@link ch.colabproject.colab.api.rest.utils.filter.RequestFilter RequestFilter}
 *
 * @author maxence
 */
@Provider
@Priority(10)
public class AuthenticationFilter implements ContainerRequestFilter {

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationFilter.class);

    /**
     * Request related logic
     */
    @Inject
    private RequestManager requestManager;

    /**
     * Post-matching filter knows the targeted resource by injecting such a ResourceInfo
     */
    @Context
    private ResourceInfo resourceInfo;

    /**
     * To re-use exception to response mapper
     */
    @Inject
    private ExceptionMapper<Exception> exceptionMapper;

    /**
     * Cluster-wide session cache.
     */
    @Inject
    private SessionManager sessionManager;

    /**
     * To get TosAndDataPolicy timestamp
     */
    @Inject
    private TosAndDataPolicyManager tosAndDataPolicyManager;

    /**
     * Get all method or class annotations matching the given type.
     *
     * @param <T>        type of annotation to search
     * @param annotation type of annotation to search
     * @param klass      targeted class
     * @param method     targeted method
     * @return the list of all matching annotations found on class and method
     */
    private <T extends Annotation> List<T> getAnnotations(Class<T> annotation,
                                                          Class<?> klass, Method method) {

        List<T> list = new ArrayList<>();

        T a = method.getAnnotation(annotation);
        if (a != null) {
            list.add(a);
        }
        a = klass.getAnnotation(annotation);

        if (a != null) {
            list.add(a);
        }

        return list;
    }

    /**
     * Intercept request and make sure current user has access to targeted class and method
     * {@inheritDoc }
     */
    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        // Targeted Class & method
        final Class<?> targetClass = resourceInfo.getResourceClass();
        Method targetMethod = resourceInfo.getResourceMethod();

        User currentUser = requestManager.getCurrentUser();
        HttpErrorMessage abortWith = null;

        List<AuthenticationRequired> authAnnotations = getAnnotations(
                AuthenticationRequired.class,
                targetClass, targetMethod);

        if (!authAnnotations.isEmpty()) {
            if (currentUser == null) {
                // current user not authenticated: make sure the targeted method is accessible to
                // unauthenticated user
                // No current user but annotation required to be authenticated
                // abort with 401 code
                logger.trace("Request aborted:user is not authenticated");
                abortWith = HttpErrorMessage.authenticationRequired();
            } else {
                if (currentUser.getAgreedTime() == null || currentUser.getAgreedTime().isBefore(tosAndDataPolicyManager.getTimestamp())) {
                    // current user is authenticated but need to accept new TosAndDataPolicy
                    logger.trace("Request aborted:user has not agreed to new TosAndDataPolicy");
                    abortWith = HttpErrorMessage.forbidden();
                }
            }
        }

        List<ConsentRequired> consentAnnotations = getAnnotations(
                ConsentRequired.class,
                targetClass, targetMethod);

        if (!consentAnnotations.isEmpty()) {
            if (currentUser == null) {
                // no current user : unauthorized asks for user to authenticate
                logger.trace("Request aborted:user is not authenticated");
                abortWith = HttpErrorMessage.authenticationRequired();
            }
        }


        List<AdminResource> adminAnnotations = getAnnotations(
                AdminResource.class,
                targetClass, targetMethod);
        if (!adminAnnotations.isEmpty()) {
            if (currentUser == null) {
                // no current user : unauthorized asks for user to authenticate
                logger.trace("Request aborted:user is not authenticated");
                abortWith = HttpErrorMessage.authenticationRequired();
            } else {
                if (!currentUser.isAdmin()) {
                    // current user is authenticated but lack admin right: forbidden
                    logger.trace("Request aborted:user tries to access admin resource");
                    abortWith = HttpErrorMessage.forbidden();
                }
            }
        }

        if (abortWith != null) {
            requestContext.abortWith(exceptionMapper.toResponse(abortWith));
        } else {
            sessionManager.touchUserActivityDate();
        }
    }
}
