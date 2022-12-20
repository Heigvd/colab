/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.service.smtp;

import ch.colabproject.colab.api.setup.ColabConfiguration;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Properties;
import jakarta.mail.Address;
import jakarta.mail.Authenticator;
import jakarta.mail.Message.RecipientType;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/**
 * Helper to send e-mails.
 *
 * @author maxence
 */
public class Sendmail {

    /**
     * never-called private constructor
     */
    private Sendmail() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Send mail
     *
     * @param message the message to sent
     *
     * @throws HttpErrorMessage             malformedMessage if supplied values are erroneous
     * @throws jakarta.mail.MessagingException when something went wrong
     */
    public static void send(Message message) throws MessagingException {

        Properties props = new Properties();
        final String username = ColabConfiguration.getSmtpUsername();
        final String password = ColabConfiguration.getSmtpPassword();
        final String host = ColabConfiguration.getSmtpHost();
        final String port = ColabConfiguration.getSmtpPort();

        props.put("mail.smtp.host", host);

        props.setProperty("mail.smtp.auth", ColabConfiguration.getSmtpAuth());

        props.put("mail.smtp.port", port);

        if (ColabConfiguration.getSmtpStartTls()) {
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.ssl.trust", host);
        } else {
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.port", port);
            props.put("mail.smtp.ssl.trust", host);
        }

        Session session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });

        MimeMessage msg = new MimeMessage(session);

        try {
            msg.setFrom(new InternetAddress(message.getFrom()));

            Address[] to = convert(message.getTo());
            Address[] cc = convert(message.getCc());
            Address[] bcc = convert(message.getBcc());

            msg.setRecipients(RecipientType.TO, to);
            msg.setRecipients(RecipientType.CC, cc);
            msg.setRecipients(RecipientType.BCC, bcc);

            if (message.getReplyTo() != null) {
                msg.setReplyTo(InternetAddress.parse(message.getReplyTo()));
            }

            String subject = message.getSubject().replaceAll("[\n\r]", " ");
            msg.setSubject(subject);
            msg.setContent(message.getBody(), message.getMimeType());
            msg.setSentDate(new Date());
        } catch (AddressException ex) {
            throw HttpErrorMessage.emailMessageError();
        }
        Transport.send(msg);
    }

    private static Address[] convert(List<String> addresses) throws AddressException {
        List<Address> list = new ArrayList<>();

        for (String address : addresses) {
            InternetAddress[] parsed = InternetAddress.parse(address);
            list.addAll(Arrays.asList(parsed));
        }
        return list.toArray(new Address[list.size()]);
    }
}
