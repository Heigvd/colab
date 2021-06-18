/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.NotNull;

/**
 * A change is an atomic set of microchanges.
 *
 * @author maxence
 */
public class Change implements Serializable {

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
     * Revision this change is based on. 0 (zero) means root change
     */
    @NotNull
    private String basedOn;

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
    public String getBasedOn() {
        return basedOn;
    }

    /**
     * Set the revision this change is based on
     *
     * @param basedOn the revision hash
     */
    public void setBasedOn(String basedOn) {
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

    @Override
    public String toString() {
        return "Patch{rev@" + this.basedOn + " " + this.microchanges + " => @" + this.revision + "}";
    }

}
