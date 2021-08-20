/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team.acl;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.team.TeamRole;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tracking.Tracking;
import ch.colabproject.colab.api.security.permissions.Conditions;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

/**
 * Define access-level user or role have to cards
 *
 * @author maxence
 */
@Entity
public class AccessControl implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------
    /**
     * Project ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * creation &amp; modification tracking data
     */
    @Embedded
    private Tracking trackingData;

    /**
     * The role this access control is for
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private TeamRole role;

    /**
     * The member this access control is for
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private TeamMember member;

    /**
     * CAIRO level (RACI + out_of_the_loop)
     */
    @NotNull
    @Enumerated(value = EnumType.STRING)
    private InvolvementLevel cairoLevel;

    /**
     * the card this access control is related to
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JsonbTransient
    private Card card;

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

    /**
     * Get the value of InvolvementLevel
     *
     * @return the value of InvolvementLevel
     */
    public InvolvementLevel getCairoLevel() {
        return cairoLevel;
    }

    /**
     * Set the value of InvolvementLevel
     *
     * @param cairoLevel new value of InvolvementLevel
     */
    public void setCairoLevel(InvolvementLevel cairoLevel) {
        this.cairoLevel = cairoLevel;
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

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        // no-op
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
    public Conditions.Condition getUpdateCondition() {
        if (this.getCard() != null) {
            return this.getCard().getUpdateCondition();
        } else {
            return Conditions.alwaysTrue;
        }
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.getCard() != null) {
            return this.getCard().getChannels();
        } else {
            return Set.of();
        }
    }
}
