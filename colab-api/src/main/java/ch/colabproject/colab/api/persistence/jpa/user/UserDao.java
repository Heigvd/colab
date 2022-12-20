/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.user;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.user.User;
import java.util.List;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * User persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class UserDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(UserDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find a user by id
     *
     * @param id the id of the user to fetch
     *
     * @return the user with the given id or null if such a user does not exist
     */
    public User findUser(Long id) {
        logger.trace("find user #{}", id);

        return em.find(User.class, id);
    }

    /**
     * Find all users
     *
     * @return list of all users
     */
    public List<User> findAllUsers() {
        logger.trace("find all users");

        TypedQuery<User> query = em.createNamedQuery("User.findAll", User.class);

        return query.getResultList();
    }

    /**
     * Retrieve the list of all admin user from database
     *
     * @return list of all administrator
     */
    public List<User> findAllAdmin() {
        logger.trace("find all admin users");

        TypedQuery<User> query = em.createNamedQuery("User.findAllAdmin", User.class);

        return query.getResultList();
    }

    /**
     * Find a user by username
     *
     * @param username needle
     *
     * @return the user which matching username or null if it not exist
     */
    public User findUserByUsername(String username) {
        logger.trace("find user with username {}", username);
        try {
            TypedQuery<User> query = em.createNamedQuery("User.findByUsername", User.class);

            query.setParameter("username", username);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    /**
     * Update user. Only fields which are editable by users will be impacted.
     *
     * @param user the user as supplied by clients (ie not managed by JPA)
     *
     * @return return updated managed user
     *
     * @throws ColabMergeException if the update failed
     */
    public User updateUser(User user) throws ColabMergeException {
        logger.trace("update user {}", user);

        User managedUser = this.findUser(user.getId());

        managedUser.merge(user);

        return managedUser;
    }

    /**
     * Persist a brand new user to database
     *
     * @param user the new user to persist
     *
     * @return the new persisted and managed user
     */
    public User persistUser(User user) {
        logger.trace("persist user {}", user);

        em.persist(user);

        return user;
    }

}
