/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model;

import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

/**
 * All we need to fine tune a duplication
 *
 * @author sandra
 */
@ExtractJavaDoc
public class DuplicationParam implements WithJsonDiscriminator {

    private static final long serialVersionUID = 1L;

    // ---------------------------------------------------------------------------------------------
    // fields
    // ---------------------------------------------------------------------------------------------

    /**
     * Do we duplicate the roles
     */
    private boolean withRoles;

    /**
     * Do we duplicate the team members
     */
    private boolean withTeamMembers;

    /**
     * Do we duplicate card types
     */
    private boolean withCardTypes;

    /**
     * Do we duplicate the cards and card content structure
     */
    private boolean withCardsStructure;

    /**
     * Do we duplicate the deliverables in the card contents
     */
    private boolean withDeliverables;

    /**
     * Do we duplicate the resources
     */
    private boolean withResources;

    /**
     * Do we duplicate the sticky notes
     */
    private boolean withStickyNotes;

    /**
     * Do we duplicate the activity flows
     */
    private boolean withActivityFlow;

    /**
     * make card type references instead of duplication
     */
    private boolean makeOnlyCardTypeReferences;

    // ---------------------------------------------------------------------------------------------
    // initializer
    // ---------------------------------------------------------------------------------------------

    /**
     * @return Default instance for a project duplication
     */
    public static DuplicationParam buildDefaultForCopyOfProject() {
        DuplicationParam defaultInstance = new DuplicationParam();

        defaultInstance.setWithRoles(true);
        defaultInstance.setWithTeamMembers(true);
        defaultInstance.setWithCardTypes(true);
        defaultInstance.setWithCardsStructure(true);
        defaultInstance.setWithDeliverables(true);
        defaultInstance.setWithResources(true);
        defaultInstance.setWithStickyNotes(true);
        defaultInstance.setWithActivityFlow(true);

        defaultInstance.setMakeOnlyCardTypeReferences(false);

        return defaultInstance;
    }

    /**
     * @return Default instance for a resource duplication
     */
    public static DuplicationParam buildDefaultForCopyOfResource() {
        DuplicationParam defaultInstance = new DuplicationParam();

        defaultInstance.setWithRoles(false);
        defaultInstance.setWithTeamMembers(false);
        defaultInstance.setWithCardTypes(false);
        defaultInstance.setWithCardsStructure(false);
        defaultInstance.setWithDeliverables(false);
        defaultInstance.setWithResources(true);
        defaultInstance.setWithStickyNotes(false);
        defaultInstance.setWithActivityFlow(false);

        defaultInstance.setMakeOnlyCardTypeReferences(false);

        return defaultInstance;
    }

    /**
     * @return Default instance for a project created from a project model
     */
    public static DuplicationParam buildForCreationFromModel() {
        DuplicationParam defaultInstance = new DuplicationParam();

        defaultInstance.setWithRoles(true);
        defaultInstance.setWithCardTypes(true);
        defaultInstance.setWithCardsStructure(true);
        defaultInstance.setWithDeliverables(true);
        defaultInstance.setWithResources(true);
        defaultInstance.setWithStickyNotes(true);
        defaultInstance.setWithActivityFlow(true);
        defaultInstance.setMakeOnlyCardTypeReferences(true);

        defaultInstance.setWithTeamMembers(false);

        return defaultInstance;
    }

    // ---------------------------------------------------------------------------------------------
    // getters and setters
    // ---------------------------------------------------------------------------------------------

    /**
     * @return the withRoles
     */
    public boolean isWithRoles() {
        return withRoles;
    }

    /**
     * @param withRoles the withRoles
     */
    public void setWithRoles(boolean withRoles) {
        this.withRoles = withRoles;
    }

    /**
     * @return the withTeamMembers
     */
    public boolean isWithTeamMembers() {
        return withTeamMembers;
    }

    /**
     * @param withTeamMembers the withTeamMembers
     */
    public void setWithTeamMembers(boolean withTeamMembers) {
        this.withTeamMembers = withTeamMembers;
    }

    /**
     * @return the withCardTypes
     */
    public boolean isWithCardTypes() {
        return withCardTypes;
    }

    /**
     * @param withCardTypes the withCardTypes
     */
    public void setWithCardTypes(boolean withCardTypes) {
        this.withCardTypes = withCardTypes;
    }

    /**
     * @return the withCardsStructure
     */
    public boolean isWithCardsStructure() {
        return withCardsStructure;
    }

    /**
     * @param withCardsStructure the withCardsStructure
     */
    public void setWithCardsStructure(boolean withCardsStructure) {
        this.withCardsStructure = withCardsStructure;
    }

    /**
     * @return the withDeliverables
     */
    public boolean isWithDeliverables() {
        return withDeliverables;
    }

    /**
     * @param withDeliverables the withDeliverables
     */
    public void setWithDeliverables(boolean withDeliverables) {
        this.withDeliverables = withDeliverables;
    }

    /**
     * @return the withResources
     */
    public boolean isWithResources() {
        return withResources;
    }

    /**
     * @param withResources the withResources
     */
    public void setWithResources(boolean withResources) {
        this.withResources = withResources;
    }

    /**
     * @return the withStickyNotes
     */
    public boolean isWithStickyNotes() {
        return withStickyNotes;
    }

    /**
     * @param withStickyNotes the withStickyNotes
     */
    public void setWithStickyNotes(boolean withStickyNotes) {
        this.withStickyNotes = withStickyNotes;
    }

    /**
     * @return the withActivityFlow
     */
    public boolean isWithActivityFlow() {
        return withActivityFlow;
    }

    /**
     * @param withActivityFlow the withActivityFlow
     */
    public void setWithActivityFlow(boolean withActivityFlow) {
        this.withActivityFlow = withActivityFlow;
    }

    /**
     * @return the makeOnlyCardTypeReferences
     */
    public boolean isMakeOnlyCardTypeReferences() {
        return makeOnlyCardTypeReferences;
    }

    /**
     * @param makeOnlyCardTypeReferences the makeOnlyCardTypeReferences
     */
    public void setMakeOnlyCardTypeReferences(boolean makeOnlyCardTypeReferences) {
        this.makeOnlyCardTypeReferences = makeOnlyCardTypeReferences;
    }

    // ---------------------------------------------------------------------------------------------
    // concerning the whole class
    // ---------------------------------------------------------------------------------------------

    @Override
    public int hashCode() {
        return new HashCodeBuilder()
            .append(this.withRoles)
            .append(this.withTeamMembers)
            .append(this.withCardTypes)
            .append(this.withCardsStructure)
            .append(this.withDeliverables)
            .append(this.withResources)
            .append(this.withStickyNotes)
            .append(this.withActivityFlow)
            .append(this.makeOnlyCardTypeReferences)
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
        final DuplicationParam other = (DuplicationParam) obj;
        return new EqualsBuilder()
            .append(this.withRoles, other.withRoles)
            .append(this.withTeamMembers, other.withTeamMembers)
            .append(this.withCardTypes, other.withCardTypes)
            .append(this.withCardsStructure, other.withCardsStructure)
            .append(this.withDeliverables, other.withDeliverables)
            .append(this.withResources, other.withResources)
            .append(this.withStickyNotes, other.withStickyNotes)
            .append(this.withActivityFlow, other.withActivityFlow)
            .append(this.makeOnlyCardTypeReferences, other.makeOnlyCardTypeReferences)
            .isEquals();
    }

}
