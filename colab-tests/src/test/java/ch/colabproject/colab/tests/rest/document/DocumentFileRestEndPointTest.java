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
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.AbstractResource;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.HostedDocLink;
import ch.colabproject.colab.api.model.document.Resource;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.ResourceCreationBean;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.plugin.rest.FormField;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import ch.colabproject.colab.tests.tests.TestHelper;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import javax.ws.rs.core.MediaType;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author xaviergood
 */
public class DocumentFileRestEndPointTest extends AbstractArquillianTest{

    @Test
    public void testCreateHostedDocLink() {
        String path = "someWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        HostedDocLink doc = new HostedDocLink();
//        doc.setFilePath(path);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());

        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
//        Assertions.assertEquals(path, persistedHostedDocLink.getFilePath());
    }

    @Test
    public void testUpdateHostedDocLink() {
        Long docId = client.documentRestEndPoint.createDocument(new HostedDocLink());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof HostedDocLink);
        HostedDocLink hostedDocLink = (HostedDocLink) doc;
        Assertions.assertEquals(docId, hostedDocLink.getId());
        Assertions.assertNull(hostedDocLink.getFileName());

        String path = "aWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        hostedDocLink.setFileName(path);
        client.documentRestEndPoint.updateDocument(hostedDocLink);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
        Assertions.assertNotNull(persistedHostedDocLink);
        Assertions.assertEquals(docId, persistedHostedDocLink.getId());
        Assertions.assertEquals(path, persistedHostedDocLink.getFileName());
    }

    /**
     * Create a hosted document, uploaded contents and get it back
     */
    @Test
    public void testCreateHostedDoc(){
//        if(true) return; //TODO remove

        var resource = createHostedDocResource();
        var docId = resource.getDocumentId();

        var fileContent = "Testing is very important, always write tests";
        var size = fileContent.length();
        MediaType mime = MediaType.TEXT_PLAIN_TYPE;
        var file = createFileFormField(fileContent, mime);
        var fileName = file.getData().getName();
        FormField<Long> id = new FormField<>();
        id.setMimeType(MediaType.WILDCARD_TYPE);
        id.setData(docId);

        //save file
        client.documentFileRestEndPoint.updateFile(id, file);

        // fetch document
        var document = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertInstanceOf(HostedDocLink.class, document);
        var fileDocument = (HostedDocLink) document;

        Assertions.assertEquals(fileName, fileDocument.getFileName());
        Assertions.assertEquals(size, fileDocument.getFileSize().intValue());
        Assertions.assertEquals(mime.toString(), fileDocument.getMimeType());

        var response = client.documentFileRestEndPoint.getFileContent(docId);
        var responseContent = response.readEntity(String.class);

        Assertions.assertEquals(mime, response.getMediaType());
        Assertions.assertEquals(fileContent, responseContent);

    }

    /**
     * Tests the state of document that has been created but no file content
     * was added
     */
    @Test
    public void emptyDocTest(){

        var resource = createHostedDocResource();
        var docId = resource.getDocumentId();

        var document = client.documentRestEndPoint.getDocument(docId);
        testEmptyDoc(document);
    }


    /**
     * Tests the state of a deleted document
     */
    @Test
    public void deletionTest(){
        var resource = createHostedDocResource();
        var docId = resource.getDocumentId();

        var fileContent = "Testing is very important, always write tests";
        MediaType mime = MediaType.TEXT_PLAIN_TYPE;
        var file = createFileFormField(fileContent, mime);
        FormField<Long> id = new FormField<>();
        id.setData(docId);

        client.documentFileRestEndPoint.updateFile(id, file);

        client.documentFileRestEndPoint.deleteFile(docId);
        var document = client.documentRestEndPoint.getDocument(docId);

        testEmptyDoc(document);

    }

    private void testEmptyDoc(Document document){

        Assertions.assertInstanceOf(HostedDocLink.class, document);
        var fileDocument = (HostedDocLink) document;

        Assertions.assertNull(fileDocument.getFileName());
        Assertions.assertEquals(0L, fileDocument.getFileSize().longValue());
        Assertions.assertEquals(MediaType.APPLICATION_OCTET_STREAM, fileDocument.getMimeType());

        var response = client.documentFileRestEndPoint.getFileContent(document.getId());
        var responseContent = response.readEntity(String.class);

        Assertions.assertEquals(MediaType.APPLICATION_OCTET_STREAM_TYPE, response.getMediaType());
        Assertions.assertEquals(0, responseContent.length());
//        Assertions.assertThrows(expectedType, () -> func())
//        TestHelper.assertThrows(HttpErrorMessage.MessageCode.NOT_FOUND, executable);
    }

    private static FormField<File> createFileFormField(String content, MediaType mimeType) {

        try{
            var f = File.createTempFile("test_", ".tmp");
            try (java.io.PrintWriter writer = new PrintWriter(f)) {
                writer.print(content);
            }

            FormField<File> field = new FormField<>();
            field.setData(f);
            field.setMimeType(mimeType);
            return field;
        }catch (IOException ex){
            return null;
        }

    }

    /**
     * Creates a random resource linked to a hosted document
     * @return the created resource
     */
    private Resource createHostedDocResource(){

        ResourceCreationBean toCreate = new ResourceCreationBean();
        String title = "The game encyclopedia #" + ((int) (Math.random() * 1000));
        toCreate.setTitle(title);
        var doc = new HostedDocLink();// rename to DocumentFile
        toCreate.setDocument(doc);

        // create project and bind to resource
        Project project = ColabFactory.createProject(client, "testResource");
        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();
        Long globalCardTypeId = ColabFactory.createCardType(client, null).getId();
        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId).getId();
        toCreate.setCardId(cardId);

        var resourceId = client.resourceRestEndpoint.createResource(toCreate);
        return (Resource) client.resourceRestEndpoint.getAbstractResource(resourceId);
    }


}
