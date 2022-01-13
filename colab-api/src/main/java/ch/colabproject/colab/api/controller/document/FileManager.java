/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.document;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.DocumentFile;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.jcr.JcrManager;
import ch.colabproject.colab.api.persistence.jpa.document.DocumentDao;
import ch.colabproject.colab.api.persistence.jpa.project.ProjectDao;
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
import java.nio.charset.StandardCharsets;
import javax.ws.rs.core.MediaType;
import org.apache.commons.httpclient.URIException;
import org.apache.commons.httpclient.util.URIUtil;
import org.apache.commons.lang3.tuple.ImmutableTriple;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;

/**
 * Handles DocumentFiles instances both DB and Jcr persistence
 *
 * @author xaviergood
 *
 */
@LocalBean
@Stateless
public class FileManager {

    /**
     * Logger
     */
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
     * Project persistence
     */
    @Inject
    private ProjectDao projectDao;

    /**
     * Update an existing document's file content
     *
     * @param docId    document id
     * @param fileSize size of the file in bytes
     * @param file     file contents
     * @param body     body of the request, containing all meta
     *
     * @throws RepositoryException in case of a JCR issue
     */
    public void updateFile(
        Long docId,
        Long fileSize,
        InputStream file,
        FormDataBodyPart body)
        throws RepositoryException {
        FormDataContentDisposition details = body.getFormDataContentDisposition();

        //charset black magic
        var fileNameBytes = details.getFileName().getBytes(StandardCharsets.ISO_8859_1);
        var fileName = new String(fileNameBytes, StandardCharsets.UTF_8);

        FileManager.logger.debug("Updating file {} with id {}", fileName, docId);

        Document doc = documentDao.findDocument(docId);
        if (!(doc instanceof DocumentFile)) {
            throw HttpErrorMessage.notFound();
        }
        // Check file size limit
        if (fileSize > ColabConfiguration.getJcrRepositoryFileSizeLimit()) {
            FileManager.logger.debug("File exceeds authorized size ({} bytes)"
                + ", size limit is {} bytes",
                fileSize, ColabConfiguration.getJcrRepositoryFileSizeLimit());

            throw HttpErrorMessage.fileSizeLimitExceededError();
        }

        // Check quota limit
        Project project = doc.getProject();
        var usedQuota = getUsage(project.getId());
        if (usedQuota + fileSize > getQuota()) {
            FileManager.logger.debug("Quota exceeded. Used : {}, Authorized : {}",
                usedQuota + fileSize, ColabConfiguration.getJcrRepositoryProjectQuota());

            throw HttpErrorMessage.projectQuotaExceededError();
        }

        DocumentFile hostedDoc = (DocumentFile) doc;
        hostedDoc.setFileName(fileName);
        hostedDoc.setFileSize(fileSize);
        hostedDoc.setMimeType(body.getMediaType().toString());

        this.jcrManager.updateOrCreateFile(project, docId, file);
    }

    /**
     * Delete the file contents, and resets size and mime type
     *
     * @param docId id of document
     *
     * @throws RepositoryException in case of a JCR issue
     */
    public void deleteFile(Long docId) throws RepositoryException {

        Document doc = documentDao.findDocument(docId);
        if (!(doc instanceof DocumentFile)) {
            throw HttpErrorMessage.notFound();
        }

        Project project = doc.getProject();
        DocumentFile hostedDoc = (DocumentFile) doc;
        FileManager.logger.debug("Deleting file '{}' with id {}", hostedDoc.getFileName(), doc.getId());

        hostedDoc.setFileName(null);
        hostedDoc.setFileSize(0L);
        hostedDoc.setMimeType(MediaType.APPLICATION_OCTET_STREAM);

        this.jcrManager.deleteFile(project, docId);

    }

    /**
     * Retrieves the file content. Not used yet
     *
     * @param documentId id of the requested document
     *
     * @return a stream to the file contents
     *
     * @throws RepositoryException in case of a JCR issue
     */
    public InputStream getFileStream(Long documentId) throws RepositoryException {
        var doc = this.documentDao.findDocument(documentId);

        if (!(doc instanceof DocumentFile)) {
            throw HttpErrorMessage.notFound();
        }

        Project project = doc.getProject();

        return new BufferedInputStream(this.jcrManager.getFileStream(project, documentId));
    }

    /**
     * Builds a well formatted response with a stream to the content and correct content headers
     *
     * @param documentId document id
     *
     * @return a triplet containing in order : a stream to the file (empty stream if no file), the
     *         file name in UTF-8 or an empty string if no file has been uploaded, the media type of
     *         the file or MediaType.APPLICATION_OCTET_STREAM if no file present
     *
     * @throws RepositoryException in case of a JCR issue
     */
    public ImmutableTriple<BufferedInputStream, String, MediaType> getDownloadFileInfo(Long documentId) throws RepositoryException {
        var doc = this.documentDao.findDocument(documentId);

        if (!(doc instanceof DocumentFile)) {
            throw HttpErrorMessage.notFound();
        }

        Project project = doc.getProject();
        var hostedDoc = (DocumentFile) doc;

        var stream = new BufferedInputStream(this.jcrManager.getFileStream(project, documentId));

        var fileName = hostedDoc.getFileName();
        String safeFileName = "";
        if (fileName != null) {
            try {
                safeFileName = URIUtil.encodePath(fileName);
            } catch (URIException ex) {
                logger.warn("Issue with filename '{}' with id {}", hostedDoc.getFileName(), doc.getId());
                safeFileName = fileName;// best effort
            }
        }

        MediaType mediaType = MediaType.valueOf(hostedDoc.getMimeType());

        return new ImmutableTriple<>(stream, safeFileName, mediaType);
    }

    /**
     * Gets projects quota
     *
     * @return the quota of disk space usage for files per project in bytes
     */
    public static Long getQuota() {
        return ColabConfiguration.getJcrRepositoryProjectQuota();
    }

    /**
     * Computes the current disk space usage of a given project
     *
     * @param projectId project id
     *
     * @return used space in bytes
     *
     * @throws RepositoryException in case of a JCR issue
     */
    public Long getUsage(Long projectId) throws RepositoryException {
        Project project = projectDao.getProject(projectId);
        return jcrManager.computeMemoryUsage(project);
    }
}
