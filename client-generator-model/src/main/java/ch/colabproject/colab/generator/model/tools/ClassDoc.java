/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;

import java.util.HashMap;
import java.util.Map;
import javax.json.bind.annotation.JsonbTransient;

/**
 * Represent javadoc of a class, with fields and methods javadocs.
 *
 * @author maxence
 */
public class ClassDoc {

    /**
     * The package name
     */
    private String packageName;
    /**
     * Class name
     */
    private String className;

    /**
     * Class-level javadoc
     */
    private String doc;
    /**
     * Fields javadoc
     */
    private Map<String, String> fields = new HashMap<>();
    /**
     * Methods javadoc
     */
    private Map<String, String> methods = new HashMap<>();

    /**
     * Get the package name
     *
     * @return package name
     */
    public String getPackageName() {
        return packageName;
    }

    /**
     * Set package name
     *
     * @param packageName new package name
     */
    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    /**
     * Get simple name of the class
     *
     * @return the name
     */
    public String getClassName() {
        return className;
    }

    /**
     * The the class name
     *
     * @param className new class name
     */
    public void setClassName(String className) {
        this.className = className;
    }

    /**
     * Get class level javadoc
     *
     * @return class javadoc
     */
    public String getDoc() {
        return doc;
    }

    /**
     * Set the class-level javadoc
     *
     * @param doc new javadoc
     */
    public void setDoc(String doc) {
        this.doc = doc;
    }

    /**
     * Get field javadocs
     *
     * @return javadoc for fields
     */
    public Map<String, String> getFields() {
        return fields;
    }

    /**
     * Set map of fields javadoc
     *
     * @param fields new fields javadoc
     */
    public void setFields(Map<String, String> fields) {
        this.fields = fields;
    }

    /**
     * get method javadocs
     *
     * @return javadoc for methods
     */
    public Map<String, String> getMethods() {
        return methods;
    }

    /**
     * Set map of methods javadoc
     *
     * @param methods new methods javadoc
     */
    public void setMethods(Map<String, String> methods) {
        this.methods = methods;
    }

    /**
     * Get class fill name
     *
     * @return fullname
     */
    @JsonbTransient
    public String getFullName() {
        return getPackageName() + "." + getClassName();
    }

}
