/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.persistence.jcr;

import ch.colabproject.colab.api.setup.ColabConfiguration;
import java.net.URI;
import java.net.URISyntaxException;
import jakarta.annotation.PreDestroy;
import jakarta.ejb.Lock;
import jakarta.ejb.LockType;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import javax.jcr.Repository;
import org.apache.jackrabbit.oak.Oak;
import org.apache.jackrabbit.oak.jcr.Jcr;
//import org.apache.jackrabbit.oak.segment.file.FileStore;
import org.apache.jackrabbit.oak.plugins.document.LeaseCheckMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.jackrabbit.oak.plugins.document.DocumentNodeStore;
import static org.apache.jackrabbit.oak.plugins.document.mongo.MongoDocumentNodeStoreBuilder.newMongoDocumentNodeStoreBuilder;

/**
 * Access to the JCR repository
 *
 * @author maxence
 */
@Singleton
@Startup
public class JcrRepository {

    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(JcrRepository.class);

    /** The JCR repository */
    private Repository repository;

    /** File store */
//    private static FileStore fileStore;
    
    private static DocumentNodeStore nodeStore;

    /**
     * Initialize the repository
     */
    @Lock(LockType.WRITE)
    public void init() {
        if (repository == null) {
            logger.trace("Init JCR Repository");

            var mongoUri = ColabConfiguration.getJcrMongoDbUri();
            if(mongoUri == null || mongoUri.isBlank()){
                repository = new Jcr(new Oak()).createRepository();
                logger.debug("Using in memory JCR repository");
            }else{
                try {
                    final URI uri = new URI(mongoUri);

                    if (uri.getScheme().equals("mongodb")) {
                        logger.info("Setting up JCR Oak MongoDB based repository");
                        String hostPort = uri.getHost();
                        if (uri.getPort() > -1) {
                            hostPort += ":" + uri.getPort();
                        }
                        String dbName = uri.getPath().replaceFirst("/", "");

                        nodeStore = newMongoDocumentNodeStoreBuilder()
                            .setLeaseCheckMode(LeaseCheckMode.DISABLED)
                            .setMongoDB("mongodb://" + hostPort + "/?readConcernLevel=majority", dbName, 0)
                            .build();

                        repository = new Jcr(new Oak(nodeStore)).createRepository();
                        logger.info("JCR repository initialized");

                    }
                } catch (URISyntaxException e) {
                    logger.error("Could not init JCR : {}", e.getMessage());
                }
            }
//            if (inMemoryStorage) {
                // in-memory is a very stupid backend
//            } else {
//                // TODO: use a real backend...
//                // stupid filesystem backend
//                String path = "/tmp/oak";
//                try {
//                    fileStore = FileStoreBuilder.fileStoreBuilder(new File(path)).build();
//
//                    final SegmentNodeStore segmentNodeStore = SegmentNodeStoreBuilders.builder(fileStore).build();
//                    this.repository = new Jcr(new Oak(segmentNodeStore)).createRepository();
//                } catch (InvalidFileStoreVersionException | IOException ex) {
//                    logger.error("Failed to read repository {}", path, ex);
//               }
//          }
        }
    }

    /**
     * Get the JCR repository
     *
     * @return The repository
     */
    @Lock(LockType.READ)
    public Repository getRepository() {
        if (repository == null) {
            init();
        }
        return repository;
    }

    /**
     * Gracefully close repository on shutdown
     */
    @PreDestroy
    public void preDestroy() {
        logger.trace("Close JCR Repository");
        
        if (nodeStore != null) {
            nodeStore.dispose();
            nodeStore = null;
        }
//        if (fileStore != null) {
//            fileStore.close();
//            fileStore = null;
//        }

        repository = null;
    }
}
