/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.config;

import ch.colabproject.colab.api.rest.config.bean.ColabConfig;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;

/**
 * Give access to configuration variables
 *
 * @author maxence
 */
@Stateless
@LocalBean
public class ConfigurationManager {

    /**
     * Get account-related configuration.
     *
     * @return account-related configuration
     */
    public ColabConfig getConfig() {
        ColabConfig config = new ColabConfig();
        config
            .setDisplayCreateLocalAccountButton(ColabConfiguration.getDisplayLocalAccountButton());
        config.setYjsApiEndpoint(ColabConfiguration.getYjsUrlWs());
        config.setJcrRepositoryFileSizeLimit(ColabConfiguration.getJcrRepositoryFileSizeLimit());
        config.setNbDaysToWaitBeforeBinCleaning(ColabConfiguration.getNbDaysToWaitBeforeBinCleaning());
        return config;
    }

}
