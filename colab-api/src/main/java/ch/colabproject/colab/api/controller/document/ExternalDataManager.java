/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.rest.document.bean.UrlMetadata;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import javax.cache.Cache;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import org.apache.hc.client5.http.classic.methods.HttpGet;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.core5.http.Header;
import org.apache.hc.core5.http.HttpEntity;
import org.apache.hc.core5.net.URIBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To deal with external data
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ExternalDataManager {

    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(UrlMetadata.class);

    /** Open graph title property */
    private static final String OG_TITLE = "og:title";

    /** Open graph title */
    private static final String OG_URL = "og:url";

    /**
     * cache metadata to avoid spamming external services.
     */
    @Inject
    private Cache<String, UrlMetadata> metadataCache;

    /**
     * Read response entity as stream
     *
     * @param entity http entity to read
     *
     * @return the string
     *
     * @throws IOException if something went wrong
     */
    private static String getEntityAsString(HttpEntity entity) throws IOException {
        if (entity != null) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            entity.writeTo(baos);
            return baos.toString("UTF-8");
        } else {
            return "";
        }
    }

    /**
     * Get cached Url metadata. if exists of build fresh
     *
     * @param url url to fetch metadata for
     *
     * @return url metadata
     */
    public UrlMetadata getUrlMetadata(String url) {
        UrlMetadata cached = metadataCache.get(url);
        if (cached != null) {
            return cached;
        }
        return this.refreshAndGetUrlMetadata(url);
    }

    /**
     * Update cache with fresh metadata
     *
     * @param url url to fetch metadata for
     *
     * @return url metadata
     */
    public UrlMetadata refreshAndGetUrlMetadata(String url) {
        UrlMetadata urlMetadata = new UrlMetadata();
        urlMetadata.setBroken(true);
        HashMap<String, String> metadata = new HashMap<>();
        urlMetadata.setMetadata(metadata);

        logger.trace("Scrap {}", url);
        try (var client = HttpClients.createDefault()) {
            URIBuilder uriBuilder = new URIBuilder(url, StandardCharsets.UTF_8);
            URI uri = uriBuilder.normalizeSyntax().build();
            metadata.put(OG_URL, url);

            String[] segs = uri.getPath().split("/");
            if (segs != null && segs.length > 0) {
                // default og:name to last path segment
                String filename = segs[segs.length - 1];
                metadata.put(OG_TITLE, filename);
            } else {
                // otherwise, default to hostname
                metadata.put(OG_TITLE, uri.getHost());
            }

            var get = new HttpGet(uri);
            try (var response = client.execute(get)) {

                HttpEntity entity = response.getEntity();
                int statusCode = response.getCode();

                if (statusCode < 400) {
                    // success
                    urlMetadata.setBroken(false);

                    Header firstHeader = response.getFirstHeader("content-type");
                    String contentType = firstHeader.getValue();
                    int separator = contentType.indexOf(';');

                    if (separator > 0) {
                        contentType = contentType.substring(0, separator);
                    }

                    if (contentType != null) {
                        urlMetadata.setContentType(contentType);
                        if (contentType.equals("text/html")) {
                            // try to fetch metadata in head meta tags
                            String html = getEntityAsString(entity);
                            Document htmlDocument = Jsoup.parse(html, url);
                            Elements metas = htmlDocument.head().select("meta");
                            metas.forEach(meta -> {
                                String prop = meta.attr("property");
                                String name = meta.attr("name");
                                if (prop != null && prop.indexOf(':') >= 0
                                    || name != null && name.indexOf(':') >= 0) {
                                    metadata.put(prop, meta.attr("content"));
                                }
                            });
                        }
                    }
                }

            }
        } catch (Exception e) {
            logger.error("Major Failure", e);
            urlMetadata.setBroken(true);
        }
        // cache metadata
        metadataCache.put(url, urlMetadata);
        return urlMetadata;
    }

}
