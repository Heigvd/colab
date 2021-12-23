/**
 * 
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.ejb.ProjectFacade;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.HostedDocLink;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.jcr.JcrManager;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
import java.io.InputStream;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.jcr.RepositoryException;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Handles files
 * @author xaviergood
 * 
 */
@LocalBean
@Stateless
public class FileManager {

    private static final Logger logger = LoggerFactory.getLogger(ProjectFacade.class);

    /**
     * to get session to workspace
     */
    @Inject
    private JcrManager jcrManager;
    
        /**
     * Project persistence
     */
    @Inject
    private ProjectDao projectDao;
    
    
    /**
     * Document persistence
     */
    @Inject
    private DocumentDao documentDao;
    
    
    public void createFile(Long projectId, InputStream file, FormDataContentDisposition details) throws RepositoryException{
        
        Project project = projectDao.getProject(projectId);
        String name = details.getFileName();
        Long size = details.getSize();
        
        HostedDocLink newDoc = new HostedDocLink();
        documentDao.persistDocument(newDoc);
        
        //TODO fileId
        Long fileId = 123L;
        this.jcrManager.createFile(project, fileId, file);
    }
    
    public void updateFile(Long projectId, Long docId, InputStream file, FormDataContentDisposition details) throws RepositoryException{
        
        Project project = projectDao.getProject(projectId);
        Document doc = documentDao.findDocument(docId);
        //TODO fileId instead
        Long fileId = 123L;

        this.jcrManager.updateFile(project, docId, file);
    }
    
    public void deleteFile(Long projectId, Long documentId) throws RepositoryException{
    
        this.documentDao.deleteDocument(documentId);
        var p = this.projectDao.getProject(projectId);
        //TODO fileId instead

        this.jcrManager.deleteFile(p, documentId);
    }
    
    public InputStream getFile(Long projectId, Long documentId) throws Exception{
        var doc = this.documentDao.findDocument(documentId);
        //TODO fileId instead

        if(doc == null){
            throw new Exception("Document with id " + documentId + " does not exist");
        }else if(doc.getClass() != HostedDocLink.class){
            throw new Exception("Document is not a hosted file");
        }
        Project project = projectDao.getProject(projectId);

        return this.jcrManager.getFileStream(project, documentId);
    }
}
