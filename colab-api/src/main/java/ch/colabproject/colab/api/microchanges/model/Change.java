/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.model;

import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.BlockChannelBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.validation.constraints.NotNull;
import org.apache.commons.text.StringEscapeUtils;

/**
 * A change is an atomic set of microchanges.
 *
 * @author maxence
 */
@ExtractJavaDoc
public class Change implements Serializable, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    /**
     * JsonDiscriminator to fetch the class this change targets
     */
    @NotNull
    private String atClass;

    /**
     * Id of the object this change targets
     */
    @NotNull
    private Long atId;

    /**
     * Revision this change is based on.
     */
    @NotNull
    private Set<String> basedOn;

    /**
     * new revision
     */
    @NotNull
    private String revision;

    /**
     * aka websocket sessionId
     */
    @NotNull
    private String liveSession;

    /**
     * List of micro microchanges which compose this change
     */
    @NotNull
    private List<MicroChange> microchanges = new ArrayList<>();

    /**
     * Id of the project this change belongs to
     */
    @NotNull
    @JsonbTransient
    private Long blockId;

    @Override
    public Long getId() {
        return atId;
    }

    /**
     * Get microchanges
     *
     * @return set of microchanges
     */
    public List<MicroChange> getMicrochanges() {
        return microchanges;
    }

    /**
     * Set microchanges
     *
     * @param microchanges microchanges
     */
    public void setMicrochanges(List<MicroChange> microchanges) {
        this.microchanges = microchanges;
    }

    /**
     * Get the JSON discriminator
     *
     * @return JSON discriminator
     */
    public String getAtClass() {
        return atClass;
    }

    /**
     * Set the JSON discriminator
     *
     * @param atClass new discriminator
     */
    public void setAtClass(String atClass) {
        this.atClass = atClass;
    }

    /**
     * The object id.
     *
     * @return the id of the object
     */
    public Long getAtId() {
        return atId;
    }

    /**
     * set object id
     *
     * @param atId object id
     */
    public void setAtId(Long atId) {
        this.atId = atId;
    }

    /**
     * Get the revision hash this change is based on
     *
     * @return the revision hash
     */
    public Set<String> getBasedOn() {
        return basedOn;
    }

    /**
     * Set the revision this change is based on
     *
     * @param basedOn list of revision hash
     */
    public void setBasedOn(Set<String> basedOn) {
        this.basedOn = basedOn;
    }

    /**
     * the review to which this change leads.
     *
     * @return the revision hash
     */
    public String getRevision() {
        return revision;
    }

    /**
     * Set the revision to which this change leads
     *
     * @param revision revision hash
     */
    public void setRevision(String revision) {
        this.revision = revision;
    }

    /**
     * The live session who authored this change
     *
     * @return live session id (ie. websocket session id)
     */
    public String getLiveSession() {
        return liveSession;
    }

    /**
     * Set the live session who authored this change
     *
     * @param liveSession the live session id
     */
    public void setLiveSession(String liveSession) {
        this.liveSession = liveSession;
    }

    /**
     * Get the project id
     *
     * @return id of the project
     */
    public Long getBlockId() {
        return blockId;
    }

    @Override
    public Object getIndexEntryPayload() {
        return this;
    }

    /**
     * Set block id
     *
     * @param blockId the id
     */
    public void setBlockId(Long blockId) {
        this.blockId = blockId;
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        return new BlockChannelBuilder(blockId);
    }

    @Override
    public String toString() {
        return "Patch{rev@" + this.revision
            + " basedOn@" + this.basedOn + " µ: "
            + this.microchanges + "}";
    }

    /**
     * Get debug code
     *
     * @return debug code
     */
    public String toDebugStatement() {
        StringBuilder sb = new StringBuilder();
        sb.append("createChange(\"").append(
            StringEscapeUtils.escapeEcmaScript(this.liveSession)
        ).append("\", [");

        this.basedOn.forEach(base -> {
            sb.append("\"")
                .append(StringEscapeUtils.escapeEcmaScript(base))
                .append("\", ");
        });

        sb.append("], \"")
            .append(StringEscapeUtils.escapeEcmaScript(this.revision))
            .append("\"");

        this.microchanges.forEach(mu -> {
            sb.append(", ").append(mu.getDebugStatement());
        });
        sb.append(")");

        return sb.toString();
    }
}
