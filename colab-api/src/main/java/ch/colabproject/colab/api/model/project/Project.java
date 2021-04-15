/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.card.Card;
import ch.colabproject.colab.api.model.card.CardDef;
import ch.colabproject.colab.api.model.team.TeamMember;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

/**
 * A project as persisted in database
 *
 * @author maxence
 * @author sandra
 */
@Entity
@NamedQuery(name = "Project.findAll", query = "SELECT p from Project p")
@NamedQuery(name = "Project.findProjectByUser", query = "SELECT p from Project p JOIN p.teamMembers members WHERE members.user.id = :userId")
public class Project implements ColabEntity {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

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
     * Description
     */
    private String description;

    /**
     * Concretization type : is it a concrete project or an abstract model
     */
    @Enumerated(value = EnumType.STRING)
    private ConcretizationCategory concretizationCategory;

    /**
     * List of team members
     */
    @OneToMany(mappedBy = "project", cascade = { CascadeType.ALL })
    private List<TeamMember> teamMembers = new ArrayList<>();

    /**
     * List of elements to be defined within the cards
     */
    @OneToMany(mappedBy = "project", cascade = { CascadeType.ALL })
    private List<CardDef> elementsToDefine = new ArrayList<>();

    /**
     * Root card of the project containing all other cards
     */
    @OneToOne(cascade = { CascadeType.ALL }) // , optional=false)
    private Card rootCard;

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
     * @return the description
     */
    public String getDescription() {
        return description;
    }

    /**
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * @return concretization type : is it a concrete project or an abstract model
     */
    public ConcretizationCategory getConcretizationCategory() {
        return concretizationCategory;
    }

    /**
     * @param category new concretization type : is it a concrete project or an abstract model
     */
    public void setConcretizationCategory(ConcretizationCategory category) {
        this.concretizationCategory = category;
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
     * @return the elementsToDefine
     */
    public List<CardDef> getElementsToDefine() {
        return elementsToDefine;
    }

    /**
     * @param elementsToDefine the elementsToDefine to set
     */
    public void setElementsToDefine(List<CardDef> elementsToDefine) {
        this.elementsToDefine = elementsToDefine;
    }

    /**
     * @return root card of the project that contains every other cards
     */
    public Card getRootCard() {
        return rootCard;
    }

    /**
     * @param rootCard Root card of the project that contains every other cards
     */
    public void setRootCard(Card rootCard) {
        this.rootCard = rootCard;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    /**
     * {@inheritDoc }
     */
    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Project) {
            Project o = (Project) other;
            this.setName(o.getName());
            this.setDescription(o.getDescription());
            // TODO see if concretizationCategory should be there
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
        return "Project{" + "id=" + id + ", name=" + name + ", descr=" + description + ", category="
                + concretizationCategory + '}';
    }
}
