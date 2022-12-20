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

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.DocumentFile;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.rest.document.bean.ResourceCreationData;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.colabproject.colab.generator.plugin.rest.FormField;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import jakarta.ws.rs.core.MediaType;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author xaviergood
 */
public class DocumentFileRestEndPointTest extends AbstractArquillianTest {

    private final static String TEST_CONTENT = "Testing is very important, always write tests";

    /**
     * Test DB creation of DocumentFile
     */
    @Test
    public void testCreateDocumentFile() {
        String fileName = "random file #" + ((int) (Math.random() * 1000));

        DocumentFile doc = new DocumentFile();
        doc.setFileName(fileName);

        Long docId = ColabFactory.createADocument(client, doc).getId();

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(1000, persistedDoc.getIndex());

        Assertions.assertTrue(persistedDoc instanceof DocumentFile);
        DocumentFile persistedDocumentFile = (DocumentFile) persistedDoc;
        Assertions.assertEquals(fileName, persistedDocumentFile.getFileName());
    }

    /**
     * Test DB update of document file
     */
    @Test
    public void testUpdateDocumentFile() {
        Long docId = ColabFactory.createADocument(client, new DocumentFile()).getId();

        Document doc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof DocumentFile);
        DocumentFile documentFile = (DocumentFile) doc;
        Assertions.assertEquals(docId, documentFile.getId());
        Assertions.assertNull(documentFile.getFileName());
        Assertions.assertEquals(1000, documentFile.getIndex());

        String fileName = "random file #" + ((int) (Math.random() * 1000));

        documentFile.setFileName(fileName);
        client.documentRestEndpoint.updateDocument(documentFile);

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof DocumentFile);
        DocumentFile persistedDocumentFile = (DocumentFile) persistedDoc;
        Assertions.assertNotNull(persistedDocumentFile);
        Assertions.assertEquals(docId, persistedDocumentFile.getId());
        Assertions.assertEquals(fileName, persistedDocumentFile.getFileName());
        Assertions.assertEquals(1000, persistedDocumentFile.getIndex());
    }

    /**
     * Create a hosted document, upload content and get it back
     */
    @Test
    public void testUpdateDocumentFileData() {
        var resource = createHostedDocResource();
        var docId = resource.left.getId();

        MediaType mime = MediaType.TEXT_PLAIN_TYPE;
        var fileName = this.updateFileDoc(docId, mime, TEST_CONTENT);
        // fetch document
        var document = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertInstanceOf(DocumentFile.class, document);
        var fileDocument = (DocumentFile) document;

        Assertions.assertEquals(fileName, fileDocument.getFileName());
        Assertions.assertEquals(TEST_CONTENT.length(), fileDocument.getFileSize().intValue());
        Assertions.assertEquals(mime.toString(), fileDocument.getMimeType());

        var response = client.documentFileRestEndPoint.getFileContent(docId);
        var responseContent = response.readEntity(String.class);

        Assertions.assertEquals(mime, response.getMediaType());
        Assertions.assertEquals(TEST_CONTENT, responseContent);

    }

    /**
     * Tests the state of document that has been created but no file content was added
     */
    @Test
    public void testEmptyDoc() {
        var docId = createHostedDocResource().left.getId();

        var document = client.documentRestEndpoint.getDocument(docId);
        DocumentFileRestEndPointTest.this.testEmptyDoc(document);
    }

    /**
     * Tests the state of a deleted document
     */
    @Test
    public void testDeletion() {
        var resource = createHostedDocResource();
        var docId = resource.left.getId();

        this.updateFileDoc(docId, MediaType.TEXT_PLAIN_TYPE, TEST_CONTENT);

        client.documentFileRestEndPoint.deleteFile(docId);
        var document = client.documentRestEndpoint.getDocument(docId);

        DocumentFileRestEndPointTest.this.testEmptyDoc(document);

    }

    /**
     * Test quota values and usage values
     */
    @Test
    public void testQuotaUsage() {

        var resourceAndProjId = createHostedDocResource();
        var document = resourceAndProjId.left;
        Long projId = resourceAndProjId.right;
        var docId = document.getId();

        // empty project
        List<Long> usageQuota = client.documentFileRestEndPoint.getQuotaUsage(projId);
        var usage = usageQuota.get(0);
        var quota = usageQuota.get(1);
        Assertions.assertEquals(0L, usage.longValue());
        Assertions.assertEquals(ColabConfiguration.getJcrRepositoryProjectQuota(), quota);

        // upload one file
        this.updateFileDoc(docId, MediaType.TEXT_PLAIN_TYPE, TEST_CONTENT);

        usage = client.documentFileRestEndPoint.getQuotaUsage(projId).get(0);
        Assertions.assertEquals(TEST_CONTENT.length(), usage.longValue());

        // delete file
        client.documentFileRestEndPoint.deleteFile(docId);
        usage = client.documentFileRestEndPoint.getQuotaUsage(projId).get(0);
        Assertions.assertEquals(0L, usage.longValue());

    }

    ////// HELPER METHODS //////////////////////
    private void testEmptyDoc(Document document) {

        Assertions.assertInstanceOf(DocumentFile.class, document);
        var fileDocument = (DocumentFile) document;

        Assertions.assertNull(fileDocument.getFileName());
        Assertions.assertEquals(0L, fileDocument.getFileSize().longValue());
        Assertions.assertEquals(MediaType.APPLICATION_OCTET_STREAM, fileDocument.getMimeType());

        var response = client.documentFileRestEndPoint.getFileContent(document.getId());
        var responseContent = response.readEntity(String.class);

        Assertions.assertEquals(MediaType.APPLICATION_OCTET_STREAM_TYPE, response.getMediaType());
        Assertions.assertEquals(0, responseContent.length());
    }

    private static FormField<File> createFileFormField(String content, MediaType mimeType) {

        try {
            var f = File.createTempFile("test_", ".tmp");
            try ( java.io.PrintWriter writer = new PrintWriter(f)) {
                writer.print(content);
            }

            FormField<File> field = new FormField<>();
            field.setData(f);
            field.setMimeType(mimeType);
            return field;
        } catch (IOException ex) {
            return null;
        }

    }

    /**
     * Creates a random resource linked to a hosted document
     *
     * @return the created resource
     */
    private ImmutablePair<Document, Long> createHostedDocResource() {

        ResourceCreationData toCreate = new ResourceCreationData();
        String title = "The game encyclopedia #" + ((int) (Math.random() * 1000));
        toCreate.setTitle(title);
        var doc = new DocumentFile();// rename to DocumentFile
        toCreate.setDocuments(List.of(doc));

        // create project and bind to resource
        Project project = ColabFactory.createProject(client, "testResource");
        Long rootCardContentId = ColabFactory.getRootContent(client, project).getId();
        Long globalCardTypeId = ColabFactory.createCardType(client, project).getId();
        Long cardId = ColabFactory.createNewCard(client, rootCardContentId, globalCardTypeId).getId();
        toCreate.setCardId(cardId);

        var resourceId = client.resourceRestEndpoint.createResource(toCreate);
        var docs = client.resourceRestEndpoint.getDocumentsOfResource(resourceId);
        var d = docs.get(0);
        return new ImmutablePair<>(d, project.getId());

    }

    private static FormField<Long> createFormField(Long value) {
        var field = new FormField<Long>();
        field.setMimeType(MediaType.WILDCARD_TYPE);
        field.setData(value);
        return field;
    }

    private String updateFileDoc(Long docId, MediaType mime, String content) {
        long size = content.length();
        var file = createFileFormField(content, mime);
        var fileName = file.getData().getName();
        FormField<Long> docIdF = createFormField(docId);
        var sizeF = createFormField(size);

        //save file
        client.documentFileRestEndPoint.updateFile(docIdF, sizeF, file);
        return fileName;
    }

}
