/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import java.io.IOException;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Set CacheControl No-Cache for static content
 *
 * @author maxence
 */
@WebFilter(filterName = "CacheControlFilter", urlPatterns = {"/*"}, dispatcherTypes = {DispatcherType.REQUEST})
public class StaticContentCacheControlFilter implements Filter{

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(StaticContentCacheControlFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        /** no-op */
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        if (request instanceof HttpServletRequest && response instanceof HttpServletResponse) {
            HttpServletRequest req = (HttpServletRequest) request;
            HttpServletResponse resp = (HttpServletResponse) response;

            String url = req.getRequestURI().replaceFirst("^" + req.getContextPath(), "");
            resp.setHeader("Cache-Control", "no-cache");
            logger.trace("CacheControl Filter: {} to no-cache", url);
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        /** no-op */
    }
}
