/*
 * The MIT License
 *
 * Copyright 2021 AlbaSim, MEI, HEIG-VD, HES-SO.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
package ch.colabproject.colab.api.persistence.jcr;

import ch.colabproject.colab.api.model.project.Project;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import javax.jcr.Binary;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manages the persistence of files with JackRabbit Oak
 *
 * @author xaviergood
 */
@Stateless
public class JcrManager {

    /**
     * Session manager
     */
    @Inject
    private JcrSessionManager jcrSessionManager;

    /**
     * Key of node property containing file contents
     */
    private static final String CONTENT = "COLAB_CONTENT";

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(JcrManager.class);

    /**
     * @param project    related project
     * @param identifier document id
     *
     * @return True if the node exists
     *
     * @throws RepositoryException in case of JCR problem
     */
    public boolean nodeExists(Project project, Long identifier) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);

        return session.nodeExists(identifier.toString());
    }

    /**
     * @param project    related project
     * @param identifier document id
     *
     * @return stream to the file
     *
     * @throws javax.jcr.RepositoryException in case of JCR problem
     */
    public InputStream getFileStream(Project project, Long identifier) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);

        var node = session.getNode(identifier.toString());
        if (node == null) {
            return new ByteArrayInputStream(new byte[0]);
        }

        var prop = node.getProperty(CONTENT);

        // TODO figure out when to call dispose
        return prop.getBinary().getStream();
    }

    /**
     * @param project     project related to file
     * @param identifier  document id
     * @param fileContent file content
     *
     * @throws RepositoryException in case of JCR problem
     */
    public void updateOrCreateFile(Project project, Long identifier, InputStream fileContent)
        throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);

        if (!session.nodeExists(identifier.toString())) {
            createFile(project, identifier, fileContent);
        } else {
            var node = session.getNode(identifier.toString());
            Binary binary = session.createBinary(fileContent);
            node.setProperty(CONTENT, binary);
        }
    }

    /**
     * Creates a node for the given file id, and store its content
     *
     * @param project    related project
     * @param identifier document id
     * @param content    file content
     *
     * @throws RepositoryException in case of JCR problem
     */
    private void createFile(Project project, Long identifier, InputStream content)
        throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);

        Node root = session.getWorkspaceRoot();
        Node newNode = root.addNode(identifier.toString());

        Binary binary = session.createBinary(content);
        newNode.setProperty(CONTENT, binary);
    }

    /**
     * Deletes any existing node. Call is ignored if the file doesn't exist
     *
     * @param project    related project
     * @param identifier doc id
     *
     * @throws RepositoryException in case of JCR problem
     */
    public void deleteFile(Project project, Long identifier) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);
        if (session.nodeExists(identifier.toString())) {
            session.removeNode(identifier.toString());
        }

    }

    /**
     * Computes the disk space used by a project
     *
     * @param project related project
     *
     * @return used memory in bytes
     *
     * @throws RepositoryException in case of JCR problem
     */
    public Long computeMemoryUsage(Project project) throws RepositoryException {

        var session = this.jcrSessionManager.getSession(project);

        var node = session.getWorkspaceRoot();
        if (node == null) {
            return 0L;
        }

        Long total = 0L;

        try {
            var iterator = node.getNodes();
            while (iterator.hasNext()) {
                Node next = iterator.nextNode();
                total += next.getProperty(CONTENT).getLength();// getSize()?
            }

        } catch (RepositoryException re) {
            logger.warn("Could not compute memory usage of project {} id {}. "
                + "Exception : {}",
                project.getName(), project.getId(), re.getMessage());
        }
        return total;
    }
}
