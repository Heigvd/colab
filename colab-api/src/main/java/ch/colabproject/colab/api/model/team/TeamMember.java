/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.WithWebsocketChannels;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.api.model.user.User;
import ch.colabproject.colab.api.ws.channel.WebsocketChannel;
import java.util.Set;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Transient;

/**
 * A member is a {@link User user} which work on a {@link Project project}
 *
 * @author maxence
 */
@Entity
@NamedQuery(name = "TeamMember.areUserTeammate",
        // SELECT true FROM TeamMember a, TeamMember b WHERE ...
        query = "SELECT true FROM TeamMember a "
                + "JOIN TeamMember b ON a.project.id = b.project.id "
                + "WHERE a.user.id = :aUserId AND b.user.id = :bUserId")
public class TeamMember implements ColabEntity, WithWebsocketChannels {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Member ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user
     */
    @ManyToOne
    @JsonbTransient
    private User user;

    /**
     * The user ID (serialization sugar)
     */
    @Transient
    private Long userId;

    /**
     * The project
     */
    @ManyToOne
    @JsonbTransient
    private Project project;

    /**
     * The project ID (serialization sugar)
     */
    @Transient
    private Long projectId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the member ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the member ID
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the user
     */
    public User getUser() {
        return user;
    }

    /**
     * @param user the user
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * get the user id. To be sent to client
     *
     * @return id of the user or null
     */
    public Long getUserId() {
        if (this.user != null) {
            return this.user.getId();
        } else {
            return userId;
        }
    }

    /**
     * set the user id. For serialization only
     *
     * @param id the id of the user
     */
    public void setUserId(Long id) {
        this.userId = id;
    }

    /**
     * @return the project
     */
    public Project getProject() {
        return project;
    }

    /**
     * @param project the project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * get the project id. To be sent to client
     *
     * @return id of the project or null
     */
    public Long getProjectId() {
        if (this.project != null) {
            return this.project.getId();
        } else {
            return projectId;
        }
    }

    /**
     * set the project id. For serialization only
     *
     * @param id the id of the project
     */
    public void setProjectId(Long id) {
        this.projectId = id;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        /* no-op */
    }

    @Override
    public Set<WebsocketChannel> getChannels() {
        if (this.project != null) {
            return this.project.getChannels();
        } else {
            return Set.of();
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
        return "TeamMember{" + "id=" + id + ", userId=" + getUserId() + ", projectId="
                + getProjectId() + "}";
    }
}
