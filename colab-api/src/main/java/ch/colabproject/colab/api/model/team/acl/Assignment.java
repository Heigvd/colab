/*
 * The coLAB project
 * Copyright (C) 2021-2024 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.common.DeletionStatus;
import ch.colabproject.colab.api.model.common.Tracking;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.ChannelsBuilder;
import ch.colabproject.colab.api.ws.channel.tool.ChannelsBuilders.EmptyChannelBuilder;

import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.*;
import javax.validation.constraints.NotNull;

import static ch.colabproject.colab.api.model.team.TeamMember.TEAM_SEQUENCE_NAME;

/**
 * Define the assignment a team member or a team role have to cards
 *
 * @author maxence
 */
@Entity
@Table(
    indexes = {
        @Index(columnList = "card_id,member_id,role_id", unique = true),
        @Index(columnList = "card_id"),
        @Index(columnList = "member_id"),
        @Index(columnList = "role_id"),
    }
)
public class Assignment implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Project ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = TEAM_SEQUENCE_NAME)
    private Long id;

    /**
     * creation + modification + erasure tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * Is it in a bin or ready to be definitely deleted. Null means active.
     */
    @Enumerated(EnumType.STRING)
    private DeletionStatus deletionStatus;

    /**
     * Involvement level = RACI level
     */
    // can be null, no responsibility yet
    @Enumerated(value = EnumType.STRING)
    private InvolvementLevel involvementLevel;

    /**
     * the card this assignment is related to
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private Card card;

    /**
     * The member this assignment is for
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private TeamMember member;

    /**
     * The role this assignment is for
     */
    // Note : currently not used on client side
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private TeamRole role;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the project ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the project ID
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

    @Override
    public DeletionStatus getDeletionStatus() {
        return deletionStatus;
    }

    @Override
    public void setDeletionStatus(DeletionStatus status) {
        this.deletionStatus = status;
    }

    /**
     * Get the involvement level
     *
     * @return the involvement level
     */
    public InvolvementLevel getInvolvementLevel() {
        return involvementLevel;
    }

    /**
     * Set the involvement level
     *
     * @param involvementLevel the involvement level
     */
    public void setInvolvementLevel(InvolvementLevel involvementLevel) {
        this.involvementLevel = involvementLevel;
    }

    /**
     * Get the card
     *
     * @return the card
     */
    public Card getCard() {
        return card;
    }

    /**
     * Set the card
     *
     * @param card the card
     */
    public void setCard(Card card) {
        this.card = card;
    }

    /**
     * Get id of the card, for serialization only
     *
     * @return id of the card
     */
    public Long getCardId() {
        if (this.card != null) {
            return card.getId();
        } else {
            return null;
        }
    }

    /**
     * Get the value of member
     *
     * @return the value of member
     */
    public TeamMember getMember() {
        return member;
    }

    /**
     * Get id of the member, for serialization only
     *
     * @return id of the member
     */
    public Long getMemberId() {
        if (this.member != null) {
            return member.getId();
        } else {
            return null;
        }
    }

    /**
     * Set the value of member
     *
     * @param member new value of member
     */
    public void setMember(TeamMember member) {
        this.member = member;
        if (member != null) {
            this.setRole(null);
        }
    }

    /**
     * Get the value of role
     *
     * @return the value of role
     */
    public TeamRole getRole() {
        return role;
    }

    /**
     * Set the value of role
     *
     * @param role new value of role
     */
    public void setRole(TeamRole role) {
        this.role = role;

        if (role != null) {
            this.setMember(null);
        }
    }

    /**
     * Get id of the role, for serialization only
     *
     * @return id of the role
     */
    public Long getRoleId() {
        if (this.role != null) {
            return role.getId();
        } else {
            return null;
        }
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void mergeToUpdate(ColabEntity other) throws ColabMergeException {
        if (other instanceof Assignment) {
            Assignment o = (Assignment) other;
            this.setDeletionStatus(o.getDeletionStatus());
            // involvement level cannot be update manually. It is handled by AssignmentManager
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public void mergeToDuplicate(ColabEntity other) throws ColabMergeException {
        if (other instanceof Assignment) {
            Assignment o = (Assignment) other;
            this.setDeletionStatus(o.getDeletionStatus());
            this.setInvolvementLevel(o.getInvolvementLevel());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

    @Override
    public ChannelsBuilder getChannelsBuilder() {
        if (this.getCard() != null) {
            return this.getCard().getChannelsBuilder();
        } else {
            // such an orphan shouldn't exist...
            return new EmptyChannelBuilder();
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getReadCondition() {
        if (this.getCard() != null) {
            return this.getCard().getReadCondition();
        } else {
            return Conditions.alwaysTrue;
        }
    }

    @Override
    @JsonbTransient
    public Conditions.Condition getUpdateCondition() {
        if (this.getCard() != null) {
            return this.getCard().getUpdateCondition();
        } else {
            return Conditions.alwaysTrue;
        }
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
        return "Assignment{" + "id=" + id + ", deletion=" + getDeletionStatus()
            + ", involvmt=" + involvementLevel + "}";
    }

}
