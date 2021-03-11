/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.service.smtp;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author maxence
 */
public class Message {

    /**
     * Sender email address
     */
    private String from;

    /**
     * Optional reply-to address
     */
    private String replyTo;

    /**
     * List of direct recipients
     */
    private List<String> to = new ArrayList<>();

    /**
     * List of carbon-copy recipients
     */
    private List<String> cc = new ArrayList<>();

    /**
     * List of blind-carbon-copy recipients
     */
    private List<String> bcc = new ArrayList<>();

    /**
     * Message subject
     */
    private String subject;

    /**
     * Message body
     */
    private String body;

    /**
     * Message MIME-Type
     */
    private String mimeType;

    /**
     * Get the from.
     *
     * @return the from
     */
    public String getFrom() {
        return from;
    }

    /**
     * set the value of the from
     *
     * @param from the from to set
     */
    public void setFrom(String from) {
        this.from = from;
    }

    /**
     * Get the replyTo.
     *
     * @return the replyTo
     */
    public String getReplyTo() {
        return replyTo;
    }

    /**
     * set the value of the replyTo
     *
     * @param replyTo the replyTo to set
     */
    public void setReplyTo(String replyTo) {
        this.replyTo = replyTo;
    }

    /**
     * Get the to.
     *
     * @return the to
     */
    public List<String> getTo() {
        return to;
    }

    /**
     * set the value of the to
     *
     * @param to the to to set
     */
    public void setTo(List<String> to) {
        this.to = to;
    }

    /**
     * Get the cc.
     *
     * @return the cc
     */
    public List<String> getCc() {
        return cc;
    }

    /**
     * set the value of the cc
     *
     * @param cc the cc to set
     */
    public void setCc(List<String> cc) {
        this.cc = cc;
    }

    /**
     * Get the bcc.
     *
     * @return the bcc
     */
    public List<String> getBcc() {
        return bcc;
    }

    /**
     * set the value of the bcc
     *
     * @param bcc the bcc to set
     */
    public void setBcc(List<String> bcc) {
        this.bcc = bcc;
    }

    /**
     * Get the subject.
     *
     * @return the subject
     */
    public String getSubject() {
        return subject;
    }

    /**
     * set the value of the subject
     *
     * @param subject the subject to set
     */
    public void setSubject(String subject) {
        this.subject = subject;
    }

    /**
     * Get the body.
     *
     * @return the body
     */
    public String getBody() {
        return body;
    }

    /**
     * set the value of the body
     *
     * @param body the body to set
     */
    public void setBody(String body) {
        this.body = body;
    }

    /**
     * Get the mimeType.
     *
     * @return the mimeType
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * set the value of the mimeType
     *
     * @param mimeType the mimeType to set
     */
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    /**
     * Create a new builder.
     *
     * @return the builder
     */
    public static MessageBuilder create() {
        return MessageBuilder.create();
    }
}
