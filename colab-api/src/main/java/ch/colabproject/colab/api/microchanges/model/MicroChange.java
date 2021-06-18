/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.model;

import java.io.Serializable;
import javax.validation.constraints.NotNull;

/**
 * A microchange.
 *
 * @author maxence
 */
public class MicroChange implements Serializable {

    /**
     * microChange Type
     */
    public enum Type {
        /**
         * Insert
         */
        I,
        /**
         * Delete
         */
        D
    }

    /**
     * Offset
     */
    @NotNull
    private Integer o;

    /**
     * Type
     */
    @NotNull
    private Type t;

    /**
     * Value. Only relevant for adds
     */
    private String v;

    /**
     * Length. Only relevant for deletions
     */
    private Integer l;

    public Integer getO() {
        return o;
    }

    public void setO(Integer o) {
        this.o = o;
    }

    public Type getT() {
        return t;
    }

    public void setT(Type t) {
        this.t = t;
    }

    public String getV() {
        return v;
    }

    public void setV(String v) {
        this.v = v;
    }

    public Integer getL() {
        return l;
    }

    public void setL(Integer l) {
        this.l = l;
    }

    @Override
    public String toString() {
        if (t == Type.D) {
            return "MicroChange{"
                + "DELETE " + l + " from " + o
                + '}';
        } else {
            return "MicroChange{"
                + "INSERT '" + v + "' at " + o
                + '}';
        }
    }
}
