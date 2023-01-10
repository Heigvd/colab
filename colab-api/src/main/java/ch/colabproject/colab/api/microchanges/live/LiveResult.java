/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.live;

/**
 * @author maxence
 */
public class LiveResult {

    /**
     * Content
     */
    private String content;

    /**
     * revision
     */
    private String revision;

    /**
     * Get the value of content
     *
     * @return the value of content
     */
    public String getContent() {
        return content;
    }

    /**
     * Set the value of content
     *
     * @param content new value of content
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Get the value of revision
     *
     * @return the value of revision
     */
    public String getRevision() {
        return revision;
    }

    /**
     * Set the value of revision
     *
     * @param revision new value of revision
     */
    public void setRevision(String revision) {
        this.revision = revision;
    }

    /**
     * Convenient builder
     *
     * @param content  content
     * @param revision revision
     *
     * @return the result
     */
    public static LiveResult build(String content, String revision) {
        LiveResult r = new LiveResult();
        r.setContent(content);
        r.setRevision(revision);
        return r;
    }
}
