/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.card;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithIndex;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Resourceable;
import ch.colabproject.colab.api.model.link.ActivityFlowLink;
import ch.colabproject.colab.api.model.link.StickyNoteLink;
import ch.colabproject.colab.api.model.link.StickyNoteSourceable;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.acl.AccessControl;
import ch.colabproject.colab.api.model.team.acl.InvolvementLevel;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ProjectContentChannelBuilder;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.CascadeType;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.Size;

/**
 * Card
 * <p>
 * It is defined by a cardType. The content is stored in one or several CardContent.
 *
 * @author sandra
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "cardtype_id"),
        @Index(columnList = "parent_id"),
    }
)
public class Card
    implements ColabEntity, WithWebsocketChannels, Resourceable, StickyNoteSourceable, WithIndex {

    private static final long serialVersionUID = 1L;

    /** Name of the project structure sequence */
    public static final String STRUCTURE_SEQUENCE_NAME = "structure_seq";

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Card ID
     */
    @Id
    @SequenceGenerator(name = STRUCTURE_SEQUENCE_NAME, allocationSize = 20)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = STRUCTURE_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Card title
     */
    @Size(max = 255)
    private String title;

    /**
     * The color of the card
     */
    @Size(max = 255)
    private String color;

    /**
     * The index of the card within its parent
     */
    private int index;

    /**
     * CAIRO level (RACI + out_of_the_loop)
     */
    @Enumerated(value = EnumType.STRING)
    private InvolvementLevel defaultInvolvementLevel;

    /**
     * The card type defining what is it for
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private AbstractCardType cardType;

    /**
     * The id of the card type (serialization sugar)
     */
    @Transient
    private Long cardTypeId;

    /**
     * The parent card content
     * <p>
     * A card can either be the root card of a project or be within a card content
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private CardContent parent;

    /**
     * The id of the parent card content (serialization sugar)
     */
    @Transient
    private Long parentId;

    /**
     * The project this card is root of. may be null
     */
    @OneToOne(mappedBy = "rootCard", fetch = FetchType.LAZY)
    @JsonbTransient
    private Project rootCardProject;

    /**
     * The id of the project for root cards (serialization sugar)
     */
    @Transient
    private Long rootCardProjectId;

    /**
     * The list of content variants.
     * <p>
     * There can be several variants of content
     */
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<CardContent> contentVariants = new ArrayList<>();

    /**
     * Assignees and other access-control
     */
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AccessControl> accessControlList = new ArrayList<>();

    /**
     * The list of abstract resources directly linked to this card
     */
    @OneToMany(mappedBy = "card", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<AbstractResource> directAbstractResources = new ArrayList<>();

    /**
     * The list of sticky note links of which the card is the source
     */
    @OneToMany(mappedBy = "srcCard", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsSrc = new ArrayList<>();

    /**
     * The list of sticky note links of which the card is the destination
     */
    @OneToMany(mappedBy = "destinationCard", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<StickyNoteLink> stickyNoteLinksAsDest = new ArrayList<>();

    /**
     * The list of activity flow links of which the card is the previous one
     */
    @OneToMany(mappedBy = "previousCard", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<ActivityFlowLink> activityFlowLinksAsPrevious = new ArrayList<>();

    /**
     * The list of activity flow links of which the card is the next one
     */
    @OneToMany(mappedBy = "nextCard", cascade = CascadeType.ALL)
    @JsonbTransient
    private List<ActivityFlowLink> activityFlowLinksAsNext = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the card id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the card id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the tracking data
     *
     * @return tracking data
     */
    @Override
    public Tracking getTrackingData() {
        return trackingData;
    }

    /**
     * Set tracking data
     *
     * @param trackingData new tracking data
     */
    @Override
    public void setTrackingData(Tracking trackingData) {
        this.trackingData = trackingData;
    }

    /**
     * Get the value of title
     *
     * @return the value of title
     */
    public String getTitle() {
        return title;
    }

    /**
     * Set the value of title
     *
     * @param title new value of title
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the color of the card
     */
    public String getColor() {
        return color;
    }

    /**
     * @param color the new color of the card
     */
    public void setColor(String color) {
        this.color = color;
    }

    /**
     * @return the index of the card in its parent
     */
    @Override
    public int getIndex() {
        return index;
    }

    /**
     * @param index the new index of the card in its parent
     */
    @Override
    public void setIndex(int index) {
        this.index = index;
    }

    /**
     * Get default involvement level.
     *
     * @return the default involvement level
     */
    public InvolvementLevel getDefaultInvolvementLevel() {
        return defaultInvolvementLevel;
    }

    /**
     * Set the default involvement level
     *
     * @param defaultInvolvementLevel default level to set
     */
    public void setDefaultInvolvementLevel(InvolvementLevel defaultInvolvementLevel) {
        this.defaultInvolvementLevel = defaultInvolvementLevel;
    }

    /**
     * @return the card type defining what is it for
     */
    public AbstractCardType getCardType() {
        return cardType;
    }

    /**
     * @param cardType the card type defining what is it for
     */
    public void setCardType(AbstractCardType cardType) {
        this.cardType = cardType;
    }

    /**
     * get the id of the card type. To be sent to client
     *
     * @return the id of the card type
     */
    public Long getCardTypeId() {
        if (this.cardType != null) {
            return this.cardType.getId();
        } else {
            return cardTypeId;
        }
    }

    /**
     * @param cardTypeId the card type id to set
     */
    public void setCardTypeId(Long cardTypeId) {
        this.cardTypeId = cardTypeId;
    }

    /**
     * @return True if it has a card type
     */
    public boolean hasCardType() {
        return cardType != null || cardTypeId != null;
    }

    /**
     * @return the parent card content
     *         <p>
     *         A card can either be the root card of a project or be within a card content
     */
    public CardContent getParent() {
        return parent;
    }

    /**
     * @param parent the parent card content
     */
    public void setParent(CardContent parent) {
        this.parent = parent;
    }

    /**
     * get the id of the parent card content. To be sent to client
     *
     * @return the id of the parent card content
     */
    public Long getParentId() {
        if (this.parent != null) {
            return parent.getId();
        } else {
            return parentId;
        }
    }

    /**
     * set the id of the parent card content. For serialization only
     *
     * @param parentId the id of the parent card content
     */
    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    /**
     * Get the project this card is root of.
     *
     * @return the project
     */
    public Project getRootCardProject() {
        return rootCardProject;
    }

    /**
     * Set the project this card is the root of
     *
     * @param rootCardProject the project
     */
    public void setRootCardProject(Project rootCardProject) {
        this.rootCardProject = rootCardProject;
    }

    /**
     * get the id of the rootCardProject. To be sent to client.
     *
     * @return the id of the rootCardProject
     */
    public Long getRootCardProjectId() {
        if (this.rootCardProject != null) {
            return rootCardProject.getId();
        } else {
            return rootCardProjectId;
        }
    }

    /**
     * set the id of the rootCard project. For serialization only.
     *
     * @param rootCardProjectId the id of the root-card project
     */
    public void setRootCardProjectId(Long rootCardProjectId) {
        this.rootCardProjectId = rootCardProjectId;
    }

    /**
     * @return True if there is a project whose root card is this one
     */
    public boolean hasRootCardProject() {
        return rootCardProject != null || rootCardProjectId != null;
    }

    /**
     * @return the list of variants of card content
     */
    public List<CardContent> getContentVariants() {
        return contentVariants;
    }

    /**
     * @param contentVariantList the list of variants of card content
     */
    public void setContentVariants(List<CardContent> contentVariantList) {
        this.contentVariants = contentVariantList;
    }

    /**
     * Get access-control list
     *
     * @return ACL
     */
    public List<AccessControl> getAccessControlList() {
        return accessControlList;
    }

    /**
     * Get the access control which match the given member
     *
     * @param member the member
     *
     * @return the access-control which match the member or null
     */
    public AccessControl getAcByMember(TeamMember member) {
        if (member != null) {
            Optional<AccessControl> optAc = this.getAccessControlList().stream()
                .filter(acl -> member.equals(acl.getMember())).findFirst();
            return optAc.isPresent() ? optAc.get() : null;
        } else {
            return null;
        }
    }

    /**
     * Get the access control which match the given role
     *
     * @param role the role
     *
     * @return the access-control which match the role or null
     */
    public AccessControl getAcByRole(TeamRole role) {
        if (role != null) {
            Optional<AccessControl> optAc = this.getAccessControlList().stream()
                .filter(acl -> role.equals(acl.getRole())).findFirst();

            return optAc.isPresent() ? optAc.get() : null;
        } else {
            return null;
        }
    }

    /**
     * Set the access-control list
     *
     * @param accessControlList new list
     */
    public void setAccessControlList(List<AccessControl> accessControlList) {
        this.accessControlList = accessControlList;
    }

    /**
     * @return the list of abstract resources directly linked to this card
     */
    @Override
    public List<AbstractResource> getDirectAbstractResources() {
        return directAbstractResources;
    }

    /**
     * @param abstractResources the list of abstract resources directly linked to this card
     */
    public void setDirectAbstractResources(List<AbstractResource> abstractResources) {
        this.directAbstractResources = abstractResources;
    }

    /**
     * @return the list of sticky note links of which the card is the source
     */
    @Override
    public List<StickyNoteLink> getStickyNoteLinksAsSrc() {
        return stickyNoteLinksAsSrc;
    }

    /**
     * @param links the list of sticky note links of which the card is the source
     */
    public void setStickyNoteLinksAsSrc(List<StickyNoteLink> links) {
        this.stickyNoteLinksAsSrc = links;
    }

    /**
     * @return the list of sticky note links of which the card is the destination
     */
    public List<StickyNoteLink> getStickyNoteLinksAsDest() {
        return stickyNoteLinksAsDest;
    }

    /**
     * @param links the list of sticky note links of which the card is the destination
     */
    public void setStickyNoteLinksAsDest(List<StickyNoteLink> links) {
        this.stickyNoteLinksAsDest = links;
    }

    /**
     * @return the list of activity flow links of which the card is the previous one
     */
    public List<ActivityFlowLink> getActivityFlowLinksAsPrevious() {
        return activityFlowLinksAsPrevious;
    }

    /**
     * @param links list of activity flow links of which the card is the previous one
     */
    public void setActivityFlowLinksAsPrevious(List<ActivityFlowLink> links) {
        this.activityFlowLinksAsPrevious = links;
    }

    /**
     * @return the list of activity flow links of which the card is the next one
     */
    public List<ActivityFlowLink> getActivityFlowLinksAsNext() {
        return activityFlowLinksAsNext;
    }

    /**
     * @param links the list of activity flow links of which the card is the next one
     */
    public void setActivityFlowLinksAsNext(List<ActivityFlowLink> links) {
        this.activityFlowLinksAsNext = links;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Card) {
            Card o = (Card) other;
            this.setTitle(o.getTitle());
            this.setColor(o.getColor());
            this.setIndex(o.getIndex());
            this.setDefaultInvolvementLevel(o.getDefaultInvolvementLevel());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    /**
     * Get the project this card belongs to.
     *
     * @return card owner
     */
    @JsonbTransient
    public Project getProject() {
        if (this.rootCardProject != null) {
            // this card is a root card
            return this.rootCardProject;
        } else if (this.cardType != null) {
            // the card type has a direct access to project
            return this.cardType.getProject();
        } else if (this.parent != null) {
            // nothing easier, so get the one of its parent
            return this.parent.getProject();
        }
        return null;
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.rootCardProject != null) {
            // this card is a root card, propagate through the project content channel
            return new ProjectContentChannelBuilder(this.rootCardProject);
        } else if (this.parent != null) {
            // this card is a sub-card, propagate through its parent channels
            return this.parent.getChannelsBuilder();
        } else if (this.cardType != null) {
            // such a card shouldn't exist...
            // Lorem-ipsum cards for global cardTypes ???
            return this.cardType.getChannelsBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        // genuine hack inside
        // any member can read any card of the project
        // if a member lacks the read right on a card, it will not be able to read the deliverable,
        // resources and so on, but it will still be able to view the card "from the outside"
        return new Conditions.IsCurrentUserMemberOfProject(getProject());
    }

    @Override
    public Conditions.Condition getUpdateCondition() {
        return new Conditions.HasCardWriteRight(this);
    }

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
        return "Card{" + "id=" + id + ", index=" + index + ", color=" + color + ", cardTypeId="
            + cardTypeId + ", parentId=" + parentId + "}";
    }
}
