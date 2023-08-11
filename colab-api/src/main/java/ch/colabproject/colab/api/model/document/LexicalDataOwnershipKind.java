/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.document;

/**
 * The different kinds of lexical data ownership.
 * <p>
 * WARNING : The keywords are used in YJS server TypeScript code
 *
 * @author sandra
 */
public enum LexicalDataOwnershipKind {
    /**
     * The lexical data are owned by a card content
     */
    // Warning : Do not change the keyword ! It is used in TypeScript code
    CARD_CONTENT("DeliverableOfCardContent"),
    /**
     * The lexical data are owned by a resource
     */
    // Warning : Do not change the keyword ! It is used in TypeScript code
    RESOURCE("PartOfResource");

    /**
     * The keyword referenced in TypeScript code
     */
    // Warning : Do not change the values ! They are used in TypeScript code
    private final String keyword;

    /**
     * Build a LexicalDataOwnership
     *
     * @param keyword The keyword to use in TypeScript code
     */
    LexicalDataOwnershipKind(String keyword) {
        this.keyword = keyword;
    }

    /**
     * @return The keyword to use in TypeScript code
     */
    public String getKeyword() {
        return keyword;
    }
}
