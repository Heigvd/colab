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
import java.io.InputStream;
import java.math.BigDecimal;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.jcr.Binary;
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import org.apache.jackrabbit.commons.JcrUtils;

/**
 * Manages the persistence of files with JackRabbit Oak
 *
 * @author xaviergood
 */
@Stateless
public class JcrManager {

    @Inject 
    private JcrSessionManager jcrSessionManager;
    
    private static final String CONTENT = "CONTENT";
    
    /**
     * @param project related project
     * @param identifier document id
     * @return stream to the file
     * @throws javax.jcr.RepositoryException
     */
    public InputStream getFileStream(Project project, Long identifier) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);
        
        var node = session.getNode(identifier.toString());
        var prop = node.getProperty(CONTENT);
        //TODO figure out when to call dispose
        return prop.getBinary().getStream();
    }

    /**
     * @param project project related to file
     * @param identifier document id
     * @param fileContent file content
     * @throws RepositoryException 
     */
    public void updateOrCreateFile(Project project, Long identifier, InputStream fileContent) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);
        
        if(!session.nodeExists(identifier.toString())){
            createFile(project, identifier, fileContent);
        }else{
            var node = session.getNode(identifier.toString());
            var prop = node.getProperty(CONTENT);
            Binary binary = session.getSession().getValueFactory().createBinary(fileContent);
            prop.setValue(binary);
        }
    }
    
    /**
     * Creates a node for the given file id, and store its content
     * @param project related project
     * @param identifier document id 
     * @param content file content
     * @throws RepositoryException 
     */
    private void createFile(Project project, Long identifier, InputStream content) throws RepositoryException{
        var session = this.jcrSessionManager.getSession(project);
        
        Node root = session.getWorkspaceRoot();
        Node newNode = root.addNode(identifier.toString());
        
        var prop = newNode.setProperty(CONTENT, identifier.toString());
        Binary binary = session.createBinary(content);
        prop.setValue(binary);
    }

    /**
     * Deletes any existing node. Call is ignored if the file doesn't exist
     * @param project related project
     * @param identifier doc id
     * @throws RepositoryException 
     */
    public void deleteFile(Project project, Long identifier) throws RepositoryException {
        var session = this.jcrSessionManager.getSession(project);
        if(session.nodeExists(identifier.toString())){
            session.removeNode(identifier.toString());
        }
        
    }
}
