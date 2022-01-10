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
import javax.persistence.CascadeType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.OneToMany;

/**
 * Homemade document made up of blocks
 *
 * @author sandra
 */
//TODO adjust the constraints / indexes
@Entity
@DiscriminatorValue("BLOCK_DOC")
public class BlockDocument extends Document {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * The content of the document : a list of blocks of content
     */
    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL)
    @JsonbTransient
    // Note : do not sort with JPA. It does not work well with our production environment
    // The client is in charge of the sort
    private List<Block> blocks = new ArrayList<>();

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the content of the document : a list of blocks of content
     */
    public List<Block> getBlocks() {
        return blocks;
    }

    /**
     * @param blocks the content of the document : a list of blocks of content to set
     */
    public void setBlocks(List<Block> blocks) {
        this.blocks = blocks;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public void merge(ColabEntity other) throws ColabMergeException {
        if (other instanceof BlockDocument) {
            BlockDocument o = (BlockDocument) other;
            super.merge(o);
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
        return "BlockDocument{" + super.toPartialString() + "}";
    }

}
