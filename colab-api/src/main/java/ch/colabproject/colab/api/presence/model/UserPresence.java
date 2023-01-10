/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.presence.model;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.tools.DateSerDe;
import java.io.Serializable;
import java.time.OffsetDateTime;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.json.bind.annotation.JsonbTypeSerializer;
import javax.validation.constraints.NotNull;

/**
 * Used to activity status of a user with the rest of the team
 *
 * @author maxence
 */
@ExtractJavaDoc
public class UserPresence extends TouchUserPresence implements Serializable, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /**
     * activity date
     */
    @JsonbTypeDeserializer(DateSerDe.class)
    @JsonbTypeSerializer(DateSerDe.class)
    @NotNull
    private OffsetDateTime date;

    /** Id of the team member, if null, it means it's a admin */
    private Long teamMemberId;

    /**
     * new empty user presence instance
     */
    public UserPresence() {
        /** empty default constructor */
    }

    /**
     * Create a userPresence instance by copying a TouchUserPresence
     *
     * @param touch the presence to copy
     */
    public UserPresence(TouchUserPresence touch) {
        this.setProjectId(touch.getProjectId());
        this.setCardId(touch.getCardId());
        this.setCardContentId(touch.getCardContentId());
        this.setContext(touch.getContext());
        this.setDocumentId(touch.getDocumentId());
        this.setSelectionStart(touch.getSelectionStart());
        this.setSelectionEnd(touch.getSelectionEnd());
        this.setProjectId(touch.getProjectId());
        this.setWsSessionId(touch.getWsSessionId());
        this.setDate(OffsetDateTime.now());
    }

    @Override
    public Long getId() {
        return this.getProjectId();
    }

    @Override
    public Object getIndexEntryPayload() {
        return this.getWsSessionId();
    }

    /**
     * Get the value of date
     *
     * @return the value of date
     */
    public OffsetDateTime getDate() {
        return date;
    }

    /**
     * Set the value of date
     *
     * @param date new value of date
     */
    public void setDate(OffsetDateTime date) {
        this.date = date;
    }

    /**
     * Get the value of teamMemberId
     *
     * @return the value of teamMemberId. If null, it means an admin is spying
     */
    public Long getTeamMemberId() {
        return teamMemberId;
    }

    /**
     * Set the value of teamMemberId
     *
     * @param teamMemberId new value of teamMemberId
     */
    public void setTeamMemberId(Long teamMemberId) {
        this.teamMemberId = teamMemberId;
    }

    /////////////////////
    // Websockets
    /////////////////////
    @Override
    public ChannelsBuilder getChannelsBuilder() {
        return new ChannelsBuilders.ProjectContentChannelBuilder(this.getProjectId());
    }
}
