/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.service.smtp;

/**
 * To build {@link Message} instances.
 *
 * @author maxence
 */
public class MessageBuilder {

    /**
     * The message to build
     */
    private final Message message;

    /**
     * Private constructor. Please use {@link #build()}
     */
    private MessageBuilder() {
        this.message = new Message();
    }

    /**
     * Set sender address
     *
     * @param from sender address
     *
     * @return this builder
     */
    public MessageBuilder from(String from) {
        message.setFrom(from);
        return this;
    }

    /**
     * set reply-to address
     *
     * @param replyTo reply-to address
     *
     * @return this builder
     */
    public MessageBuilder replyTo(String replyTo) {
        message.setFrom(replyTo);
        return this;
    }

    /**
     * Add a recipient
     *
     * @param to address of the recipient
     *
     * @return this builder
     */
    public MessageBuilder to(String to) {
        message.getTo().add(to);
        return this;
    }

    /**
     * Add a CC recipient
     *
     * @param cc address of the recipient
     *
     * @return this builder
     */
    public MessageBuilder cc(String cc) {
        message.getCc().add(cc);
        return this;
    }

    /**
     * Add a BBC recipient
     *
     * @param bcc address of the recipient
     *
     * @return this builder
     */
    public MessageBuilder bcc(String bcc) {
        message.getBcc().add(bcc);
        return this;
    }

    /**
     * Set the message subject
     *
     * @param subject the subject
     *
     * @return this builder
     */
    public MessageBuilder subject(String subject) {
        message.setSubject(subject);
        return this;
    }

    /**
     * Set the message body. This will override previously set body.
     *
     * @param mimetype body mime-type
     * @param body     body content
     *
     * @return this builder
     */
    public MessageBuilder body(String mimetype, String body) {
        message.setBody(body);
        message.setMimeType(mimetype);
        return this;
    }

    /**
     * Set the body with a text/plain MIME-type
     *
     * @param body plain text body
     *
     * @return this builder
     */
    public MessageBuilder body(String body) {
        return this.body("text/plain", body);
    }

    /**
     * Set the message body with a text/html MIME-type
     *
     * @param body the html body
     *
     * @return this builder
     */
    public MessageBuilder htmlBody(String body) {
        return this.body("text/html", body);
    }

    /**
     * Build the message.
     *
     * @return the message
     */
    public Message build() {
        return message;
    }

    /**
     * Create a new builder.
     *
     * @return the builder
     */
    public static MessageBuilder create() {
        return new MessageBuilder();
    }

}
