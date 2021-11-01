/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.rest.link;

import ch.colabproject.colab.api.model.document.Block;
import java.io.Serializable;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * Bean with everything needed to create a sticky note link
 *
 * @author sandra
 */
public class StickyNoteLinkCreationBean implements Serializable {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The id of the source card
     */
    private Long srcCardId;

    /**
     * The ID of the source card content (serialization sugar)
     */
    private Long srcCardContentId;

    /**
     * The ID of the source resource / resource reference (serialization sugar)
     */
    private Long srcResourceOrRefId;

    /**
     * The ID of the source block (serialization sugar)
     */
    private Long srcBlockId;

    /**
     * The ID of the destination card (serialization sugar)
     */
    private Long destinationCardId;

    /**
     * The short description
     */
    private String teaser;

    /**
     * The id of the long description
     */
    private Block explanation;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the srcCardId
     */
    public Long getSrcCardId() {
        return srcCardId;
    }

    /**
     * @param srcCardId the srcCardId
     */
    public void setSrcCardId(Long srcCardId) {
        this.srcCardId = srcCardId;
    }

    /**
     * @return the srcCardContentId
     */
    public Long getSrcCardContentId() {
        return srcCardContentId;
    }

    /**
     * @param srcCardContentId the srcCardContentId
     */
    public void setSrcCardContentId(Long srcCardContentId) {
        this.srcCardContentId = srcCardContentId;
    }

    /**
     * @return the srcResourceOrRefId
     */
    public Long getSrcResourceOrRefId() {
        return srcResourceOrRefId;
    }

    /**
     * @param srcResourceOrRefId the srcResourceOrRefId
     */
    public void setSrcResourceOrRefId(Long srcResourceOrRefId) {
        this.srcResourceOrRefId = srcResourceOrRefId;
    }

    /**
     * @return the srcBlockId
     */
    public Long getSrcBlockId() {
        return srcBlockId;
    }

    /**
     * @param srcBlockId the srcBlockId
     */
    public void setSrcBlockId(Long srcBlockId) {
        this.srcBlockId = srcBlockId;
    }

    /**
     * @return the destinationCardId
     */
    public Long getDestinationCardId() {
        return destinationCardId;
    }

    /**
     * @param destinationCardId the destinationCardId
     */
    public void setDestinationCardId(Long destinationCardId) {
        this.destinationCardId = destinationCardId;
    }

    /**
     * @return the teaser
     */
    public String getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the teaser
     */
    public void setTeaser(String teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the explanation
     */
    public Block getExplanation() {
        return explanation;
    }

    /**
     * @param explanation the explanation
     */
    public void setExplanation(Block explanation) {
        this.explanation = explanation;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.srcCardId)
            .append(this.srcCardContentId)
            .append(this.srcResourceOrRefId)
            .append(this.srcBlockId)
            .append(this.destinationCardId)
            .append(this.teaser)
            .toHashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final StickyNoteLinkCreationBean other = (StickyNoteLinkCreationBean) obj;
        return new EqualsBuilder()
            .append(this.srcCardId, other.srcCardId)
            .append(this.srcCardContentId, other.srcCardContentId)
            .append(this.srcResourceOrRefId, other.srcResourceOrRefId)
            .append(this.srcBlockId, other.srcBlockId)
            .append(this.destinationCardId, other.destinationCardId)
            .append(this.teaser, other.teaser)
            .isEquals();
    }

    @Override
    public String toString() {
        return "StickyNoteLinkCreationBean{" + "srcCardId=" + srcCardId
            + ", srcCardContentId=" + srcCardContentId
            + ", srcResourceOrRefId=" + srcResourceOrRefId + ", srcBlockId=" + srcBlockId
            + ", destinationCardId=" + destinationCardId + ", teaser=" + teaser + "}";
    }
}
