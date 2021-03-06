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
     * smtp domain property name
     */
    public static final String SMTP_DOMAIN = "colab.smtp.domain";

    /**
     * smtp domain default value
     */
    public static final String SMTP_DOMAIN_DEFAULT_VALUE = "colab.localhost";

    /**
     * smtp host property name
     */
    public static final String SMTP_HOST = "colab.smtp.host";

    /**
     * smtp host default value
     */
    public static final String SMTP_HOST_DEFAULT_VALUE = "localhost";

    /**
     * smtp port property name
     */
    public static final String SMTP_PORT = "colab.smtp.port";

    /**
     * smtp port default value
     */
    public static final String SMTP_PORT_DEFAULT_VALUE = "25";

    /**
     * smtp auth property name
     */
    public static final String SMTP_AUTH = "colab.smtp.auth";

    /**
     * smtp auth default value
     */
    public static final String SMTP_AUTH_DEFAULT_VALUE = "false";

    /**
     * smtp username property name
     */
    public static final String SMTP_USERNAME = "colab.smtp.username";

    /**
     * smtp username default value
     */
    public static final String SMTP_USERNAME_DEFAULT_VALUE = "postmaster";

    /**
     * smtp password property name
     */
    public static final String SMTP_PASSWORD = "colab.smtp.password";

    /**
     * smtp password default value
     */
    public static final String SMTP_PASSWORD_DEFAULT_VALUE = "";

    /**
     * smtp starttls property name
     */
    public static final String SMTP_STARTTLS = "colab.smtp.starttls";

    /**
     * smtp starttls default value
     */
    public static final String SMTP_STARTTLS_DEFAULT_VALUE = "false";

    /**
     * never-called private constructor
     */
    private ColabConfiguration() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
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
     * @return default admin email address
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

    /**
     * domain name
     *
     * @return the domain name
     */
    public static String getSmtpDomain() {
        return System.getProperty(SMTP_DOMAIN, SMTP_DOMAIN_DEFAULT_VALUE);
    }

    /**
     * Does the SMTP server requires authentication ?
     *
     * @return "true" or "false"
     */
    public static String getSmtpAuth() {
        return System.getProperty(SMTP_AUTH, SMTP_AUTH_DEFAULT_VALUE);
    }

    /**
     * @return SMTP username
     */
    public static String getSmtpUsername() {
        return System.getProperty(SMTP_USERNAME, SMTP_USERNAME_DEFAULT_VALUE);
    }

    /**
     * @return SMTP password
     */
    public static String getSmtpPassword() {
        return System.getProperty(SMTP_PASSWORD, SMTP_PASSWORD_DEFAULT_VALUE);
    }

    /**
     * @return SMTP host
     */
    public static String getSmtpHost() {
        return System.getProperty(SMTP_HOST, SMTP_HOST_DEFAULT_VALUE);
    }

    /**
     * @return SMPT port
     */
    public static String getSmtpPort() {
        return System.getProperty(SMTP_PORT, SMTP_PORT_DEFAULT_VALUE);
    }

    /**
     * Should start TLS or not?
     *
     * @return "true" or "false"
     */
    public static String getSmtpStartTls() {
        return System.getProperty(SMTP_STARTTLS, SMTP_STARTTLS_DEFAULT_VALUE);
    }
}
