/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.mailhog;

import ch.colabproject.colab.generator.plugin.rest.RestClient;
import ch.colabproject.colab.tests.mailhog.model.Message;
import java.util.List;
import javax.ws.rs.core.GenericType;

/**
 * Mailhog is a SMTP mock which accept all incoming messages. Messages are available through a REST
 * api. This is the client of this API.
 *
 * @author maxence
 */
public class MailhogClient extends RestClient {

    /**
     * Create a localhost:8025 mailhog client
     */
    public MailhogClient() {
        super("http://localhost:8025", null, null);
    }

    /*
     * GET /api/v1/events <p> Streams new messages using EventSource and chunked encoding
     */
    // public List<Event> getEvents() { }

    /*
     * GET /api/v1/messages
     *
     * Lists all messages excluding message content
     */
    public List<Message> getMessages() {
        return this.get("/api/v1/messages", new GenericType<List<Message>>() {
        });
    }

    /**
     * DELETE /api/v1/messages
     * <p>
     * Deletes all messages
     * <p>
     * Returns a 200 response code if message deletion was successful.
     */
    public void deleteAllMessages() {
        this.delete("/api/v1/messages", new GenericType<>(void.class));
    }

    /**
     * GET /api/v1/messages/{ message_id }
     * <p>
     * Returns an individual message including message content
     *
     * @param id if of the message to download
     *
     * @return the message
     */
    public Message getMessage(String id) {
        return this.get("/api/v1/messages/" + id, new GenericType<>(Message.class));
    }

    /**
     * DELETE /api/v1/messages/{ message_id }
     * <p>
     * Delete an individual message
     * <p>
     * Returns a 200 response code if message deletion was successful.
     *
     * @param id id of the message to delete
     */
    public void deleteMessage(String id) {
        this.delete("/api/v1/messages/" + id, new GenericType<>(void.class));
    }

    /*
     * GET /api/v1/messages/{ message_id }/download <p> Download the complete message
     *
     * @param id id of the message to download
     *
     * @return to de defined...
     */
    //public Object downloadMessage(String id) { return this.get("/api/v1/messages/" + id, .class); }

    /*
     * GET /api/v1/messages/{ message_id }/mime/part/{ part_index }/download Download a MIME part
     */
    //public MimePart getMimePart(String id, int partIndex) {}

    /*
     * POST /api/v1/messages/{ message_id }/release <p>
     */
    // public void releaseMessage(String id, String host, int port, String recipient) { }
}
