/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;

/**
 * A project as persisted in database
 *
 * @author maxence
 */
@Entity
@NamedQuery(name = "Project.findAll", query = "SELECT p from Project p")
@NamedQuery(name = "Project.findProjectByUser", query = "SELECT p from Project p JOIN p.teamMembers members WHERE  members.user.id = :userId")
public class Project implements ColabEntity {

    private static final long serialVersionUID = 1L;

    /**
     * Project ID.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Project name
     */
    private String name;

    /**
     * List of team members.
     */
    @OneToMany(mappedBy = "project", cascade = {CascadeType.ALL})
    private List<TeamMember> teamMembers = new ArrayList<>();

    /**
     * @return the project ID
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
     * get team members
     *
     * @return members
     */
    public List<TeamMember> getTeamMembers() {
        return teamMembers;
    }

    /**
     * Set team members
     *
     * @param teamMembers list of members
     */
    public void setTeamMembers(List<TeamMember> teamMembers) {
        this.teamMembers = teamMembers;
    }

    /**
     *
     * @return the project name
     */
    public String getName() {
        return name;
    }

    /**
     * Set the project name
     *
     * @param name new project name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Project) {
            Project o = (Project) other;
            this.setName(o.getName());
        } else {
            throw new ColabMergeException(this, other);
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
        return "Project{" + "id=" + id + ", name=" + name + '}';
    }
}
