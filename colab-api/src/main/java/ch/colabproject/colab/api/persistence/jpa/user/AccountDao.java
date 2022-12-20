/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jpa.user;

import ch.colabproject.colab.api.model.user.Account;
import ch.colabproject.colab.api.model.user.LocalAccount;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Account persistence
 * <p>
 * Note : Most of database operations are handled by managed entities and cascade.
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class AccountDao {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(AccountDao.class);

    /**
     * Access to the persistence unit
     */
    @PersistenceContext(unitName = "COLAB_PU")
    private EntityManager em;

    /**
     * Find an account by id
     *
     * @param id the id of the account to fetch
     *
     * @return the account with the given id or null if such an account does not exist
     */
    public Account findAccount(Long id) {
        logger.trace("find account #{}", id);

        return em.find(Account.class, id);
    }

    /**
     * Return the local account which matches the given email address
     *
     * @param email email address to search
     *
     * @return the matching LocalAccount or null
     */
    public LocalAccount findLocalAccountByEmail(String email) {
        try {
            TypedQuery<LocalAccount> query = em.createNamedQuery("LocalAccount.findByEmail",
                LocalAccount.class);

            query.setParameter("email", email);

            return query.getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

}
