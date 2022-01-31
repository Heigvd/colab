/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalLink;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import ch.colabproject.colab.tests.tests.ColabFactory;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the document rest end point from a client point of view
 *
 * @author sandra
 */
public class DocumentRestEndpointTest extends AbstractArquillianTest {

    @Test
    public void testCreateTextDataBlock() {
        int index = 3;
        String mimeType = "text/plain";
        String textData = "a valuable plain text";
        String revision = "0.23.5";

        TextDataBlock doc = new TextDataBlock();
        doc.setIndex(index);
        doc.setMimeType(mimeType);
        doc.setTextData(textData);
        doc.setRevision(revision);

        Long docId = ColabFactory.createADocument(client, doc).getId();

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(index, persistedDoc.getIndex());

        Assertions.assertTrue(persistedDoc instanceof TextDataBlock);
        TextDataBlock persistedTextDataBlock = (TextDataBlock) persistedDoc;
        Assertions.assertEquals(mimeType, persistedTextDataBlock.getMimeType());
        Assertions.assertEquals(textData, persistedTextDataBlock.getTextData());
        Assertions.assertEquals(revision, persistedTextDataBlock.getRevision());
    }

    @Test
    public void testCreateExternalLink() {
        int index = 7;
        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Co-Design%20Guidelines.pdf";

        ExternalLink doc = new ExternalLink();
        doc.setUrl(url);
        doc.setIndex(index);

        Long docId = ColabFactory.createADocument(client, doc).getId();

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(index, persistedDoc.getIndex());

        Assertions.assertTrue(persistedDoc instanceof ExternalLink);
        ExternalLink persistedExtDocLink = (ExternalLink) persistedDoc;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
    }

    @Test
    public void testUpdateTextDataBlock() {
        Long docId = ColabFactory.createADocument(client, new TextDataBlock()).getId();

        Document doc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof TextDataBlock);
        TextDataBlock textDataBlock = (TextDataBlock) doc;
        Assertions.assertEquals(docId, textDataBlock.getId());
        Assertions.assertEquals(0, textDataBlock.getIndex());

        int index = 4;
        String mimeType = "text/plain";
        String textData = "a plain text";

        textDataBlock.setIndex(index);
        textDataBlock.setMimeType(mimeType);
        textDataBlock.setTextData(textData);
        client.documentRestEndpoint.updateDocument(textDataBlock);

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(index, persistedDoc.getIndex());
        Assertions.assertTrue(persistedDoc instanceof TextDataBlock);
        TextDataBlock persistedTextDataBlock = (TextDataBlock) persistedDoc;
        Assertions.assertEquals(docId, persistedTextDataBlock.getId());
        Assertions.assertEquals(index, persistedTextDataBlock.getIndex());
        Assertions.assertEquals(mimeType, persistedTextDataBlock.getMimeType());
        Assertions.assertEquals(textData, persistedTextDataBlock.getTextData());
    }

    @Test
    public void testUpdateExternalLink() {
        Long docId = ColabFactory.createADocument(client, new ExternalLink()).getId();

        Document doc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof ExternalLink);
        ExternalLink extDocLink = (ExternalLink) doc;
        Assertions.assertEquals(docId, extDocLink.getId());
        Assertions.assertNull(extDocLink.getUrl());
        Assertions.assertEquals(0, extDocLink.getIndex());

        int index = 8;
        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Project%20Description%20Model_0.pdf";

        extDocLink.setIndex(index);
        extDocLink.setUrl(url);
        client.documentRestEndpoint.updateDocument(extDocLink);

        Document persistedDoc = client.documentRestEndpoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof ExternalLink);
        ExternalLink persistedExtDocLink = (ExternalLink) persistedDoc;
        Assertions.assertNotNull(persistedExtDocLink);
        Assertions.assertEquals(docId, persistedExtDocLink.getId());
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
        Assertions.assertEquals(index, persistedExtDocLink.getIndex());
    }

}
