/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.document.LexicalDataOwnershipKind;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.classic.methods.HttpPost;
import org.apache.hc.client5.http.impl.classic.HttpClientBuilder;
import org.apache.hc.core5.http.HttpMessage;
import org.apache.hc.core5.http.HttpResponse;
import org.apache.hc.core5.http.HttpStatus;
import org.apache.hc.core5.net.URIBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * To manage the data in the colab-yjs server (that is used to store the lexical text editor data).
 *
 * @author sandra
 */
public class YjsLexicalCaller {
    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(YjsLexicalCaller.class);

    /** Duplicate URL */
    private static final String DUPLICATE_URL = "duplicate";

    /** OwnerId parameter */
    private static final String PARAM_OWNER_ID = "ownerId";

    /** Kind parameter */
    private static final String PARAM_KIND = "kind";

    /** ToDuplicateId parameter */
    private static final String PARAM_DUPLICATE_ID = "toDuplicateId";

    /** ToDuplicatedKind parameter */
    private static final String PARAM_DUPLICATE_KIND = "toDuplicateKind";

    /** HTTP client */
    private final HttpClient client;

    /** base URL */
    private final String baseURL;

    // private String cookie;

    /**
     * Constructor.
     * <p>
     * Initialize the client and base URL
     */
    public YjsLexicalCaller(/* String cookie */) {
        this.client = HttpClientBuilder.create().build();
        this.baseURL = ColabConfiguration.getYjsUrlHttp();
        // this.cookie = cookie;
    }

    /**
     * Send a request to duplicate a lexical data of a source owner to a destination owner
     *
     * @param srcOwnerId    the id of the original owner
     * @param srcOwnerKind  the kind of the original owner
     * @param destOwnerId   the id of the new owner
     * @param destOwnerkind the kind of the new owner
     */
    public void sendDuplicationRequest(Long srcOwnerId, LexicalDataOwnershipKind srcOwnerKind,
        Long destOwnerId, LexicalDataOwnershipKind destOwnerkind) {

        HttpResponse response = null;
        try {
            URIBuilder builder = new URIBuilder(baseURL + "/" + DUPLICATE_URL);
            builder.addParameter(PARAM_DUPLICATE_ID, Long.toString(srcOwnerId));
            builder.addParameter(PARAM_DUPLICATE_KIND, srcOwnerKind.getKeyword());
            builder.addParameter(PARAM_OWNER_ID, Long.toString(destOwnerId));
            builder.addParameter(PARAM_KIND, destOwnerkind.getKeyword());

            HttpPost request = new HttpPost(builder.build());

            setHeaders(request);

            logger.debug("duplicate : " + request.getPath());

            response = client.execute(request);

        } catch (Throwable cause) {
            throw new YjsException(cause);
        }

        if (response == null) {
            throw new YjsException("No response");
        }

        logger.trace("duplication return code " + response.getCode());

        if (response.getCode() >= HttpStatus.SC_CLIENT_ERROR) {
            throw new YjsException(
                "code " + response.getCode() + " : " + response.getReasonPhrase());
        }
    }

    /**
     * Set HTTP message headers
     *
     * @param msg the HTTP message
     */
    private void setHeaders(HttpMessage msg) {
        msg.setHeader("Content-Type", "application/json");
        msg.setHeader("Accept", "*/*");
        // msg.setHeader("Cookie", cookie);
        msg.setHeader("Managed-Mode", "false");
        msg.setHeader("User-Agent", "coLAB");
//        msg.setHeader("Authorization", auth);
    }
}
