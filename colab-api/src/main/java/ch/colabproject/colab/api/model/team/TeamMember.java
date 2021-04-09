/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.team;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.user.User;
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
@NamedQuery(
    name = "TeamMember.areUserTeammate",
    query = "SELECT true FROM TeamMember a "
    + "JOIN TeamMember b ON a.project_id = b.project_id "
    + "WHERE a.id = :aId AND b.id = :bId"
)
public class TeamMember implements ColabEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Member ID.
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
     * serialization sugar
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
     * serialization sugar
     */
    @Transient
    private Long projectId;

    /**
     * @return the ID
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * Set id
     *
     * @param id id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Get the user
     *
     * @return the user
     */
    public User getUser() {
        return user;
    }

    /**
     * set the user
     *
     * @param user user
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
     * For serialization only
     *
     * @param id if of the user
     */
    public void setUserId(Long id) {
        this.userId = id;
    }

    /**
     * get project
     *
     * @return the project
     */
    public Project getProject() {
        return project;
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
     * For serialization only
     *
     * @param id if of the project
     */
    public void setProjectId(Long id) {
        this.projectId = id;
    }

    /**
     * set project
     *
     * @param project the project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        /* no-op */
    }
}
