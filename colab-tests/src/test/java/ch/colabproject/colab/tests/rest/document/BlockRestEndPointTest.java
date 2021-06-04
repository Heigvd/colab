/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests.rest.document;

import ch.colabproject.colab.api.model.document.Block;
import ch.colabproject.colab.api.model.document.BlockDocument;
import ch.colabproject.colab.api.model.document.Document;
import ch.colabproject.colab.api.model.document.TextDataBlock;
import ch.colabproject.colab.tests.tests.AbstractArquillianTest;
import java.util.List;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 * Testing of the block rest end point from a client point of view
 *
 * @author sandra
 */
public class BlockRestEndPointTest extends AbstractArquillianTest {

    @Test
    public void testCreateTextDataBlock() {
        Long documentId = client.documentRestEndPoint.createDocument(new BlockDocument());

        int index = (int) (Math.random() * 100);
        String mimeType = "text/markdown";
        String content = "Here is some texte to explain how it is important to say things "
                + ((int) (Math.random() * 1000));

        TextDataBlock block = new TextDataBlock();
        block.setDocumentId(documentId);
        block.setIndex(index);
        block.setMimeType(mimeType);
        block.setTextData(content);

        Long blockId = client.blockRestEndPoint.createBlock(block);

        Block persistedBlock = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNotNull(persistedBlock);
        Assertions.assertNotNull(persistedBlock.getId());
        Assertions.assertEquals(blockId, persistedBlock.getId());
        Assertions.assertEquals(index, persistedBlock.getIndex());

        Assertions.assertTrue(persistedBlock instanceof TextDataBlock);
        TextDataBlock persistedTextDataBlock = (TextDataBlock) persistedBlock;

        Assertions.assertEquals(mimeType, persistedTextDataBlock.getMimeType());
        Assertions.assertEquals(content, persistedTextDataBlock.getTextData());
    }

    @Test
    public void testCreateNewTextDataBlock() {
        Long documentId = client.documentRestEndPoint.createDocument(new BlockDocument());

        Block block = client.blockRestEndPoint.createNewTextDataBlock(documentId);
        Assertions.assertNotNull(block);
        Long blockId = block.getId();

        Block persistedBlock = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNotNull(persistedBlock);
        Assertions.assertNotNull(persistedBlock.getId());
        Assertions.assertEquals(blockId, persistedBlock.getId());
        Assertions.assertEquals(0, persistedBlock.getIndex());

        Assertions.assertTrue(persistedBlock instanceof TextDataBlock);
        TextDataBlock persistedTextDataBlock = (TextDataBlock) persistedBlock;

        Assertions.assertNull(persistedTextDataBlock.getMimeType());
        Assertions.assertNull(persistedTextDataBlock.getTextData());
    }

    @Test
    public void testUpdateTextDataBlock() {
        Long documentId = client.documentRestEndPoint.createDocument(new BlockDocument());

        TextDataBlock textDataBlock = new TextDataBlock();
        textDataBlock.setDocumentId(documentId);

        Long blockId = client.blockRestEndPoint.createBlock(textDataBlock);

        Block block = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNotNull(block);
        Assertions.assertTrue(block instanceof TextDataBlock);
        textDataBlock = (TextDataBlock) block;
        Assertions.assertEquals(blockId, textDataBlock.getId());
        Assertions.assertEquals(0, textDataBlock.getIndex());
        Assertions.assertNull(textDataBlock.getMimeType());
        Assertions.assertNull(textDataBlock.getTextData());

        int index = (int) (Math.random() * 100);
        String mimeType = "text/plain";
        String content = "Just a placeholder text # " + ((int) (Math.random() * 1000));

        textDataBlock.setIndex(index);
        textDataBlock.setMimeType(mimeType);
        textDataBlock.setTextData(content);
        client.blockRestEndPoint.updateBlock(textDataBlock);

        Block persistedBlock = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNotNull(persistedBlock);
        Assertions.assertEquals(blockId, persistedBlock.getId());
        Assertions.assertEquals(index, persistedBlock.getIndex());

        Assertions.assertTrue(persistedBlock instanceof TextDataBlock);
        TextDataBlock persistedTextDataBlock = (TextDataBlock) persistedBlock;

        Assertions.assertEquals(mimeType, persistedTextDataBlock.getMimeType());
        Assertions.assertEquals(content, persistedTextDataBlock.getTextData());
    }

    @Test
    public void testDeleteTextDataBlock() {
        Long documentId = client.documentRestEndPoint.createDocument(new BlockDocument());

        TextDataBlock block = new TextDataBlock();
        block.setDocumentId(documentId);

        Long blockId = client.blockRestEndPoint.createBlock(block);

        Block persistedBlock = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNotNull(persistedBlock);

        client.blockRestEndPoint.deleteBlock(blockId);

        persistedBlock = client.blockRestEndPoint.getBlock(blockId);
        Assertions.assertNull(persistedBlock);
    }

  @Test
  public void testDocumentAccess() {
      String title = "Random ideas #" + ((int) (Math.random() * 1000));

      BlockDocument doc = new BlockDocument();
      doc.setTitle(title);
      Long documentId = client.documentRestEndPoint.createDocument(doc);

      Document persistedDoc = client.documentRestEndPoint.getDocument(documentId);
      Assertions.assertTrue(persistedDoc instanceof BlockDocument);

      int index = (int) (Math.random() * 100);
      String mimeType = "text/plain";
      String content = "The dinosaurs history is absolutely amazing # "
              + ((int) (Math.random() * 1000));

      TextDataBlock block1 = new TextDataBlock();
      block1.setDocumentId(documentId);
      block1.setIndex(index);
      block1.setMimeType(mimeType);
      block1.setTextData(content);
      Long block1Id = client.blockRestEndPoint.createBlock(block1);

      Block persistedBlock = client.blockRestEndPoint.getBlock(block1Id);
      Assertions.assertNotNull(persistedBlock);
      Assertions.assertEquals(documentId, persistedBlock.getDocumentId());

      Block block2 = client.blockRestEndPoint.createNewTextDataBlock(documentId);
      Assertions.assertNotNull(block2);
      Assertions.assertEquals(documentId, block2.getDocumentId());
      Long block2Id = block2.getId();

      List<Block> blocksOfDocument = client.documentRestEndPoint.getBlocksOfDocument(documentId);
      Assertions.assertNotNull(blocksOfDocument);
      Assertions.assertEquals(2, blocksOfDocument.size());
      Assertions.assertTrue(block1Id.equals(blocksOfDocument.get(0).getId()) || block1Id.equals(blocksOfDocument.get(1).getId()));
      Assertions.assertTrue(block2Id.equals(blocksOfDocument.get(0).getId()) || block2Id.equals(blocksOfDocument.get(1).getId()));
  }
}
