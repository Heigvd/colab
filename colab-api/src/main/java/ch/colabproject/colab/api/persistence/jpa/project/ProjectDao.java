/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

/**
 * Project persistence
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ProjectDao {

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Get the list of all project
     *
     * @return list of all projects
     */
    public List<Project> findAllProject() {
        TypedQuery<Project> query = em.createNamedQuery("Project.findAll", Project.class);
        return query.getResultList();
    }

    /**
     * Get all projects the user is member of
     *
     * @param userId the id of the user
     *
     * @return list of project
     */
    public List<Project> findProjectsUserIsMemberOf(Long userId) {
        TypedQuery<Project> query = em.createNamedQuery("Project.findByTeamMemberUser",
            Project.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    /**
     * Get the ids of the projects the user is member of
     *
     * @param userId the id of the user
     *
     * @return list of ids of projects
     */
    public List<Long> findIdsOfProjectUserIsMemberOf(Long userId) {
        TypedQuery<Long> query = em.createNamedQuery("Project.findIdsByTeamMemberUser",
            Long.class);
        query.setParameter("userId", userId);
        return query.getResultList();
    }

    /**
     * @param id id of the project to fetch
     *
     * @return the project with the given id or null is such a project does not exists
     */
    public Project findProject(Long id) {
        return em.find(Project.class, id);
    }

    /**
     * Update project
     *
     * @param project project as supply by clients (ie not managed)
     *
     * @return return updated managed project
     *
     * @throws ColabMergeException if updating the project failed
     */
    public Project updateProject(Project project) throws ColabMergeException {
        Project managedProject = this.findProject(project.getId());

        managedProject.merge(project);

        return managedProject;
    }

    /**
     * Persist a brand new project to database
     *
     * @param project new project to persist
     *
     * @return the new persisted project
     */
    public Project persistProject(Project project) {
        em.persist(project);
        return project;
    }

    /**
     * Delete project from database. This can't be undone
     *
     * @param id id of the project to delete
     *
     * @return just deleted project
     */
    public Project deleteProject(Long id) {
        // TODO: move to recycle bin first
        Project project = this.findProject(id);
        em.remove(project);
        return project;
    }
}
