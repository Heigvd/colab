/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.config;

import ch.colabproject.colab.api.rest.config.bean.AccountConfig;
import ch.colabproject.colab.api.setup.ColabConfiguration;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;

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
    public AccountConfig getAccountConfig() {
        AccountConfig accountConfig = new AccountConfig();
        accountConfig.setDisplayCreateLocalAccountButton(ColabConfiguration.getDisplayLocalAccountButton());

        return accountConfig;
    }

}
