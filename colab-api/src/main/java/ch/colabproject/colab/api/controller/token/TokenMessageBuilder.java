/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller.token;

import ch.colabproject.colab.api.model.token.Token;
import java.text.MessageFormat;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

/**
 * To build the body of the message to send for a token.
 *
 * @author sandra
 */
public class TokenMessageBuilder {

    /**
     * Text to set as a footer to inform about the validity of the message
     */
    public static final String VALIDITY_FOOTER = "This link can be used until {0} GMT.";

    /**
     * The message title
     */
    private String headTitle;

    /**
     * The message main picture
     */
    private String picture;

    /**
     * The message heading
     */
    private String heading;

    /**
     * The message sub heading
     */
    private String subheading;

    /**
     * The message informations
     */
    private String info;

    /**
     * The link to go to consume the token on co.LAB
     */
    private String linkHref;

    /**
     * The label of the link to go to consume the token on co.LAB
     */
    private String linkLabel;

    /**
     * The message footer info
     */
    private List<String> footer = new ArrayList<>();

    /**
     * Constructor
     *
     * @param token the token for which we are writing a message
     */
    public TokenMessageBuilder(Token token) {
        // this.token = token;
        headTitle = null;
        picture = null;
        heading = null;
        subheading = null;
        info = null;
        linkHref = null;
        linkLabel = null;
        footer = new ArrayList<>();
        if (token.getExpirationDate() != null) {
            footer.add(MessageFormat.format(VALIDITY_FOOTER,
                token.getExpirationDate().format(DateTimeFormatter.RFC_1123_DATE_TIME)));
        }
    }

    /**
     * Set the message head title
     *
     * @param headTitle the head title to set
     *
     * @return this builder
     */
    public TokenMessageBuilder headTitle(String headTitle) {
        this.headTitle = headTitle;
        return this;
    }

    /**
     * Set the message main picture
     *
     * @param picture the main picture to set
     *
     * @return this builder
     */
    public TokenMessageBuilder picture(String picture) {
        this.picture = picture;
        return this;
    }

    /**
     * Set the message heading
     *
     * @param heading the heading to set
     *
     * @return this builder
     */
    public TokenMessageBuilder heading(String heading) {
        this.heading = heading;
        return this;
    }

    /**
     * Set the message sub heading
     *
     * @param subheading the sub heading to set
     *
     * @return this builder
     */
    public TokenMessageBuilder subheading(String subheading) {
        this.subheading = subheading;
        return this;
    }

    /**
     * Set the message additional content
     *
     * @param info the additional content to set
     *
     * @return this builder
     */
    public TokenMessageBuilder info(String info) {
        this.info = info;
        return this;
    }

    /**
     * Set the message link href
     *
     * @param linkHref the link href to set
     *
     * @return this builder
     */
    public TokenMessageBuilder linkHref(String linkHref) {
        this.linkHref = linkHref;
        return this;
    }

    /**
     * Set the message link label
     *
     * @param linkLabel the link label to set
     *
     * @return this builder
     */
    public TokenMessageBuilder linkLabel(String linkLabel) {
        this.linkLabel = linkLabel;
        return this;
    }

    /**
     * Add a message footer
     *
     * @param footer the footer to add
     *
     * @return this builder
     */
    public TokenMessageBuilder additionalFooter(String footer) {
        this.footer.add(footer);
        return this;
    }

    /**
     * Build the email body to send with the token
     *
     * @return html email body
     */
    public String build() {
        return "<!DOCTYPE html>\n"
            + "<html lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\n"
            + "  <head>\n"
            + "    <meta charset=\"utf-8\" />\n"
            + "    <!-- utf-8 works for most cases -->\n"
            + "    <meta name=\"viewport\" content=\"width=device-width\" />\n"
            + "    <!-- Forcing initial-scale shouldn't be necessary -->\n"
            + "    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\" />\n"
            + "    <!-- Use the latest (edge) version of IE rendering engine -->\n"
            + "    <meta name=\"x-apple-disable-message-reformatting\" />\n"
            + "    <!-- Disable auto-scale in iOS 10 Mail entirely -->\n"
            + "    <title>" + headTitle + "</title>\n"
            + "    <!-- The title tag shows in email notifications, like Android 4.4. -->\n"
            + "    <style>\n"
            + "      h2,\n"
            + "      h3 {\n"
            + "        font-family: sans-serif;\n"
            + "        color: #000000;\n"
            + "        margin-top: 0;\n"
            + "      }\n"
            + "      /* What it does: Stops email clients resizing small text. */\n"
            + "      * {\n"
            + "        -ms-text-size-adjust: 100%;\n"
            + "        -webkit-text-size-adjust: 100%;\n"
            + "      }\n"
            + "      /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */\n"
            + "      a {\n"
            + "        text-decoration: none;\n"
            + "      }\n"
            + "      /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */\n"
            + "      /* Create one of these media queries for each additional viewport size you'd like to fix */\n"
            + "\n"
            + "      /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */\n"
            + "      @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {\n"
            + "        u ~ div .email-container {\n"
            + "          min-width: 320px !important;\n"
            + "        }\n"
            + "      }\n"
            + "      /* iPhone 6, 6S, 7, 8, and X */\n"
            + "      @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {\n"
            + "        u ~ div .email-container {\n"
            + "          min-width: 375px !important;\n"
            + "        }\n"
            + "      }\n"
            + "      /* iPhone 6+, 7+, and 8+ */\n"
            + "      @media only screen and (min-device-width: 414px) {\n"
            + "        u ~ div .email-container {\n"
            + "          min-width: 414px !important;\n"
            + "        }\n"
            + "      }\n"
            + "    </style>\n"
            + "  </head>\n"
            + "\n"
            + "  <body\n"
            + "    width=\"100%\"\n"
            + "    style=\"\n"
            + "      margin: 0;\n"
            + "      padding: 0 !important;\n"
            + "      mso-line-height-rule: exactly;\n"
            + "      background-color: #f1f1f1;\n"
            + "      font-family: sans-serif;\n"
            + "      font-size: 15px;\n"
            + "      line-height: 1.8;\n"
            + "      color: rgba(0, 0, 0, 0.4);\n"
            + "    \"\n"
            + "  >\n"
            + "    <div style=\"max-width: 600px; margin: 0 auto\" class=\"email-container\">\n"
            + "      <div\n"
            + "        align=\"center\"\n"
            + "        role=\"presentation\"\n"
            + "        cellspacing=\"0\"\n"
            + "        cellpadding=\"0\"\n"
            + "        border=\"0\"\n"
            + "        width=\"100%\"\n"
            + "        style=\"margin: auto\"\n"
            + "      >\n"
            + "        <div valign=\"middle\" class=\"hero\" style=\"padding: 3em 0 2em 0; background: #ffffff\">\n"
            + "          " + picture + "\n"
            + "          <div class=\"text\" style=\"padding: 0 2.5em; text-align: center\">\n"
            + (StringUtils.isNotBlank(heading)
                ? ("            <h2 style=\"font-size: 30px; margin-bottom: 0\">" + heading
                    + "</h2>\n")
                : (""))
            + (StringUtils.isNotBlank(subheading) ? ("            <h3>" + subheading + "</h3>\n")
                : (""))
            + (StringUtils.isNotBlank(info) ? ("            " + info + "\n")
                : (""))
            + "            <p>\n"
            + "              <a\n"
            + "                href=\"" + linkHref + "\"\n"
            + "                style=\"\n"
            + "                  padding: 10px 15px;\n"
            + "                  display: inline-block;\n"
            + "                  border-radius: 5px;\n"
            + "                  background: #50bfd5;\n"
            + "                  color: #ffffff;\n"
            + "                \">\n"
            + "                " + linkLabel + "\n"
            + "              </a>\n"
            + "            </p>\n"
            + ((footer != null && footer.isEmpty())
                ? ("            <p>" + footer.stream().collect(Collectors.joining(" ")) + "</p>")
                : (""))
            + "          </div>\n"
            + "        </div>\n"
            + "      </div>\n"
            + "    </div>\n"
            + "  </body>\n"
            + "</html>";
    }

}
