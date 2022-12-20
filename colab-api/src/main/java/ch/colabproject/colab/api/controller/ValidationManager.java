/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.controller;

import ch.colabproject.colab.api.model.ColabEntity;
import ch.colabproject.colab.generator.model.exceptions.HttpErrorMessage;
import java.util.Set;
import jakarta.ejb.LocalBean;
import jakarta.ejb.Stateless;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
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
            throw HttpErrorMessage.dataIntegrityFailure();
        }
    }

}
