/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.project;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.model.project.ProjectType;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Project persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ProjectDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ProjectDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a project by id
     *
     * @param id the id of the project to fetch
     *
     * @return the project with the given id or null is such a project does not exist
     */
    public Project findProject(Long id) {
        logger.trace("find project #{}", id);

        return em.find(Project.class, id);
    }

    /**
     * Get the list of all project
     *
     * @return list of all projects
     */
    public List<Project> findAllProject() {
        logger.trace("find all projects");

        TypedQuery<Project> query = em.createNamedQuery("Project.findAll", Project.class);

        return query.getResultList();
    }
    
    /**
     * Get the list of all global project
     * 
     * @return list of all global projects
     */
    public List<Project> findAllGlobalModels() {
        logger.trace("find all global projects");
        
        TypedQuery<Project> query = em.createNamedQuery("Project.findAllGlobal", Project.class);
        
        query.setParameter("model", ProjectType.MODEL);
        
        return query.getResultList();
    }

    /**
     * Get all projects the user is a team member of
     *
     * @param userId the id of the user
     *
     * @return list of projects
     */
    public List<Project> findProjectsByTeamMember(Long userId) {
        logger.trace("find the projects user #{} is team member of", userId);

        TypedQuery<Project> query = em.createNamedQuery("Project.findByTeamMemberUser",
            Project.class);

        query.setParameter("userId", userId);

        return query.getResultList();
    }

    /**
     * Get the ids of the projects the user is a team member of
     *
     * @param userId the id of the user
     *
     * @return list of ids of projects
     */
    public List<Long> findProjectsIdsByTeamMember(Long userId) {
        logger.trace("find the ids of the projects user #{} is team member of", userId);

        TypedQuery<Long> query = em.createNamedQuery("Project.findIdsByTeamMemberUser",
            Long.class);

        query.setParameter("userId", userId);

        return query.getResultList();
    }

    /**
     * Get all projects the user is an instance maker for
     *
     * @param userId the id of the user
     *
     * @return list of projects
     */
    public List<Project> findProjectsByInstanceMaker(Long userId) {
        logger.trace("find the projects user #{} is an instance maker for", userId);

        TypedQuery<Project> query = em.createNamedQuery("Project.findByInstanceMakerUser",
            Project.class);

        query.setParameter("userId", userId);

        return query.getResultList();
    }

    /**
     * Get the ids of the models the user is an instance maker for
     *
     * @param userId the id of the user
     *
     * @return list of ids of models
     */
    public List<Long> findProjectsIdsByInstanceMaker(Long userId) {
        logger.trace("find the ids of the projects user #{} is an instance maker for", userId);

        TypedQuery<Long> query = em.createNamedQuery("Project.findIdsByInstanceMakerUser",
            Long.class);

        query.setParameter("userId", userId);

        return query.getResultList();
    }

    /**
     * Do two users work with a common project ?
     *
     * @param a a user
     * @param b another user
     *
     * @return true if both user are both member or instance maker of the same project
     */
    public boolean findIfUsersHaveCommonProject(User a, User b) {
        logger.trace("find if users {} and {} have comme project", a, b);

        TypedQuery<Boolean> query = em.createNamedQuery(
            "Project.doUsersHaveACommonProject",
            Boolean.class);

        query.setParameter("aUserId", a.getId());
        query.setParameter("bUserId", b.getId());

        return !query.getResultList().isEmpty();
    }

    /**
     * Update project. Only fields which are editable by users will be impacted.
     *
     * @param project the project as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed project
     *
     * @throws ColabMergeException if the update failed
     */
    public Project updateProject(Project project) throws ColabMergeException {
        logger.trace("update project {}", project);

        Project managedProject = this.findProject(project.getId());

        managedProject.mergeToUpdate(project);

        return managedProject;
    }

    /**
     * Persist a brand new project to database
     *
     * @param project the new project to persist
     *
     * @return the new persisted and managed project
     */
    public Project persistProject(Project project) {
        logger.trace("persist project {}", project);

        em.persist(project);

        return project;
    }

    /**
     * Delete the project from database. This can't be undone
     *
     * @param project the project to delete
     */
    public void deleteProject(Project project) {
        logger.trace("delete project {}", project);

        em.remove(project);
    }

}
