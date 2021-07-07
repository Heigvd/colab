/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

import ch.colabproject.colab.api.exceptions.ColabMergeException;
import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.api.model.tools.EntityHelper;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToOne;
import javax.persistence.Transient;

/**
 * A reference to another existing abstract resource.
 * <p>
 * There can be a chain of references to aim at a resource.
 * <p>
 * Ref - [Ref -](0..*) Resource
 * <p>
 * The resource reference holds the comments for the resource in the context of a specific card /
 * card type / card type reference / card content.
 *
 * @author sandra
 */
@Entity
@DiscriminatorValue("RESOURCE_REF")
public class ResourceRef extends AbstractResource {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The abstract resource this reference aims at
     */
    @OneToOne
    @JsonbTransient
    private AbstractResource targetAbstractResource;

    /**
     * The abstract resource id (serialization sugar)
     */
    @Transient
    private Long targetAbstractResourceId;

    /**
     * If the target resource is not useful for that card/cardDef/cardContent
     */
    private boolean refused;

    // ---------------------------------------------------------------------------------------------
    // initialize
    // ---------------------------------------------------------------------------------------------

    /**
     * @return an initialized new resource reference
     */
    public static ResourceRef initNewResourceRef() {
        // nothing to initialize from the super class
        // implicitly setRefused(false)
        return new ResourceRef();
    }

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the abstract resource this reference aims at
     */
    public AbstractResource getTargetAbstractResource() {
        return targetAbstractResource;
    }

    /**
     * @param targetAbstractResource the abstract resource this reference aims at
     */
    public void setTargetAbstractResource(AbstractResource targetAbstractResource) {
        this.targetAbstractResource = targetAbstractResource;
    }

    /**
     * get the id of the abstract resource this reference aims at. To be sent to client
     *
     * @return id of the abstract resource or null
     */
    public Long getTargetAbstractResourceId() {
        if (targetAbstractResource != null) {
            return targetAbstractResource.getId();
        } else {
            return targetAbstractResourceId;
        }
    }

    /**
     * set the id of the abstract resource this reference aims at. For serialization only
     *
     * @param targetAbstractResourceId the id of the abstract resource
     */
    public void setTargetAbstractResourceId(Long targetAbstractResourceId) {
        this.targetAbstractResourceId = targetAbstractResourceId;
    }

    /**
     * @return if the target resource is not useful for that card/cardDef/cardContent
     */
    public boolean isRefused() {
        return refused;
    }

    /**
     * @param refused if the target resource is not useful for that card/cardDef/cardContent
     */
    public void setRefused(boolean refused) {
        this.refused = refused;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public Resource resolve() {
        if (this.targetAbstractResource instanceof Resource) {
            return (Resource) this.targetAbstractResource;
        } else if (this.targetAbstractResource instanceof ResourceRef) {
            return ((ResourceRef) targetAbstractResource).resolve();
        }
        return null;
    }

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof ResourceRef) {
            ResourceRef o = (ResourceRef) other;
            super.merge(o);
            this.setRefused(o.isRefused());
        } else {
            throw new ColabMergeException(this, other);
        }
    }

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
    public String toString() {
        return "ResourceRef{" + toPartialString() + ", targetAbstractResourceId="
            + targetAbstractResourceId + ", refused=" + refused + "}";
    }

}
