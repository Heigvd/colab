/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.ConcretizationCategory;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import ch.colabproject.colab.generator.model.tools.PolymorphicDeserializer;
import javax.json.bind.annotation.JsonbTypeDeserializer;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.NamedQuery;

/**
 * Any document
 * <p>
 * The subclass handles the content
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonbTypeDeserializer(PolymorphicDeserializer.class)
//FIXME see if is needed or not. It was implemented for test purpose at first
@NamedQuery(name = "Document.findAll", query = "SELECT d FROM Document d")
public abstract class Document implements ColabEntity /* , WithWebsocketChannels */ {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Document ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    /**
     * Title
     */
    protected String title;

    /**
     * Abstract / teaser of the content of the document
     */
    protected String teaser;

    /**
     * The authority holder : is it belonging to
     * <ul>
     * <li>a concrete project and behave for itself</li>
     * <li>a shared abstract model</li>
     * </ul>
     */
    @Enumerated(EnumType.STRING)
    protected ConcretizationCategory authorityHolder;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the document id
     */
    @Override
    public Long getId() {
        return id;
    }

    /**
     * @param id the document id
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * @return the title
     */
    public String getTitle() {
        return title;
    }

    /**
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * @return the abstract / teaser of the content of the document
     */
    public String getTeaser() {
        return teaser;
    }

    /**
     * @param teaser the abstract / teaser of the content of the document
     */
    public void setTeaser(String teaser) {
        this.teaser = teaser;
    }

    /**
     * @return the authority holder : is it belonging to
     *         <ul>
     *         <li>a concrete project and behave for itself</li>
     *         <li>a shared abstract model</li>
     *         </ul>
     */
    public ConcretizationCategory getAuthorityHolder() {
        return authorityHolder;
    }

    /**
     * @param authorityHolder the authority holder : is it belonging to
     *                        <ul>
     *                        <li>a concrete project and behave for itself</li>
     *                        <li>a shared abstract model</li>
     *                        </ul>
     */
    public void setAuthorityHolder(ConcretizationCategory authorityHolder) {
        this.authorityHolder = authorityHolder;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof Document) {
            Document o = (Document) other;
            this.setTitle(o.getTitle());
            this.setTeaser(o.getTeaser());
            this.setAuthorityHolder(o.getAuthorityHolder());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

//    @Override
//    public Set<WebsocketChannel> getChannels() {
//        // TODO
//        return null;
//    }

    @Override
    public int hashCode() {
        return EntityHelper.hashCode(this);
    }

    @Override
    @SuppressWarnings("EqualsWhichDoesntCheckParameterClass")
    public boolean equals(Object obj) {
        return EntityHelper.equals(this, obj);
    }

    @Override
    abstract public String toString();

    /**
     * @return This abstract class fields to mention in the toString implementations
     */
    protected String toPartialString() {
        return "id=" + id + ", title=" + title + ", teaser=" + teaser + ", authorityHolder="
                + authorityHolder;
    }

}
