/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import ch.colabproject.colab.generator.model.exceptions.MessageI18nKey;
import java.util.Set;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;
import javax.validation.ConstraintViolation;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Entity validation management
 *
 * @author sandra
 */
@Stateless
@LocalBean
public class ValidationManager {

    /** logger */
    private static final Logger logger = LoggerFactory.getLogger(ValidationManager.class);

    /**
     * the validator factory
     */
    private ValidatorFactory factory = Validation.buildDefaultValidatorFactory();

    /**
     * Ascertain that the given entity is valid according to its JPA constraints.
     *
     * @param <T>    type of the entity
     * @param entity What we want to validate
     *
     * @throws HttpErrorMessage if the given entity is not valid
     */
    public <T extends ColabEntity> void assertValid(T entity) {
        Validator validator = factory.getValidator();

        Set<ConstraintViolation<T>> validationErrors = validator.validate(entity);

        if (!validationErrors.isEmpty()) {
            logger.info("{} not valid : {}", entity, validationErrors);
            throw HttpErrorMessage.dataError(MessageI18nKey.DATA_INTEGRITY_FAILURE);
        }
    }

}
