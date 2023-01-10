/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.monitoring;

import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import fish.payara.micro.cdi.Inbound;
import fish.payara.micro.cdi.Outbound;
import java.util.HashMap;
import java.util.Map;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.enterprise.event.Event;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import org.slf4j.LoggerFactory;

/**
 * @author maxence
 */
@Stateless
@LocalBean
public class MonitoringManager {

    /**
     * Cluster event name
     */
    private static final String SET_LOGGER_LEVEL_EVENT = "colab_setLoggerLevel";

    /**
     * Channel to send LoggerLevel events to others instances of the cluster. LoogBakc=true ensure
     * this very instance will receive the event too.
     */
    @Inject
    @Outbound(eventName = SET_LOGGER_LEVEL_EVENT, loopBack = true)
    private Event<LoggerLevelPayload> events;

    /**
     * Change the level of a logger cluster-wide.
     *
     * @param loggerName  name of the logger
     * @param loggerLevel new level of the logger
     */
    public void changeLogerLevelClusterWide(String loggerName, String loggerLevel) {
        LoggerLevelPayload ll = LoggerLevelPayload.build(loggerName, loggerLevel);
        // send event to each instances of the cluster
        this.events.fire(ll);
    }

    /**
     * Change level of a logger within this very payara instance.
     *
     * @param payload logger name and level to set
     */
    public void changeLoggerLevelInternal(
        @Observes @Inbound(eventName = SET_LOGGER_LEVEL_EVENT) LoggerLevelPayload payload
    ) {
        Logger logger = (Logger) LoggerFactory.getLogger(payload.getLoggerName());
        Level newLevel = Level.valueOf(payload.getLoggerLevel());
        if (newLevel != logger.getLevel()) {
            logger.setLevel(Level.valueOf(payload.getLoggerLevel()));
        } else {
            logger.setLevel(null);
        }
    }

    /**
     * Descriptor all known co.LAB logger by providing their current level.
     *
     * @return all known levelDescriptor mapped by the name of the logger
     */
    public Map<String, LevelDescriptor> getLoggerLevels() {
        Map<String, LevelDescriptor> loggers = new HashMap<>();
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();

        loggerContext.getLoggerList().stream()
            .filter(logger -> logger.getName().startsWith("ch.colabproject"))
            .forEach(logger -> {
                loggers.put(logger.getName(),
                    LevelDescriptor.build(logger));
            });

        return loggers;
    }

    /**
     * Get information about current coLAB version
     *
     * @return details about current version
     */
    public VersionDetails getVersionDetails() {
        VersionDetails v = new VersionDetails();
        v.setBuildNumber(ColabConfiguration.getBuildNumber());
        v.setDockerImages(ColabConfiguration.getBuildImages());

        return v;
    }
}
