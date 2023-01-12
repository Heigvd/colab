/*
 * The coLAB project
 * Copyright (C) 2022-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.token.tools;

import ch.colabproject.colab.api.controller.token.TokenMessageBuilder;
import ch.colabproject.colab.api.model.token.ModelSharingToken;
import java.text.MessageFormat;

/**
 * To build the body of the message to send for an model sharing token.
 *
 * @author sandra
 */
public class ModelSharingMessageBuilder {

    // TODO

    /** Title */
    private static final String MESSAGE_HEAD_TITLE = "Co.LAB model sharing";

    /** Picture */
    private static final String MESSAGE_PICTURE = "<svg\n"
        + "            width=\"230\"\n"
        + "            height=\"230\"\n"
        + "            id=\"Layer_1\"\n"
        + "            xmlns=\"http://www.w3.org/2000/svg\"\n"
        + "            viewBox=\"0 0 384.66 396.62\"\n"
        + "          >\n"
        + "            <path\n"
        + "              fill=\"#50BFD5\"\n"
        + "              d=\"M384.7,192.3c0,106.2-86.1,192.3-192.3,192.3S0,298.6,0,192.3S86.1,0,192.3,0S384.7,86.1,384.7,192.3\n"
        + "            L384.7,192.3z\"\n"
        + "            />\n"
        + "            <g>\n"
        + "              <path\n"
        + "                fill=\"#F1F2F2\"\n"
        + "                d=\"M83,55.5h222.2c1.7,0,3,1.6,3,3.6v263c0,2-1.3,3.6-3,3.6H83c-1.7,0-3-1.6-3-3.6v-263\n"
        + "                C80,57.1,81.3,55.5,83,55.5L83,55.5z\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"106.4\"\n"
        + "                y=\"78.6\"\n"
        + "                fill=\"#D1B511\"\n"
        + "                width=\"113.7\"\n"
        + "                height=\"57\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"230.5\"\n"
        + "                y=\"183.7\"\n"
        + "                fill=\"#D1B511\"\n"
        + "                width=\"51.3\"\n"
        + "                height=\"57\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"106.4\"\n"
        + "                y=\"145.5\"\n"
        + "                fill=\"#D1B511\"\n"
        + "                width=\"113.7\"\n"
        + "                height=\"96.1\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"229.8\"\n"
        + "                y=\"76.5\"\n"
        + "                fill=\"#D1B511\"\n"
        + "                width=\"51.3\"\n"
        + "                height=\"96.1\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"106.4\"\n"
        + "                y=\"251.9\"\n"
        + "                fill=\"#D1B511\"\n"
        + "                width=\"174.7\"\n"
        + "                height=\"54.5\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"118.2\"\n"
        + "                y=\"91.5\"\n"
        + "                fill=\"#FFE20F\"\n"
        + "                width=\"39.3\"\n"
        + "                height=\"33\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"168.3\"\n"
        + "                y=\"91.5\"\n"
        + "                fill=\"#FFE20F\"\n"
        + "                width=\"38.8\"\n"
        + "                height=\"33\"\n"
        + "              />\n"
        + "              <rect x=\"239.6\" y=\"195.7\" fill=\"#FFE20F\" width=\"33\" height=\"33\" />\n"
        + "              <rect\n"
        + "                x=\"118.5\"\n"
        + "                y=\"262.6\"\n"
        + "                fill=\"#FFE20F\"\n"
        + "                width=\"38.8\"\n"
        + "                height=\"33\"\n"
        + "              />\n"
        + "            </g>\n"
        + "            <g>\n"
        + "              <circle fill=\"#E05D11\" cx=\"304.8\" cy=\"305.3\" r=\"79.4\" />\n"
        + "              <circle fill=\"#FFFFFF\" cx=\"329.1\" cy=\"271.6\" r=\"16.9\" />\n"
        + "              <circle fill=\"#FFFFFF\" cx=\"270.1\" cy=\"305.5\" r=\"16.9\" />\n"
        + "              <circle fill=\"#FFFFFF\" cx=\"329.1\" cy=\"340.2\" r=\"16.9\" />\n"
        + "              <rect\n"
        + "                x=\"297.9\"\n"
        + "                y=\"251.9\"\n"
        + "                transform=\"matrix(0.5 0.866 -0.866 0.5 400.3593 -116.5156)\"\n"
        + "                fill=\"#FFFFFF\"\n"
        + "                width=\"6.5\"\n"
        + "                height=\"73\"\n"
        + "              />\n"
        + "              <rect\n"
        + "                x=\"298.6\"\n"
        + "                y=\"286.9\"\n"
        + "                transform=\"matrix(-0.5 0.866 -0.866 -0.5 732.8752 223.7727)\"\n"
        + "                fill=\"#FFFFFF\"\n"
        + "                width=\"6.5\"\n"
        + "                height=\"73\"\n"
        + "              />\n"
        + "            </g>\n"
        + "          </svg>";

    /** Header 1 */
    private static final String MESSAGE_HEADING = "Hi ! You have been shared a project model.";

    /** Header 2 */
    private static final String MESSAGE_SUBHEADING = "{0} invites you to use {1}.";

    /** Information */
    private static final String MESSAGE_INFO = "<p>Click on the link below to start colabbing with the model.</p>";

    /** Label of the link */
    private static final String MESSAGE_LINK_LABEL = "Get the model";

    private ModelSharingMessageBuilder() {
        // private constructor
    }

    /**
     * Build a HTML body to send a message for the model sharing token
     *
     * @param token the model sharing token
     * @param link  the link in order to consume the token
     *
     * @return the HTML body of the message to send
     */
    public static String build(ModelSharingToken token, String link) {
        String subHeading = MessageFormat.format(MESSAGE_SUBHEADING,
            token.getSenderName() != null
                ? token.getSenderName()
                : "Someone",
            token.getProject() != null
                ? "the model <i>" + token.getProject().getName() + "</i>"
                : "a co.LAB model");

        return new TokenMessageBuilder(token)
            .headTitle(MESSAGE_HEAD_TITLE)
            .picture(MESSAGE_PICTURE)
            .heading(MESSAGE_HEADING)
            .subheading(subHeading)
            .info(MESSAGE_INFO)
            .linkHref(link)
            .linkLabel(MESSAGE_LINK_LABEL)
            // let default footer
            .build();
    }

}
