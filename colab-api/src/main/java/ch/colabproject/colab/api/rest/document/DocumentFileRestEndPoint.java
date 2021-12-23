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
import java.io.InputStream;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
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
     *
     * @param id      project id
     * @param file    the file bytes
     * @param details file meta data
     *
     * @return some random data
     */
    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public String postFile(
        @FormDataParam("id") Long id,
        @FormDataParam("file") InputStream file,
        @FormDataParam("file") FormDataContentDisposition details) {
        
        try{
            logger.debug("post file in project #{} file name", id, details.getFileName());
            fileManager.createFile(id, file, details);
        }catch(Exception ex){
            return "Failure";// TODO : reason
        }
        
        //TODO return new identifier ?
        return "Success";//TODO
    }
    
        /**
     *
     * @param projectId      project id
     * @param docId   document id
     * @param file    the file bytes
     * @param details file meta data
     *
     * @return some random data
     */
    @PUT
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    public String updateFile(
        @FormDataParam("projectId") Long projectId,
        @FormDataParam("documentId") Long docId,
        @FormDataParam("file") InputStream file,
        @FormDataParam("file") FormDataContentDisposition details) {
        
        try{
            logger.debug("post file in project #{} file name", projectId, details.getFileName());
            fileManager.updateFile(projectId, docId, file, details);
        }catch(Exception ex){
            return "Failure";// TODO : reason
        }
        
        //TODO return new identifier ?
        return "Success";//TODO
    }
    
    
    @DELETE
    @Path("{projectId}/GetFile/{documentId}/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    public String deleteFile(
        @PathParam("projectId") Long projectId,
        @PathParam("documentId") Long documentId,
        @PathParam("name") String name) {
        
        try {
            fileManager.deleteFile(projectId, documentId);
            return "Success";// TODO
        } catch (Exception ex) {
            logger.debug("Could not delete file {}", ex);
            return "Failure"; // TODO 
        }
    }
    
    /**
     * Get file content
     *
     * @param projectId project id
     * @param documentId document id
     * @param name name of the file
     *
     * @return file content
     */
    @GET
    @Path("{projectId}/GetFile/{documentId}/{name}")
    @Produces(MediaType.TEXT_PLAIN)
    // TODO see in Wegas how it is done
    public InputStream getFileContent(
        @PathParam("projectId") Long projectId,
        @PathParam("documentId") Long documentId,
        @PathParam("name") String name) {
        
        try {
            return fileManager.getFile(projectId, documentId);
        } catch (Exception ex) {
            logger.debug("Could not get file content {}", ex);
            return null;
        }
    }
    
}
