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
import java.io.InputStream;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.inject.Inject;
import javax.jcr.RepositoryException;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.io.BufferedInputStream;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;


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
     * Document persistence
     */
    @Inject
    private DocumentDao documentDao;
    
//    @Inject
//    private ResourceAndRefDao resourceDao;
    
    public void updateFile(
            Long docId, 
            InputStream file, 
            FormDataContentDisposition details,
            FormDataBodyPart body) 
            throws RepositoryException
    {
        
        Document doc = documentDao.findDocument(docId);
        if(doc == null || !(doc instanceof HostedDocLink))
        {
            throw HttpErrorMessage.notFound();
        }
        
        HostedDocLink hostedDoc = (HostedDocLink)doc;
        hostedDoc.setFileName(details.getFileName());
        hostedDoc.setFileSize(details.getSize());
        hostedDoc.setMimeType(body.getMediaType().toString());

        Project project = doc.getProject();
        this.jcrManager.updateOrCreateFile(project, docId, file);
        FileManager.logger.debug("Updated file {} with id {}", hostedDoc.getFileName(), hostedDoc.getId());
    }
    
    public void deleteFile(Long docId) throws RepositoryException{
    
        Document doc = documentDao.findDocument(docId);
        if(doc == null || !(doc instanceof HostedDocLink))
        {
            throw HttpErrorMessage.notFound();
        }
        
        Project project = doc.getProject();
        HostedDocLink hostedDoc = (HostedDocLink)doc;

        this.documentDao.deleteDocument(docId);

        this.jcrManager.deleteFile(project, docId);
        
        FileManager.logger.debug("Deleted file '{}' with id {}", hostedDoc.getFileName(), doc.getId());
    }
    
    public InputStream getFileStream(Long documentId) throws RepositoryException {
        var doc = this.documentDao.findDocument(documentId);

        if(doc == null || doc.getClass() != HostedDocLink.class)
        {
            throw HttpErrorMessage.notFound();
        }
        
        Project project = doc.getProject();

        return new BufferedInputStream(this.jcrManager.getFileStream(project, documentId));
    }
    
    public String getFileMimeType(Long documentId){
        var doc = this.documentDao.findDocument(documentId);

        if(doc == null || doc.getClass() != HostedDocLink.class)
        {
            throw HttpErrorMessage.notFound();
        }
        var hostedDoc = (HostedDocLink)doc;
        return hostedDoc.getMimeType();
    }
}
