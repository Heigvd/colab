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
package ch.colabproject.colab.api.rest.document;

import ch.colabproject.colab.api.controller.document.FileManager;
import ch.colabproject.colab.generator.model.annotations.AuthenticationRequired;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.io.BufferedInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import javax.inject.Inject;
import javax.jcr.PathNotFoundException;
import javax.jcr.RepositoryException;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.apache.commons.lang3.tuple.ImmutableTriple;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * EndPoint to managed hosted files
 *
 * @author xaviergood
 */
@Path("files")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class DocumentFileRestEndPoint {

    /**
     * Logger
     */
    private static final Logger logger = LoggerFactory.getLogger(DocumentFileRestEndPoint.class);

    /**
     * File manager
     */
    @Inject
    private FileManager fileManager;

    /**
     * Overwrites existing file if any
     *
     * @param docId    document id
     * @param fileSize the file size in bytes
     * @param file     the file bytes
     * @param bodypart file meta data
     */
    @PUT
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public void updateFile(
        @FormDataParam("documentId") Long docId,
        @FormDataParam("fileSize") Long fileSize,
        @FormDataParam("file") InputStream file,
        @FormDataParam("file") FormDataBodyPart bodypart
    ) {
        try {
            fileManager.updateOrCreateFile(docId, fileSize, file, bodypart);
        } catch (RepositoryException ex) {
            logger.debug("Could not update file with id {} : {}", docId, ex);
            throw HttpErrorMessage.internalServerError();
        }
    }

    /**
     * Deletes the file associated with the document Does nothing if no file was present
     *
     * @param documentId document id
     */
    @DELETE
    @Path("DeleteFile/{documentId}")
    public void deleteFile(
        @PathParam("documentId") Long documentId) {
        try {
            fileManager.deleteFile(documentId);
        } catch (RepositoryException ex) {
            logger.debug("Could not delete file with id {} : {}", documentId, ex);
            throw HttpErrorMessage.internalServerError();
        }
    }

    /**
     * Get the file's content and meta data
     *
     * @param documentId document id
     *
     * @return file content, if no file has been set, return an empty stream (0 bytes)
     */
    @GET
    @Path("GetFile/{documentId}")
    public Response getFileContent(@PathParam("documentId") Long documentId) {

        try {
            ImmutableTriple<BufferedInputStream, String, MediaType> filedata;
            filedata = fileManager.getDownloadFileInfo(documentId);

            var stream = filedata.left;
            var filename = filedata.middle;
            var mime = filedata.right;

            Response.ResponseBuilder response = Response.ok(stream, mime);

            // set file name for browser download prompt
            var attachment = "attachment; filename=" + filename;
            response.header("Content-Disposition", attachment);

            logger.debug("Generated response for file : {}, mime {}", filename, mime);

            return response.build();

        } catch (PathNotFoundException pnfe) {
            throw HttpErrorMessage.dataIntegrityFailure();
        } catch (RepositoryException ex) {
            logger.debug("Could not get file content {}", ex);
            throw HttpErrorMessage.internalServerError();
        }
    }

    /**
     * Retrieves a project's disk space file usage and the maximum authorized quota
     *
     * @param projectId project id
     *
     * @return a list of 2 elements, first is usage second is maximum quota expressed in bytes
     */
    @GET
    @Path("GetProjectQuotaUsage/{projectId}")
    public List<Long> getQuotaUsage(@PathParam("projectId") Long projectId) {

        try {
            var result = new ArrayList<Long>();
            result.add(fileManager.getUsage(projectId));
            result.add(FileManager.getQuota());
            return result;
        } catch (RepositoryException re) {
            logger.debug("Could not get project quota usage {}", re);
            throw HttpErrorMessage.internalServerError();
        }
    }

}
