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
import java.io.InputStream;
import javax.inject.Inject;
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
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 *
 * @author xaviergood
 */

@Path("files")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@AuthenticationRequired
public class DocumentFileRestEndPoint {
    
    private static final Logger logger = LoggerFactory.getLogger(DocumentRestEndPoint.class);

    @Inject
    private FileManager fileManager;

    /**
     * @param docId   document id
     * @param file    the file bytes
     * @param details file meta data
     * @param bodypart file meta data (for mime type)
     */
    @PUT
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public void updateFile(
        @FormDataParam("documentId") Long docId,
        @FormDataParam("file") InputStream file,
        @FormDataParam("file") FormDataContentDisposition details,
        @FormDataParam("file") FormDataBodyPart bodypart //TODO does that work ?
        ) {
        
        try{
            fileManager.updateFile(docId, file, details, bodypart);
        }catch(RepositoryException ex){
            logger.debug("Could not update file with id {} : {}", docId, ex);
            throw HttpErrorMessage.internalServerError();
        }
    }
    
    @DELETE
    @Path("{projectId}/DeleteFile/{documentId}/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    public void deleteFile(
        @PathParam("documentId") Long documentId,
        @PathParam("name") String name) {
        try {
            fileManager.deleteFile(documentId);
        } catch (RepositoryException ex) {
            logger.debug("Could not delete file with id {} : {}", documentId, ex);
        }
    }
    
    /**
     * Get file content
     *
     * @param documentId document id
     * @param name name of the file
     *
     * @return file content
     */
    @GET
    @Path("GetFile/{documentId}/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response getFileContent(
        @PathParam("documentId") Long documentId,
        @PathParam("name") String name) {
        
        try {
            
            var response = Response.ok(fileManager.getFileStream(documentId));
            response.header("Content-Type", fileManager.getFileMimeType(documentId));
            //response.header("Description", fileDescriptor.getDescription());
            
            return response.build();
        } catch (RepositoryException ex) {
            logger.debug("Could not get file content {}", ex);
            return null;
        }
    }
    
}
