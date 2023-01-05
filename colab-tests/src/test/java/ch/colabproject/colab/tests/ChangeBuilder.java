/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.tests;

import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.api.microchanges.model.MicroChange;
import java.util.Set;

/**
 *
 * @author maxence
 */
public class ChangeBuilder {

    private Change change;

    public static ChangeBuilder create(String liveSession, String newRevision, String... basedOn) {
        ChangeBuilder cb = new ChangeBuilder();
        cb.change = new Change();
        cb.change.setBasedOn(Set.of((String[]) basedOn));
        cb.change.setLiveSession(liveSession);
        cb.change.setRevision(liveSession + "::" + newRevision);

        return cb;
    }

    public ChangeBuilder ins(int offset, String data) {
        MicroChange mu = new MicroChange();
        mu.setT(MicroChange.Type.I);
        mu.setO(offset);
        mu.setV(data);
        this.change.getMicrochanges().add(mu);

        return this;
    }

    public ChangeBuilder del(int offset, int length) {
        MicroChange mu = new MicroChange();
        mu.setT(MicroChange.Type.D);
        mu.setO(offset);
        mu.setL(length);
        this.change.getMicrochanges().add(mu);

        return this;
    }

    public Change build() {
        return this.change;
    }
}
