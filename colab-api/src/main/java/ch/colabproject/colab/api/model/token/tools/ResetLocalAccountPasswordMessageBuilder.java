/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token.tools;

import ch.colabproject.colab.api.controller.token.TokenMessageBuilder;
import ch.colabproject.colab.api.model.token.ResetLocalAccountPasswordToken;
import java.text.MessageFormat;

/**
 * To build the body of the message to send to reset the local account password.
 *
 * @author sandra
 */
public final class ResetLocalAccountPasswordMessageBuilder {

    private ResetLocalAccountPasswordMessageBuilder() {
        // private constructor
    }

    private static final String MESSAGE_HEAD_TITLE = "co.LAB: reset your password";

    private static final String MESSAGE_PICTURE = "<svg id=\"Layer_1\" width=\"240\" height=\"240\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 370 376.4\">\n"
        + "            <path\n"
        + "              d=\"M370,188.2c0,103.9-82.8,188.2-185,188.2S0,292.2,0,188.2,82.8,0,185,0s185,84.2,185,188.2h0Z\"\n"
        + "              style=\"fill: #e05d11\"\n"
        + "            />\n"
        + "            <rect x=\"236.65\" y=\"259.1\" width=\"121.8\" height=\"106.5\" style=\"fill: none\" />\n"
        + "            <g>\n"
        + "              <g>\n"
        + "                <path\n"
        + "                  d=\"M255.75,178.38h-19.71V113.21c0-28.44-23.14-51.59-51.59-51.59s-51.59,23.14-51.59,51.59v65.17h-19.71V113.21c0-39.31,31.98-71.3,71.3-71.3s71.3,31.98,71.3,71.3v65.17Z\"\n"
        + "                  style=\"fill: #50bfd5\"\n"
        + "                />\n"
        + "                <rect\n"
        + "                  x=\"82.99\"\n"
        + "                  y=\"147.45\"\n"
        + "                  width=\"202.93\"\n"
        + "                  height=\"137.21\"\n"
        + "                  rx=\"7.64\"\n"
        + "                  ry=\"7.64\"\n"
        + "                  style=\"fill: #ffe20f\"\n"
        + "                />\n"
        + "              </g>\n"
        + "              <path\n"
        + "                d=\"M236.04,147.45s16.93-21.12,19.04-43.84v43.84h-19.04Z\"\n"
        + "                style=\"fill: #3e97a3\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M285.92,277.02v-74.7c-61.82,52.3-150.96,71.96-201.47,79.17,1.39,1.92,3.63,3.18,6.18,3.18h187.65c4.22,0,7.64-3.42,7.64-7.64Z\"\n"
        + "                style=\"fill: #edc51d\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M201.22,195.39c0-9.26-7.51-16.77-16.77-16.77s-16.77,7.51-16.77,16.77c0,5.52,2.68,10.4,6.8,13.46l-5.34,37.92h30.62l-5.34-37.92c4.12-3.06,6.8-7.94,6.8-13.46Z\"\n"
        + "                style=\"fill: #50bfd5\"\n"
        + "              />\n"
        + "              <path\n"
        + "                d=\"M169.14,246.77s23.93-9.15,25.68-35.09l4.94,35.09h-30.62Z\"\n"
        + "                style=\"fill: #3e97a3\"\n"
        + "              />\n"
        + "            </g>\n"
        + "            <g>\n"
        + "              <circle cx=\"290.05\" cy=\"297\" r=\"79.4\" style=\"fill: #50bfd5\" />\n"
        + "              <g>\n"
        + "                <polygon\n"
        + "                  points=\"261.32 299.2 259.95 299.24 259.95 299.24 261.32 299.2\"\n"
        + "                  style=\"fill: #fff\"\n"
        + "                />\n"
        + "                <path\n"
        + "                  d=\"M264.04,275.93c.88-1.14,1.82-2.23,2.84-3.26,6.54-6.53,15.23-10.13,24.48-10.13,9.28,0,17.99,3.6,24.53,10.13,6.31,6.31,9.88,14.66,10.11,23.59,3.79-.62,7.59-1.23,11.4-1.84-.67-11.28-5.39-21.83-13.41-29.84-8.71-8.71-20.28-13.5-32.6-13.5h0c-12.32,0-23.89,4.8-32.6,13.5-1.02,1.02-1.99,2.09-2.91,3.19l-8.41-8.41-4.77,32.26,32.17-4.85-10.83-10.83Z\"\n"
        + "                  style=\"fill: #fff\"\n"
        + "                />\n"
        + "                <path\n"
        + "                  d=\"M314.71,322.76c-6.33,5.62-14.4,8.7-22.95,8.7-9.28,0-17.99-3.6-24.53-10.14-5.95-5.96-9.3-13.04-9.97-21.08l-8.28,.93h-.11l-.11,.02c-.65,.02-1.5,.06-2.34,.16-.18,.02-.36,.05-.54,.07,1.06,10.58,5.73,20.47,13.26,28,8.71,8.71,20.29,13.5,32.6,13.5,11.61,0,22.57-4.27,31.08-12.06l8.3,8.3,4.85-32.17-32.26,4.77,10.99,10.99Z\"\n"
        + "                  style=\"fill: #fff\"\n"
        + "                />\n"
        + "              </g>\n"
        + "            </g>\n"
        + "          </svg>";

    private static final String MESSAGE_HEADING = "Reset your password";

    private static final String MESSAGE_SUBHEADING = "We received a request to reset the password for {0}.";

    private static final String MESSAGE_INFO = "<p>Click on the link below to reset your password.</p>";

    private static final String MESSAGE_LINK_LABEL = "Reset password";

    private static final String MESSAGE_ADDITIONAL_FOOTER = "<br/>If you did not make this request, you can safely ignore this email.";

    /**
     * Build a HTML body to send a message to reset the local account password.
     *
     * @param token the reset local account password token
     * @param link  the link in order to consume the token
     *
     * @return the HTML body of the message to send
     */
    public static String build(ResetLocalAccountPasswordToken token, String link) {
        String subHeading = MessageFormat.format(MESSAGE_SUBHEADING,
            (token.getLocalAccount() != null)
                ? (token.getLocalAccount().getUser() != null)
                    ? token.getLocalAccount().getUser().getDisplayName()
                    : token.getLocalAccount().getEmail()
                : "your account");

        return new TokenMessageBuilder(token)
            .headTitle(MESSAGE_HEAD_TITLE)
            .picture(MESSAGE_PICTURE)
            .heading(MESSAGE_HEADING)
            .subheading(subHeading)
            .info(MESSAGE_INFO)
            .linkHref(link)
            .linkLabel(MESSAGE_LINK_LABEL)
            .additionalFooter(MESSAGE_ADDITIONAL_FOOTER)
            .build();
    }

}
