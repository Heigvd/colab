/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token.tools;

import ch.colabproject.colab.api.controller.token.TokenMessageBuilder;
import ch.colabproject.colab.api.model.token.VerifyLocalAccountToken;
import java.text.MessageFormat;

/**
 * To build the body of the message to send to verify the local account.
 *
 * @author sandra
 */
public final class VerifyLocalAccountMessageBuilder {

    /** Title */
    private static final String MESSAGE_HEAD_TITLE = "co.LAB: verify your email address";

    /** Picture */
    private static final String MESSAGE_PICTURE = "<svg width=\"240\" height=\"240\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 370 376.4\">\n"
        + "            <g>\n"
        + "              <path\n"
        + "                d=\"M370,188.2c0,103.9-82.8,188.2-185,188.2S0,292.2,0,188.2,82.8,0,185,0s185,84.2,185,188.2h0Z\"\n"
        + "                style=\"fill: #e05d11\"\n"
        + "              />\n"
        + "              <g>\n"
        + "                <polygon\n"
        + "                  points=\"204.4 187 157.4 187 157.4 186.9 43.5 267.5 318.2 267.5 204.4 187\"\n"
        + "                  style=\"fill: #edc51d\"\n"
        + "                />\n"
        + "                <polygon\n"
        + "                  points=\"43.5 106.5 157.4 187 43.5 267.5 43.5 106.5\"\n"
        + "                  style=\"fill: #d6b90d\"\n"
        + "                />\n"
        + "                <polygon\n"
        + "                  points=\"318.2 106.5 204.3 187 318.2 267.5 318.2 106.5\"\n"
        + "                  style=\"fill: #d6b90d\"\n"
        + "                />\n"
        + "                <polygon\n"
        + "                  points=\"43.5 106.5 180.8 220.4 318.2 106.5 43.5 106.5\"\n"
        + "                  style=\"fill: #ffe20f\"\n"
        + "                />\n"
        + "              </g>\n"
        + "            </g>\n"
        + "            <circle cx=\"289.6\" cy=\"296.2\" r=\"79.4\" style=\"fill: #50bfd5\" />\n"
        + "            <rect x=\"237.2\" y=\"259.1\" width=\"121.8\" height=\"106.5\" style=\"fill: none\" />\n"
        + "            <polygon\n"
        + "              points=\"271.7 343.4 234.8 306.5 248 293.2 271.7 316.8 331.4 257.1 344.7 270.4 271.7 343.4\"\n"
        + "              style=\"fill: #fff\"\n"
        + "            />\n"
        + "          </svg>";

    /** Header 1 */
    private static final String MESSAGE_HEADING = "Please verify your email address.";

    /** Header 2 */
    private static final String MESSAGE_SUBHEADING = "Hi {0} ! Click on the link below to verify your email address.";

    /** Label of the link */
    private static final String MESSAGE_LINK_LABEL = "Verify";

    private VerifyLocalAccountMessageBuilder() {
        // private constructor
    }

    /**
     * Build a HTML body to send a message to verify the local account.
     *
     * @param token the verify local account token
     * @param link  the ink in order to consume the token
     *
     * @return the HTML body of the message to send
     */
    public static String build(VerifyLocalAccountToken token, String link) {
        String subHeading = MessageFormat.format(MESSAGE_SUBHEADING,
            (token.getLocalAccount() != null && token.getLocalAccount().getUser() != null)
                ? token.getLocalAccount().getUser().getDisplayName()
                : "");

        return new TokenMessageBuilder(token)
            .headTitle(MESSAGE_HEAD_TITLE)
            .picture(MESSAGE_PICTURE)
            .heading(MESSAGE_HEADING)
            .subheading(subHeading)
            // no info
            .linkHref(link)
            .linkLabel(MESSAGE_LINK_LABEL)
            // let default footer
            .build();
    }

}
