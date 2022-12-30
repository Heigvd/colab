/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.model.tools;

import ch.colabproject.colab.api.Helper;
import org.eclipse.persistence.config.SessionCustomizer;
import org.eclipse.persistence.descriptors.ClassDescriptor;
import org.eclipse.persistence.mappings.DirectToFieldMapping;
import org.eclipse.persistence.sessions.Session;

/**
 * Customize JPA session.
 * <ul>
 * <li> use lowercase with underscore database field names
 * </ul>
 *
 * @author maxence
 */
public class JpaCustomizer implements SessionCustomizer {

    @Override
    public void customize(Session session) throws Exception {
        session.getDescriptors().values().forEach(this::updateFieldNameMapping);
    }

    /**
     * custom field names
     *
     * @param desc mappings to override
     */
    private void updateFieldNameMapping(ClassDescriptor desc) {
        desc.getMappings().stream()
            .filter(mapping -> (mapping.isDirectToFieldMapping()))
            .map(mapping -> (DirectToFieldMapping) mapping)
            .forEachOrdered(directMapping -> {
                // format: table_name.FIELD ->[ tableNane, fieldName];
                String[] names = directMapping.getFieldName().split("\\.");
                if (names.length == 2) {
                    String newName = Helper.camelCaseToUnderscore(directMapping.getAttributeName());
                    directMapping.getField().setName(newName);
                }
            }
            );
    }
}
