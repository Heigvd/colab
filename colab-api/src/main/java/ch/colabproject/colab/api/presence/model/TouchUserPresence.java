/*
 * The coLAB project
 * Copyright (C) 2022 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.presence.model;

import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.io.Serializable;
import javax.validation.constraints.NotNull;

/**
 *
 * @author maxence
 */
public class TouchUserPresence implements Serializable {

    /**
     * Id of the project
     */
    @NotNull
    private Long projectId;

    /**
     * If of the card, may be null
     */
    private Long cardId;

    /** if of the variant */
    private Long cardContentId;

    /** some informative data */
    private String context;

    /**
     * Websocket session id
     */
    @NotNull
    private String wsSessionId;

    /** If of a document */
    private Long documentId;

    /** selection start index */
    private Long selectionStart;

    /** selection end index */
    private Long selectionEnd;

    /**
     * Get the value of selectionStart
     *
     * @return the value of selectionStart
     */
    public Long getSelectionStart() {
        return selectionStart;
    }

    /**
     * Set the value of selectionStart
     *
     * @param selectionStart new value of selectionStart
     */
    public void setSelectionStart(Long selectionStart) {
        this.selectionStart = selectionStart;
    }

    /**
     * Get the value of selectionEnd
     *
     * @return the value of selectionEnd
     */
    public Long getSelectionEnd() {
        return selectionEnd;
    }

    /**
     * Set the value of selectionEnd
     *
     * @param selectionEnd new value of selectionEnd
     */
    public void setSelectionEnd(Long selectionEnd) {
        this.selectionEnd = selectionEnd;
    }

    /**
     * Get the value of cardId
     *
     * @return the value of cardId
     */
    public Long getCardId() {
        return cardId;
    }

    /**
     * Set the value of cardId
     *
     * @param cardId new value of cardId
     */
    public void setCardId(Long cardId) {
        this.cardId = cardId;
    }

    /**
     * Get the value of documentId
     *
     * @return the value of documentId
     */
    public Long getDocumentId() {
        return documentId;
    }

    /**
     * Set the value of documentId
     *
     * @param documentId new value of documentId
     */
    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    /**
     * Get the value of cardContentId
     *
     * @return the value of cardContentId
     */
    public Long getCardContentId() {
        return cardContentId;
    }

    /**
     * Set the value of cardContentId
     *
     * @param cardContentId new value of cardContentId
     */
    public void setCardContentId(Long cardContentId) {
        this.cardContentId = cardContentId;
    }

    /**
     * Get the value of projectId
     *
     * @return the value of projectId
     */
    public Long getProjectId() {
        return projectId;
    }

    /**
     * Set the value of projectId
     *
     * @param projectId new value of projectId
     */
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    /**
     * Get the value of wsSessionId
     *
     * @return the value of wsSessionId, never null
     */
    public String getWsSessionId() {
        return wsSessionId;
    }

    /**
     * Set the value of wsSessionId
     *
     * @param wsSessionId new value of wsSessionId
     *
     * @throws HttpErrorMessage if wsSessionId is null (dataIntegrityFailure)
     */
    public void setWsSessionId(String wsSessionId) {
        if (wsSessionId == null) {
            throw HttpErrorMessage.dataIntegrityFailure();
        }
        this.wsSessionId = wsSessionId;
    }

    /**
     * Get the context
     *
     * @return the context
     */
    public String getContext() {
        return context;
    }

    /**
     * Set the context
     *
     * @param context new context
     */
    public void setContext(String context) {
        this.context = context;
    }

}
