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
import java.util.ArrayList;
import java.util.List;
import javax.json.bind.annotation.JsonbTransient;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Index;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.validation.constraints.NotNull;

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
@Table(
    indexes = {
        @Index(columnList = "target_id"),
    }
)
@DiscriminatorValue("RESOURCE_REF")
@NamedQuery(name = "ResourceRef.findDirectReferences",
query = "SELECT ref FROM ResourceRef ref "
    + "WHERE ref.target IS NOT NULL AND ref.target.id = :targetId")
public class ResourceRef extends AbstractResource {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * If the target resource is not useful for that card/cardDef/cardContent
     */
    @NotNull
    private boolean refused;

    /**
     * The reference is a rest of a former ancestor.
     * <p>
     * It is always kept for a possible rollback without loss of data
     */
    @NotNull
    private boolean residual;

    /**
     * The abstract resource this reference aims at
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @NotNull
    @JsonbTransient
    private AbstractResource target;

    /**
     * The abstract resource id (serialization sugar)
     */
    @Transient
    private Long targetId;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return if the targeted resource is not useful for that card/cardDef/cardContent
     */
    public boolean isRefused() {
        return refused;
    }

    /**
     * @param refused if the targeted resource is not useful for that card/cardDef/cardContent
     */
    public void setRefused(boolean refused) {
        this.refused = refused;
    }

    /**
     * @return if it is a rest of a former ancestor
     */
    public boolean isResidual() {
        return residual;
    }

    /**
     * @param residual if it is a rest of a former ancestor
     */
    public void setResidual(boolean residual) {
        this.residual = residual;
    }

    /**
     * @return the resource (or resource reference) this reference aims at
     */
    public AbstractResource getTarget() {
        return target;
    }

    /**
     * @param target the resource (or resource reference) this reference aims at
     */
    public void setTarget(AbstractResource target) {
        this.target = target;
    }

    /**
     * get the id of the resource (or resource reference) this reference aims at. To be sent to
     * client
     *
     * @return id of the abstract resource or null
     */
    public Long getTargetId() {
        if (target != null) {
            return target.getId();
        } else {
            return targetId;
        }
    }

    /**
     * set the id of the resource (or resource reference) this reference aims at. For serialization
     * only
     *
     * @param targetId the id of the resource or resource reference
     */
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    // ---------------------------------------------------------------------------------------------
    // helpers
    // ---------------------------------------------------------------------------------------------

    @Override
    public Resource resolve() {
        if (this.target != null) {
            return this.target.resolve();
        }

        return null;
    }

    @Override
    public List<AbstractResource> expand() {
        List<AbstractResource> list = new ArrayList<>();

        list.add(this);
        if (this.target != null) {
            list.addAll(this.target.expand());
        }
        return list;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        super.merge(other);

        if (other instanceof ResourceRef) {
            ResourceRef o = (ResourceRef) other;
            this.setRefused(o.isRefused());
            this.setResidual(o.isResidual());
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
        return "ResourceRef{" + toPartialString() + ", refused=" + refused
            + ", residual=" + residual + ", targetId=" + targetId + "}";
    }

}
