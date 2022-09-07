/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.card.CardType;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Lob;
import javax.persistence.OneToOne;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

/**
 * Container of text data
 *
 * @author sandra
 */
@Entity
@DiscriminatorValue("TEXT_DATA_BLOCK")
public class TextDataBlock extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * The mime type of the information
     */
    @Size(max = 255)
    private String mimeType;

    /**
     * The information contained
     */
    @Lob
    private String textData;

    /**
     * Current revision hash
     */
    @NotBlank
    @Size(max = 255)
    private String revision = "0";

    /**
     * is the current live block healthy? To heal an un-healthy block, pending changes must be
     * deleted.
     */
    @NotNull
    private boolean healthy = true;

    /**
     * The card type it is the purpose of
     */
    @OneToOne(mappedBy = "purpose", fetch = FetchType.LAZY)
    @JsonbTransient
    private CardType purposingCardType;

    // no need of purposingCardTypeId

    /**
     * The resource it is the teaser of
     */
    @OneToOne(mappedBy = "teaser", fetch = FetchType.LAZY)
    @JsonbTransient
    private Resource teasingResource;

    // no need of teasingResourceId

    /**
     * The sticky note link it is the explanation of
     */
    @OneToOne(mappedBy = "explanation", fetch = FetchType.LAZY)
    @JsonbTransient
    private StickyNoteLink explainingStickyNoteLink;

    // no need of explainingStickyNoteLink

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------
    /**
     * @return the mime type of the information
     */
    public String getMimeType() {
        return mimeType;
    }

    /**
     * @param mimeType the mime type of the information to set
     */
    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    /**
     * @return the information contained
     */
    public String getTextData() {
        return textData;
    }

    /**
     * @param data the information contained to set
     */
    public void setTextData(String data) {
        this.textData = data;
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
     * @return the card type it is the purpose of
     */
    public CardType getPurposingCardType() {
        return purposingCardType;
    }

    /**
     * @param cardType the card type it is the purpose of
     */
    public void setPurposingCardType(CardType cardType) {
        this.purposingCardType = cardType;
    }

    /**
     * @return the resource it is the teaser of
     */
    public Resource getTeasingResource() {
        return teasingResource;
    }

    /**
     * @param resource the resource it is the teaser of
     */
    public void setTeasingResource(Resource resource) {
        this.teasingResource = resource;
    }

    /**
     * @return the sticky note link it is the explanation of
     */
    public StickyNoteLink getExplainingStickyNoteLink() {
        return explainingStickyNoteLink;
    }

    /**
     * @param stickyNoteLink the sticky note link it is the explanation of
     */
    public void setExplainingStickyNoteLink(StickyNoteLink stickyNoteLink) {
        this.explainingStickyNoteLink = stickyNoteLink;
    }

    /**
     * Is the block healthy?
     *
     * @return true if the block is healthy
     */
    public boolean isHealthy() {
        return healthy;
    }

    /**
     * Set the block health status
     *
     * @param healthy true is the block is healthy
     */
    public void setHealthy(boolean healthy) {
        this.healthy = healthy;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof TextDataBlock) {
            TextDataBlock o = (TextDataBlock) other;
            this.setMimeType(o.getMimeType());
            this.setTextData(o.getTextData());
            // Note : the revision is handled by the LiveManager
            // Note : healthy is handled by the LiveManager
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    /**
     * Get the project it belongs to
     *
     * @return block owner
     */
    @Override
    @JsonbTransient
    public Project getProject() {
        if (this.getOwningCardContent() != null) {
            // The document is a deliverable of a card content
            return this.getOwningCardContent().getProject();
        } else if (this.getOwningResource() != null) {
            // The document is part of a resource
            return this.getOwningResource().getProject();
        } else if (this.purposingCardType != null) {
            // It is the purpose of a card type
            return this.purposingCardType.getProject();
        } else if (this.teasingResource != null) {
            // It is the teaser of a resource
            return this.teasingResource.getProject();
        } else if (this.explainingStickyNoteLink != null) {
            // It is the explanation of a sticky note link
            return this.explainingStickyNoteLink.getProject();
        } else {
            // such an orphan shouldn't exist...
            return null;
        }
    }

    // Note : needed to set JsonbTransient, else it is generated in ColabClient.d.ts
    @JsonbTransient
    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.owningCardContent != null) {
            // The document is a deliverable of a card content
            return this.owningCardContent.getChannelsBuilder();
        } else if (this.owningResource != null) {
            // The document is part of a resource
            return this.owningResource.getChannelsBuilder();
        } else if (this.purposingCardType != null) {
            // It is the purpose of a card type
            return this.purposingCardType.getChannelsBuilder();
        } else if (this.teasingResource != null) {
            // It is the teaser of a resource
            return this.teasingResource.getChannelsBuilder();
        } else if (this.explainingStickyNoteLink != null) {
            // It is the explanation of a sticky note link
            return this.explainingStickyNoteLink.getChannelsBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

// TODO sandra work in progress - ACL on text data blocks
//    @Override
//    @JsonbTransient
//    public Conditions.Condition getReadCondition() {
//        if (getOwningCardContent() != null) {
//            // The document is a deliverable of a card content
//            return new Conditions.HasCardReadRight(getOwningCardContent());
//        } else if (getOwningResource() != null) {
//            // The document is part of a resource
//            return getOwningResource().getReadCondition();
//        } else if (this.purposingCardType != null) {
//            // It is the purpose of a card type
//            return this.purposingCardType.getReadCondition();
//        } else if (this.teasingResource != null) {
//            // It is the teaser of a resource
//            return this.teasingResource.getReadCondition();
//        } else if (this.explainingStickyNoteLink != null) {
//            // It is the explanation of a sticky note link
//            return this.explainingStickyNoteLink.getReadCondition();
//        } else {
//            // such an orphan shouldn't exist...
//            return Conditions.defaultForOrphan;
//        }
//    }
//
//    @Override
//    public Conditions.Condition getUpdateCondition() {
//        if (getOwningCardContent() != null) {
//            // The document is a deliverable of a card content
//            return getOwningCardContent().getUpdateCondition();
//        } else if (getOwningResource() != null) {
//            // The document is part of a resource
//            return getOwningResource().getUpdateCondition();
//        } else if (this.purposingCardType != null) {
//            // It is the purpose of a card type
//            return this.purposingCardType.getUpdateCondition();
//        } else if (this.teasingResource != null) {
//            // It is the teaser of a resource
//            return this.teasingResource.getUpdateCondition();
//        } else if (this.explainingStickyNoteLink != null) {
//            // It is the explanation of a sticky note link
//            return this.explainingStickyNoteLink.getUpdateCondition();
//        } else {
//            // such an orphan shouldn't exist...
//            return Conditions.defaultForOrphan;
//        }
//    }
    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    public String toString() {
        return "TextDataBlock{" + super.toPartialString() + ", mimeType=" + mimeType + "}";
    }

}
