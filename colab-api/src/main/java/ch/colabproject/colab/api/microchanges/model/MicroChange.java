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

    /**
     * Get offset
     *
     * @return offset value
     */
    public Integer getO() {
        return o;
    }

    /**
     * set offset
     *
     * @param o offset value
     */
    public void setO(Integer o) {
        this.o = o;
    }

    /**
     * get type
     *
     * @return change type
     */
    public Type getT() {
        return t;
    }

    /**
     * Set change type
     *
     * @param t type
     */
    public void setT(Type t) {
        this.t = t;
    }

    /**
     * Get change value
     *
     * @return value
     */
    public String getV() {
        return v;
    }

    /**
     * set change value.
     *
     * @param v value
     */
    public void setV(String v) {
        this.v = v;
    }

    /**
     * get length.
     *
     * @return length
     */
    public Integer getL() {
        return l;
    }

    /**
     * set the length
     *
     * @param l length
     */
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
