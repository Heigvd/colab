/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.ExternalDocLink;
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
        String title = "The ultimate guide #" + ((int) (Math.random() * 1000));
        String teaser = "Everything you need to know #" + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;

        BlockDocument doc = new BlockDocument();
        doc.setTitle(title);
        doc.setTeaser(teaser);
        doc.setAuthorityHolder(authorityHolder);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(title, persistedDoc.getTitle());
        Assertions.assertEquals(teaser, persistedDoc.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedDoc.getAuthorityHolder());

        Assertions.assertTrue(persistedDoc instanceof BlockDocument);
        BlockDocument persistedBlockDoc = (BlockDocument) persistedDoc;
        Assertions.assertNotNull(persistedBlockDoc);
    }

    @Test
    public void testCreateExternalDocLink() {
        String title = "Co-Design Guidelines #" + ((int) (Math.random() * 1000));
        String teaser = "Basis of the guidelines that will be inserted in the maps of the platform this co-design #"
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.MODEL;
        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Co-Design%20Guidelines.pdf";

        ExternalDocLink doc = new ExternalDocLink();
        doc.setTitle(title);
        doc.setTeaser(teaser);
        doc.setAuthorityHolder(authorityHolder);
        doc.setUrl(url);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(title, persistedDoc.getTitle());
        Assertions.assertEquals(teaser, persistedDoc.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedDoc.getAuthorityHolder());

        Assertions.assertTrue(persistedDoc instanceof ExternalDocLink);
        ExternalDocLink persistedExtDocLink = (ExternalDocLink) persistedDoc;
        Assertions.assertEquals(url, persistedExtDocLink.getUrl());
    }

    @Test
    public void testCreateHostedDocLink() {
        String title = "How to do everything perfectly #" + ((int) (Math.random() * 1000));
        String teaser = "Learn the perfection with the authors' experiments #"
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.MODEL;
        String path = "someWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        HostedDocLink doc = new HostedDocLink();
        doc.setTitle(title);
        doc.setTeaser(teaser);
        doc.setAuthorityHolder(authorityHolder);
        doc.setPath(path);

        Long docId = client.documentRestEndPoint.createDocument(doc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertEquals(docId, persistedDoc.getId());
        Assertions.assertEquals(title, persistedDoc.getTitle());
        Assertions.assertEquals(teaser, persistedDoc.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedDoc.getAuthorityHolder());

        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
        Assertions.assertEquals(path, persistedHostedDocLink.getPath());
    }

    @Test
    public void testUpdateBlockDocument() {
        Long docId = client.documentRestEndPoint.createDocument(new BlockDocument());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof BlockDocument);
        BlockDocument blockDoc = (BlockDocument) doc;
        Assertions.assertEquals(docId, blockDoc.getId());
        Assertions.assertNull(blockDoc.getTitle());
        Assertions.assertNull(blockDoc.getTeaser());
        Assertions.assertNull(blockDoc.getAuthorityHolder());

        String title = "The modern guide #" + ((int) (Math.random() * 1000));
        String teaser = "Some things you need to know #" + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.MODEL;

        blockDoc.setTitle(title);
        blockDoc.setTeaser(teaser);
        blockDoc.setAuthorityHolder(authorityHolder);
        client.documentRestEndPoint.updateDocument(blockDoc);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(persistedDoc);
        Assertions.assertTrue(persistedDoc instanceof BlockDocument);
        BlockDocument persistedBlockDoc = (BlockDocument) persistedDoc;
        Assertions.assertEquals(docId, persistedBlockDoc.getId());
        Assertions.assertEquals(title, persistedBlockDoc.getTitle());
        Assertions.assertEquals(teaser, persistedBlockDoc.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedBlockDoc.getAuthorityHolder());
    }

    @Test
    public void testUpdateExternalDocLink() {
        Long docId = client.documentRestEndPoint.createDocument(new ExternalDocLink());

        Document doc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertNotNull(doc);
        Assertions.assertTrue(doc instanceof ExternalDocLink);
        ExternalDocLink extDocLink = (ExternalDocLink) doc;
        Assertions.assertEquals(docId, extDocLink.getId());
        Assertions.assertNull(extDocLink.getTitle());
        Assertions.assertNull(extDocLink.getTeaser());
        Assertions.assertNull(extDocLink.getAuthorityHolder());
        Assertions.assertNull(extDocLink.getUrl());

        String title = "Serious Games Project Description Model #" + ((int) (Math.random() * 1000));
        String teaser = "This model is a supplement to the direct deliverables of the co.LAB project #"
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;
        String url = "https://www.colab-project.ch/sites/default/files/2021-03/WP1%20-%20Project%20Description%20Model_0.pdf";

        extDocLink.setTitle(title);
        extDocLink.setTeaser(teaser);
        extDocLink.setAuthorityHolder(authorityHolder);
        extDocLink.setUrl(url);
        client.documentRestEndPoint.updateDocument(extDocLink);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof ExternalDocLink);
        ExternalDocLink persistedExtDocLink = (ExternalDocLink) persistedDoc;
        Assertions.assertNotNull(persistedExtDocLink);
        Assertions.assertEquals(docId, persistedExtDocLink.getId());
        Assertions.assertEquals(title, persistedExtDocLink.getTitle());
        Assertions.assertEquals(teaser, persistedExtDocLink.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedExtDocLink.getAuthorityHolder());
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
        Assertions.assertNull(hostedDocLink.getTitle());
        Assertions.assertNull(hostedDocLink.getTeaser());
        Assertions.assertNull(hostedDocLink.getAuthorityHolder());
        Assertions.assertNull(hostedDocLink.getPath());

        String title = "How to do everything just like it should #"
            + ((int) (Math.random() * 1000));
        String teaser = "Learn the strict minimum with the authors' experiments #"
            + ((int) (Math.random() * 1000));
        ConcretizationCategory authorityHolder = ConcretizationCategory.PROJECT;
        String path = "aWayToAccessTheMongoDBData #" + ((int) (Math.random() * 1000));

        hostedDocLink.setTitle(title);
        hostedDocLink.setTeaser(teaser);
        hostedDocLink.setAuthorityHolder(authorityHolder);
        hostedDocLink.setPath(path);
        client.documentRestEndPoint.updateDocument(hostedDocLink);

        Document persistedDoc = client.documentRestEndPoint.getDocument(docId);
        Assertions.assertTrue(persistedDoc instanceof HostedDocLink);
        HostedDocLink persistedHostedDocLink = (HostedDocLink) persistedDoc;
        Assertions.assertNotNull(persistedHostedDocLink);
        Assertions.assertEquals(docId, persistedHostedDocLink.getId());
        Assertions.assertEquals(title, persistedHostedDocLink.getTitle());
        Assertions.assertEquals(teaser, persistedHostedDocLink.getTeaser());
        Assertions.assertEquals(authorityHolder, persistedHostedDocLink.getAuthorityHolder());
        Assertions.assertEquals(path, persistedHostedDocLink.getPath());
    }

    @Test
    public void testGetAllDocuments() {
        int initialSize = client.documentRestEndPoint.getAllDocuments().size();

        BlockDocument bdoc = new BlockDocument();
        bdoc.setTitle("Block doc 1");
        client.documentRestEndPoint.createDocument(bdoc);

        ExternalDocLink edoc = new ExternalDocLink();
        edoc.setTitle("Ext doc 2");
        client.documentRestEndPoint.createDocument(edoc);

        HostedDocLink hdoc = new HostedDocLink();
        hdoc.setTitle("Hosted doc 3");
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
    public void testDeleteExternalDocLink() {
        Long docId = client.documentRestEndPoint.createDocument(new ExternalDocLink());

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
