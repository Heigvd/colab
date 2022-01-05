/**
 *
 */
package ch.colabproject.colab.api.controller.document;

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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;

/**
 * Handles DocumentFiles instances
 * @author xaviergood
 *
 */
@LocalBean
@Stateless
public class FileManager {

    private static final Logger logger = LoggerFactory.getLogger(FileManager.class);

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

        //charset black magic
        var fileNameBytes = details.getFileName().getBytes(StandardCharsets.ISO_8859_1);
        var fileName = new String(fileNameBytes, StandardCharsets.UTF_8);

        FileManager.logger.info("Updating file {} with id {}", fileName, docId);

        Document doc = documentDao.findDocument(docId);
        if(doc == null || !(doc instanceof HostedDocLink))
        {
            throw HttpErrorMessage.notFound();
        }

        var fileSize = details.getSize();
        if(fileSize > ColabConfiguration.getJcrRepositoryFileSizeLimit()){
            FileManager.logger.debug("File exceeds authorized size ({} bytes)"
                + ", size limit is {} bytes"
                , fileSize, ColabConfiguration.getJcrRepositoryFileSizeLimit());

            throw HttpErrorMessage.internalServerError();
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
     * Retrieves the file content. Not used yet
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
     * Builds a well formatted response with a stream to the content and correct content headers
     * @param documentId
     * @return a response builder
     * @throws RepositoryException
     */
    public ResponseBuilder getDownloadResponse(Long documentId) throws RepositoryException{
        var doc = this.documentDao.findDocument(documentId);

        if(doc == null || doc.getClass() != HostedDocLink.class)
        {
            throw HttpErrorMessage.notFound();
        }

        Project project = doc.getProject();
        var hostedDoc = (HostedDocLink)doc;
        var mediaType = MediaType.valueOf(hostedDoc.getMimeType());

        var stream = new BufferedInputStream(this.jcrManager.getFileStream(project, documentId));
        ResponseBuilder res = Response.ok(stream, mediaType);
        var safeFilename = URLEncoder.encode(hostedDoc.getFileName(), StandardCharsets.UTF_8);

        // set file name for browser download prompt
        var attachment = "attachment; filename=" + safeFilename;
        res.header("Content-Disposition", attachment);

        logger.info("Generated response for file : {}, mime {}", hostedDoc.getFileName(), hostedDoc.getMimeType());

        return res;
    }
}
