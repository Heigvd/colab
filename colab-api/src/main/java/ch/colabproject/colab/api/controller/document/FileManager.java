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
import ch.colabproject.colab.api.setup.ColabConfiguration;
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
import javax.ws.rs.core.MediaType;
import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;


/**
 * Handles DocumentFiles instances
 * @author xaviergood
 * 
 */
@LocalBean
@Stateless
public class FileManager {

    private static final Logger logger = LoggerFactory.getLogger(ProjectFacade.class);

    /**
     * File persistence management
     */
    @Inject
    private JcrManager jcrManager;
    
    /**
     * Document persistence
     */
    @Inject
    private DocumentDao documentDao;
    
    /**
     * Update an existing document's file content
     * @param docId document id
     * @param file file contents
     * @param body body of the request, containing all meta
     * @throws RepositoryException 
     */
    public void updateFile(
            Long docId, 
            InputStream file, 
            FormDataBodyPart body) 
            throws RepositoryException
    {
        FormDataContentDisposition details = body.getFormDataContentDisposition();
        var fileName = details.getFileName();
        FileManager.logger.debug("Updating file {} with id {}", fileName, docId);

        var fileSize = details.getSize();
        if(fileSize > ColabConfiguration.getJcrRepositoryFileSizeLimit()){
            FileManager.logger.debug("File exceeds authorized size ({} bytes)"
                + ", size limit is {} bytes"
                , fileSize, ColabConfiguration.getJcrRepositoryFileSizeLimit());

            throw HttpErrorMessage.internalServerError();
        }
        
        Document doc = documentDao.findDocument(docId);
        if(doc == null || !(doc instanceof HostedDocLink))
        {
            throw HttpErrorMessage.notFound();
        }

        HostedDocLink hostedDoc = (HostedDocLink)doc;
        hostedDoc.setFileName(fileName);
        hostedDoc.setFileSize(fileSize);
        hostedDoc.setMimeType(body.getMediaType().toString());

        Project project = doc.getProject();
        this.jcrManager.updateOrCreateFile(project, docId, file);
    }
    
    /**
     * Delete the file contents, and resets size and mime type
     * @param docId id of hosted document
     * @throws RepositoryException 
     */
    public void deleteFile(Long docId) throws RepositoryException{
    
        Document doc = documentDao.findDocument(docId);
        if(doc == null || !(doc instanceof HostedDocLink))
        {
            throw HttpErrorMessage.notFound();
        }
        
        Project project = doc.getProject();
        HostedDocLink hostedDoc = (HostedDocLink)doc;
        FileManager.logger.debug("Deleting file '{}' with id {}", hostedDoc.getFileName(), doc.getId());

        hostedDoc.setFileName(null);
        hostedDoc.setFileSize(0L);
        hostedDoc.setMimeType(MediaType.APPLICATION_OCTET_STREAM);
        
        this.jcrManager.deleteFile(project, docId);
        
    }
    
    /**
     * Retrieves the file content
     * @param documentId id of the requested document
     * @return a stream to the file contents
     * @throws RepositoryException 
     */
    public InputStream getFileStream(Long documentId) throws RepositoryException {
        var doc = this.documentDao.findDocument(documentId);

        if(doc == null || doc.getClass() != HostedDocLink.class)
        {
            throw HttpErrorMessage.notFound();
        }
        
        Project project = doc.getProject();

        return new BufferedInputStream(this.jcrManager.getFileStream(project, documentId));
    }
    
    /**
     * 
     * @param documentId id of the requested document
     * @return the mime type of the file
     */
    public String getFileMimeType(Long documentId){
        var doc = this.documentDao.findDocument(documentId);

        if(doc == null || doc.getClass() != HostedDocLink.class)
        {
            throw HttpErrorMessage.notFound();
        }
        var hostedDoc = (HostedDocLink)doc;
        var mediaType = hostedDoc.getMimeType();
        return StringUtils.isEmpty(mediaType) ? MediaType.APPLICATION_OCTET_STREAM : mediaType;
    }
}
