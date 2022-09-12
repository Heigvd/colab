/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jcr;

import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.io.InputStream;
import java.io.Serializable;
import javax.jcr.Binary;
import javax.jcr.Credentials;
import javax.jcr.Node;
import javax.jcr.Repository;
import javax.jcr.RepositoryException;
import javax.jcr.Session;
import javax.jcr.SimpleCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author maxence
 */
public class JcrSession implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * logger
     */
    private static final Logger logger = LoggerFactory.getLogger(JcrSession.class);

    /**
     * Default credentials
     */
    private static final Credentials credentials = new SimpleCredentials(
        "admin",
        "admin".toCharArray());

    /**
     * The session itself
     */
    private Session session;

    /**
     * Session workspace
     */
    private final String workspace;

    /**
     * Session workspace path
     */
    private final String workspacePath;

    /**
     * Open a JCR session to the repository
     *
     * @param repository the repository to log in
     * @param project    project
     *
     * @throws javax.jcr.RepositoryException in case of JCR issue
     */
    public JcrSession(Repository repository, Project project) throws RepositoryException {
        logger.trace("Create JCR Session for {}", project);
        // TODO create user if not present in
        // TODO long term :
        this.session = repository.login(credentials);
        this.workspace = "project_" + project.getId();
        this.workspacePath = "/" + this.workspace;

        // make sure root node exists
        if (!session.nodeExists(workspacePath)) {
            session.getNode("/").addNode(workspace);
        }
    }

    /**
     * Get the workspace root node
     *
     * @return workspace root
     */
    public Node getWorkspaceRoot() {
        try {
            return session.getNode(workspacePath);
        } catch (RepositoryException ex) {
            // silient
            logger.warn("getWorkspaceRoot failed with ", ex);
            return null;
        }
    }

    /**
     * Get full relativePath of given relativePath.
     *
     * @param relativePath relativePath path relative to the workspace root. May starts with a / or
     *                     not
     *
     * @return absolute relativePath (i.e. <code>workspacePath</code>/<code>relativePath</code>)
     */
    public String getFullPath(String relativePath) {
        if (relativePath.charAt(0) == '/') {
            return this.workspacePath + relativePath;
        } else {
            return this.workspacePath + '/' + relativePath;
        }
    }

    /**
     * Does a node exist ?
     *
     * @param relativePath relativePath path relative to the workspace root. May starts with a / or
     *                     not
     *
     * @return the node or null if it does not exist
     */
    public boolean nodeExists(String relativePath) {
        try {
            return session.nodeExists(getFullPath(relativePath));
        } catch (RepositoryException ex) {
            // TODO: silent or not ?
            logger.warn("nodeExists({}) failed with ", relativePath, ex);
            return false;
        }
    }

    /**
     * Get a node
     *
     * @param relativePath relativePath relative to the workspace root. May starts with a / or not
     *
     * @return the node or null if it does not exist
     */
    public Node getNode(String relativePath) {
        try {
            return session.getNode(getFullPath(relativePath));
        } catch (RepositoryException ex) {
            // silent
            logger.warn("getNode: node does not exist ", ex);
            return null;
        }
    }

    /**
     * @param relativePath relative path from workspace root
     */
    public void removeNode(String relativePath) {
        try {
            session.removeItem(getFullPath(relativePath));
        } catch (RepositoryException ex) {
            logger.warn("removeNode: node could not be removed", ex);
        }

    }

    /**
     * Get JCR session
     *
     * @return the session
     */
    public Session getSession() {
        return session;
    }

    /**
     * make sure to flush all pending operations
     *
     * @throws javax.jcr.RepositoryException something went wrong
     */
    public void prepareForCommit() throws RepositoryException {
        if (this.session != null && this.session.isLive()) {
            session.getRootNode();
        } else {
            logger.warn(
                "PrepareForCommit failed: session does not exists or has already been closed ");
            // TODO throw something else, but what ?
            throw HttpErrorMessage.dataIntegrityFailure();
        }
    }

    /**
     * creates a new binary object to be stored
     *
     * @param content content to be stored in the binary
     *
     * @return The created binary
     *
     * @throws RepositoryException JCR issue
     */
    public Binary createBinary(InputStream content) throws RepositoryException {
        return this.session.getValueFactory().createBinary(content);
    }

    /**
     * Save and close
     */
    public void saveAndClose() {
        try {
            session.save();
        } catch (RepositoryException ex) {
            logger.error(
                "Error occured while saving changes despite prepareForCommit did not throw anything !",
                ex);
            /* no-op */
        }
        session.logout();
        this.session = null;
    }

    /**
     * Close the session without saving any changes
     */
    public void rollback() {
        logger.trace("Rollback session");
        if (session != null && session.isLive()) {
            session.logout();
        }
        this.session = null;
    }

}
