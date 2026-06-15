/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.setup;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Some configuration parameters
 *
 * @author maxence
 */
public class ColabConfiguration {

    /**
     * Build number property name
     */
    public static final String BUILD_NUMBER_PROPERTY = "colab.build.number";

    /**
     * Default build number
     */
    public static final String DEFAULT_BUILD_NUMBER_VALUE = "";

    /**
     * Build number property name
     */
    public static final String BUILD_IMAGES_PROPERTY = "colab.build.images";

    /**
     * Default build number
     */
    public static final String DEFAULT_BUILD_IMAGES_VALUE = "";

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
     * Display "create an account" button or not
     */
    public static final String LOCAL_ACCOUNT_BUTTON = "colab.localaccount.showcreatebutton";

    /**
     * Display "create an account" button or not default value
     */
    public static final String LOCAL_ACCOUNT_BUTTON_VALUE = "true";

    /**
     * Date when the terms of use and data policy was last changed in yyyy-MM-dd format
     */
    public static final String TERMS_OF_USE_DATE = "colab.termsofuse.date";

    /**
     * Default date when the terms of use and data policy was last changed in EpochTime (2023-11-24T00:00:00)
     * milliseconds
     */
    public static final Long TERMS_OF_USE_DATE_DEFAULT_IN_MS = 1700780400000L;

    /**
     * Number of days to wait before the elements in bin are removed from bin and flagged as to be
     * permanently deleted.
     */
    public static final String NB_DAYS_BEFORE_BIN_CLEANING = "colab.deletion.binToDelete.nbDaysWaiting";

    /**
     * Default nb of days to wait before the elements in bin are removed from bin and flagged as to
     * be permanently deleted.
     */
    public static final String NB_DAYS_BEFORE_BIN_CLEANING_DEFAULT = "30";

    /**
     * Number of days to wait before permanent deletion.
     */
    public static final String NB_DAYS_BEFORE_FOREVER_DELETION = "colab.deletion.deleteForever.nbDaysWaiting";

    /**
     * Default nb of days to wait before permanent deletion.
     */
    public static final String NB_DAYS_BEFORE_FOREVER_DELETION_DEFAULT = "12";

    /**
     * Maximum file upload size
     */
    public static final String JCR_REPOSITORY_MAX_FILE_SIZE_MB = "colab.jcr.maxfile.size.mo";

    /**
     * Maximum file upload size default value
     */
    public static final String JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT = "50";

    /**
     * Maximum file upload size
     */
    public static final String JCR_REPOSITORY_PROJECT_QUOTA_MB = "colab.jcr.project.quota.mo";

    /**
     * Maximum file upload size default value
     */
    public static final String JCR_REPOSITORY_PROJECT_QUOTA_MB_DEFAULT = "2048";

    /**
     * Mongo DB access for JCR file storage. Empty string means non-persistent, i.e.
     * stored in
     * memory during run
     */
    public static final String JCR_MONGO_DB_URI = "colab.jcr.mongodb.uri";

    /**
     * Default Mongo DB access for JCR file storage.
     */
    public static final String JCR_MONGO_DB_URI_DEFAULT = "";

    /**
     * Public YJS URL with websocket protocol
     */
    public static final String YJS_URL_WS = "colab.yjs.url";

    /**
     * Default YJS URL with websocket protocol
     */
    public static final String YJS_URL_WS_DEFAULT = "";

    /**
     * YJS internal url
     */
    public static final String YJS_INTERNAL_URL = "colab.yjs.internalurl";

    /**
     * Default YJS intername url
     */
    public static final String YJS_INTERNAL_URL_DEFAULT = "";

    /**
     * never-called private constructor
     */
    private ColabConfiguration() {
        throw new UnsupportedOperationException(
                "This is a utility class and cannot be instantiated");
    }

    /**
     * Get build number
     *
     * @return build number
     */
    public static String getBuildNumber() {
        return System.getProperty(BUILD_NUMBER_PROPERTY, DEFAULT_BUILD_NUMBER_VALUE);
    }

    /**
     * Get name of the running docker image
     *
     * @return the running docker images or empty if running app is not a docker
     * container
     */
    public static String getBuildImages() {
        return System.getProperty(BUILD_IMAGES_PROPERTY, DEFAULT_BUILD_IMAGES_VALUE);
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
    public static boolean getSmtpStartTls() {
        return System.getProperty(SMTP_STARTTLS,
                SMTP_STARTTLS_DEFAULT_VALUE).equals("true");
    }

    /**
     * Show create an account or not?
     *
     * @return show create an account button or not?
     */
    public static boolean getDisplayLocalAccountButton() {
        return System.getProperty(LOCAL_ACCOUNT_BUTTON,
                LOCAL_ACCOUNT_BUTTON_VALUE).equals("true");
    }

    /**
     * @return The current terms of use and data policy date in Epochtime milliseconds
     */
    public static Long getTermsOfUseDate() {
        String value = System.getProperty(TERMS_OF_USE_DATE);

        if (value == null) {
            return TERMS_OF_USE_DATE_DEFAULT_IN_MS;
        }

        try {
            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            formatter.setLenient(false);
            Date date = formatter.parse(value);
            return date.getTime();
        } catch (ParseException pe) {
            return TERMS_OF_USE_DATE_DEFAULT_IN_MS;
        }
    }

    /**
     * @return The number of days to wait before the elements in bin are removed from bin and
     * flagged as to be permanently deleted
     */
    public static int getNbDaysToWaitBeforeBinCleaning() {
        var value = System.getProperty(NB_DAYS_BEFORE_BIN_CLEANING, NB_DAYS_BEFORE_BIN_CLEANING_DEFAULT);
        return tryParseIntPositive(value, NB_DAYS_BEFORE_BIN_CLEANING_DEFAULT);
    }

    /**
     * @return The number of days to wait before permanent deletion
     */
    public static int getNbDaysToWaitBeforePermanentDeletion() {
        var value = System.getProperty(NB_DAYS_BEFORE_FOREVER_DELETION, NB_DAYS_BEFORE_FOREVER_DELETION_DEFAULT);
        return tryParseIntPositive(value, NB_DAYS_BEFORE_FOREVER_DELETION_DEFAULT);
    }

    /**
     * @return The per file maximum size expressed in bytes
     */
    public static Long getJcrRepositoryFileSizeLimit() {
        var value = System.getProperty(JCR_REPOSITORY_MAX_FILE_SIZE_MB,
                JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        var parsed = tryParseLongPositive(value, JCR_REPOSITORY_MAX_FILE_SIZE_MB_DEFAULT);
        return parsed << 20;// convert to bytes
    }

    /**
     * @return The file storage quota per project expressed in bytes
     */
    public static Long getJcrRepositoryProjectQuota() {
        var value = System.getProperty(JCR_REPOSITORY_PROJECT_QUOTA_MB,
                JCR_REPOSITORY_PROJECT_QUOTA_MB_DEFAULT);
        var parsed = tryParseLongPositive(value, JCR_REPOSITORY_PROJECT_QUOTA_MB_DEFAULT);
        return parsed << 20;// convert to bytes
    }

    /**
     * @return The URI to access the MongoDB container. Used for file persistence
     * with JCR
     */
    public static String getJcrMongoDbUri() {
        return System.getProperty(JCR_MONGO_DB_URI, JCR_MONGO_DB_URI_DEFAULT);
    }

    /**
     * @return The URI to access the MongoDB container with WS protocol. Used for
     * lexical data
     * persistence
     */
    public static String getYjsUrlWs() {
        return System.getProperty(YJS_URL_WS, YJS_URL_WS_DEFAULT);
    }

    /**
     * @return The URI to access the MongoDB container with HTTP protocol. Used for
     * lexical data
     * persistence
     */
    public static String getYjsInternalUrl() {
        return System.getProperty(YJS_INTERNAL_URL, YJS_INTERNAL_URL_DEFAULT);
    }

    /**
     * Parses a long from a positive string value. Falls back on default value
     *
     * @param value
     * @param dflt  fallback value, used in case parsing fails or value is negative
     * @return The parsed value or the default value
     */
    private static Long tryParseLongPositive(String value, String dflt) {
        Long result;
        try {
            result = Long.parseLong(value);
            if (result <= 0) {
                result = Long.parseLong(dflt);
            }
        } catch (NumberFormatException nfe) {
            result = Long.parseLong(dflt);
        }
        return result;
    }

    /**
     * Parses an integer from a positive string value. Falls back on default value
     *
     * @param value
     * @param dflt  fallback value, used in case parsing fails or value is negative
     * @return The parsed value or the default value
     */
    private static int tryParseIntPositive(String value, String dflt) {
        int result;
        try {
            result = Integer.parseInt(value);
            if (result <= 0) {
                result = Integer.parseInt(dflt);
            }
        } catch (NumberFormatException nfe) {
            result = Integer.parseInt(dflt);
        }
        return result;
    }
}
