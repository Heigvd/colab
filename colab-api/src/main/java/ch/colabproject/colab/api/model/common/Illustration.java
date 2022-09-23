/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.common;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * To store data of the illustration of some item.
 * <p>
 * It is a simple picture that illustrate a project or a card type.
 *
 * @author sandra
 */
@Embeddable
@ExtractJavaDoc
public class Illustration implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Which library of icons contains the key
     */
    @Column(length = 128)
    @Enumerated(value = EnumType.STRING)
    @NotNull
    private IconLibrary iconLibrary = IconLibrary.FONT_AWESOME_SOLID;

    /**
     * The key of the icon within the library of icons
     */
    @Size(max = 128)
    @NotNull
    private String iconKey;

    /**
     * The background color to set behind the icon
     */
    @Size(max = 64)
    @NotNull
    private String iconBkgdColor;

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return which library of icons contains the key
     */
    public IconLibrary getIconLibrary() {
        return iconLibrary;
    }

    /**
     * @param iconLibrary which library of icons contains the key
     */
    public void setIconLibrary(IconLibrary iconLibrary) {
        this.iconLibrary = iconLibrary;
    }

    /**
     * @return the key of the icon within the library of icons
     */
    public String getIconKey() {
        return iconKey;
    }

    /**
     * @param iconKey the key of the icon within the library of icons
     */
    public void setIconKey(String iconKey) {
        this.iconKey = iconKey;
    }

    /**
     * @return the background color to set behind the icon
     */
    public String getIconBkgdColor() {
        return iconBkgdColor;
    }

    /**
     * @param iconBkgdColor the background color to set behind the icon
     */
    public void setIconBkgdColor(String iconBkgdColor) {
        this.iconBkgdColor = iconBkgdColor;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.iconLibrary)
            .append(this.iconKey)
            .append(this.iconBkgdColor)
            .toHashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final Illustration other = (Illustration) obj;
        return new EqualsBuilder()
            .append(this.iconLibrary, other.iconLibrary)
            .append(this.iconKey, other.iconKey)
            .append(this.iconBkgdColor, other.iconBkgdColor)
            .isEquals();
    }

    @Override
    public String toString() {
        return "Illustration{" + " iconLibrary=" + iconLibrary + ", iconKey=" + iconKey
            + ", iconBkgdColor=" + iconBkgdColor + " }";
    }

}
