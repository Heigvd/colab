/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ejb;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;

/**
 * Project related logic
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ProjectFacade {

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
    public List<Project> getAllProject() {
        TypedQuery<Project> query = em.createNamedQuery("Project.findAll", Project.class);
        return query.getResultList();
    }

    /**
     *
     * @param id id of the project to fetch
     *
     * @return the project with the given id or null is such a project does not exists
     */
    public Project getProject(Long id) {
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
        Project mProject = this.getProject(project.getId());

        mProject.merge(project);

        return mProject;
    }

    /**
     * Persist a brand new project to database
     *
     * @param project new project to persist
     *
     * @return the new persisted project
     */
    public Project createProject(Project project) {
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
        Project project = this.getProject(id);
        em.remove(project);
        return project;
    }
}
