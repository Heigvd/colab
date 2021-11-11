/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.HostedDocLink;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the document rest end point from a client point of view
 *
 * @author sandra
 */
public class DocumentRestEndPointTest extends AbstractArquillianTest {

    @Test
    public void testCreateBlockDocument() {
        BlockDocument doc = new BlockDocument();

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());

        Assertions.assertTrue(persistedDoc instanceof BlockDocument);
        BlockDocument persistedBlockDoc = (BlockDocument) persistedDoc;
        Assertions.assertNotNull(persistedBlockDoc);
    }

    @Test
    public void testCreateExternalLink() {
        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Co-Design%20Guidelines.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());

        Assertions.assertTrue(persistedDoc instanceof ExternalLink);
        ExternalLink persistedExtDocLink = (ExternalLink) persistedDoc;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
    }

    @Test
    public void testCreateHostedDocLink() {
        String path = "someWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        HostedDocLink doc = new HostedDocLink();
        doc.setFilePath(path);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());

        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
        Assertions.assertEquals(path, persistedHostedDocLink.getFilePath());
    }

    @Test
    public void testUpdateBlockDocument() {
        Long docId = client.documentRestEndPoint.createDocument(new BlockDocument());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof BlockDocument);
        BlockDocument blockDoc = (BlockDocument) doc;
        Assertions.assertEquals(docId, blockDoc.getId());

        // find any field to update when there will be one (if it happens once)

        client.documentRestEndPoint.updateDocument(blockDoc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertTrue(persistedDoc instanceof BlockDocument);
        BlockDocument persistedBlockDoc = (BlockDocument) persistedDoc;
        Assertions.assertEquals(docId, persistedBlockDoc.getId());
    }

    @Test
    public void testUpdateExternalLink() {
        Long docId = client.documentRestEndPoint.createDocument(new ExternalLink());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof ExternalLink);
        ExternalLink extDocLink = (ExternalLink) doc;
        Assertions.assertEquals(docId, extDocLink.getId());
        Assertions.assertNull(extDocLink.getUrl());

        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Project%20Description%20Model_0.pdf";

        extDocLink.setUrl(url);
        client.documentRestEndPoint.updateDocument(extDocLink);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof ExternalLink);
        ExternalLink persistedExtDocLink = (ExternalLink) persistedDoc;
        Assertions.assertNotNull(persistedExtDocLink);
        Assertions.assertEquals(docId, persistedExtDocLink.getId());
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
    }

    @Test
    public void testUpdateHostedDocLink() {
        Long docId = client.documentRestEndPoint.createDocument(new HostedDocLink());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof HostedDocLink);
        HostedDocLink hostedDocLink = (HostedDocLink) doc;
        Assertions.assertEquals(docId, hostedDocLink.getId());
        Assertions.assertNull(hostedDocLink.getFilePath());

        String path = "aWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        hostedDocLink.setFilePath(path);
        client.documentRestEndPoint.updateDocument(hostedDocLink);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
        Assertions.assertNotNull(persistedHostedDocLink);
        Assertions.assertEquals(docId, persistedHostedDocLink.getId());
        Assertions.assertEquals(path, persistedHostedDocLink.getFilePath());
    }

    @Test
    public void testGetAllDocuments() {
        int initialSize = client.documentRestEndPoint.getAllDocuments().size();

        BlockDocument bdoc = new BlockDocument();
        client.documentRestEndPoint.createDocument(bdoc);

        ExternalLink edoc = new ExternalLink();
        client.documentRestEndPoint.createDocument(edoc);

        HostedDocLink hdoc = new HostedDocLink();
        client.documentRestEndPoint.createDocument(hdoc);

        List<Document> documents = client.documentRestEndPoint.getAllDocuments();
        Assertions.assertEquals(initialSize + 3, documents.size());
    }

    @Test
    public void testDeleteBlockDocument() {
        Long docId = client.documentRestEndPoint.createDocument(new BlockDocument());

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);

        client.documentRestEndPoint.deleteDocument(docId);

        persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNull(persistedDoc);
    }

    @Test
    public void testDeleteExternalLink() {
        Long docId = client.documentRestEndPoint.createDocument(new ExternalLink());

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);

        client.documentRestEndPoint.deleteDocument(docId);

        persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNull(persistedDoc);
    }

    @Test
    public void testDeleteHostedDocLink() {
        Long docId = client.documentRestEndPoint.createDocument(new HostedDocLink());

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);

        client.documentRestEndPoint.deleteDocument(docId);

        persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNull(persistedDoc);
    }

}
