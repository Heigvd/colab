/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

/**
 * Some configuration parameters
 *
 * @author maxence
 */
public class ColabConfiguration {

    /**
     * System property name which contains default admin username
     */
    public static final String DEFAULT_ADMIN_USERNAME_PROPERTY = "colab.default.admin.username";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_USERNAME_VALUE = "admin";

    /**
     * System property name which contains default admin email address
     */
    public static final String DEFAULT_ADMIN_EMAIL_PROPERTY = "colab.default.admin.email";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_EMAIL_VALUE = "admin@colab.localhost";

    /**
     * System property name which contains default admin password
     */
    public static final String DEFAULT_ADMIN_PASSWORD_PROPERTY = "colab.default.admin.password";
    /**
     * Value to use if the system property is not set
     */
    public static final String DEFAULT_ADMIN_PASSWORD_VALUE = "admin";

    /**
     * never-called private constructor
     */
    private ColabConfiguration() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    /**
     * Get default admin username.
     *
     * @return default admin username
     */
    public static String getDefaultAdminUsername() {
        return System.getProperty(DEFAULT_ADMIN_USERNAME_PROPERTY, DEFAULT_ADMIN_USERNAME_VALUE);
    }

    /**
     * get the default admin email address
     *
     * @return defautl admin email address
     */
    public static String getDefaultAdminEmail() {
        return System.getProperty(DEFAULT_ADMIN_EMAIL_PROPERTY, DEFAULT_ADMIN_EMAIL_VALUE);
    }

    /**
     * Get the default admin password
     *
     * @return default admin password
     */
    public static String getDefaultAdminPassword() {
        return System.getProperty(DEFAULT_ADMIN_PASSWORD_PROPERTY, DEFAULT_ADMIN_PASSWORD_VALUE);
    }

}
