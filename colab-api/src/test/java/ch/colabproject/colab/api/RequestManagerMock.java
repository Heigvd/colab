/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api;

import ch.colabproject.colab.api.ejb.RequestManager;
import javax.enterprise.inject.Specializes;
import javax.inject.Singleton;

/**
 * RequestScroped bean are not supported by Arquillian.
 * This class specializes our RequestManager to turn it into a singleton.
 * It makes it available even in a non-http request context
 * @author maxence
 */
@Specializes
@Singleton
public class RequestManagerMock extends RequestManager {
    /* no-op */
}
