/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.security;

import ch.colabproject.colab.api.ejb.RequestManager;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.generator.model.annotations.AdminResource;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
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
 * {@link  ch.colabproject.colab.api.rest.utils.RequestFilter RequestFilter}
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
     * Get all method or class annotations matching the given type.
     *
     * @param <T>        type of annotation to search
     * @param annotation type of annotation to search
     * @param klass      targeted class
     * @param method     targeted method
     *
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

        if (currentUser == null) {
            // curenr user not authenticated: make sure the targeted method is accessible to
            // unauthenticated user
            List<AuthenticationRequired> annotations = getAnnotations(
                AuthenticationRequired.class,
                targetClass, targetMethod);

            if (!annotations.isEmpty()) {
                // No current user but annotation required to be authenticated
                // abort with 401 code
                logger.trace("Request aborted:user is not authenticated");
                abortWith = HttpErrorMessage.authenticationRequired();
            }
        } else {
            sessionManager.touchUserActivityDate(currentUser);
        }

        List<AdminResource> annotations = getAnnotations(
            AdminResource.class,
            targetClass, targetMethod);
        if (!annotations.isEmpty()) {
            if (currentUser == null) {
                // no current user : unauthorized asks for user to authenticate
                logger.trace("Request aborted:user is not authenticated");
                abortWith = HttpErrorMessage.authenticationRequired();
            } else {
                if (!currentUser.isAdmin()) {
                    // current user is authenticaed but lack admin right: forbidden
                    logger.trace("Request aborted:user tries to access admin resource");
                    abortWith = HttpErrorMessage.forbidden();
                }
            }
        }

        if (abortWith != null) {
            requestContext.abortWith(exceptionMapper.toResponse(abortWith));
        }
    }
}
