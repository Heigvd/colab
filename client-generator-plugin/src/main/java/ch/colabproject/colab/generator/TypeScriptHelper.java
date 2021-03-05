/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator;

import ch.colabproject.colab.api.rest.utils.Jsonable;
import java.io.StringReader;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.json.bind.JsonbConfig;
import javax.json.stream.JsonParser;
import javax.validation.constraints.NotNull;
import org.apache.maven.plugin.MojoFailureException;
import org.reflections.Reflections;

/**
 * Some methods to convert java things to typescript ones
 *
 * @author maxence
 */
public class TypeScriptHelper {

    /**
     * never-called private constructor
     */
    private TypeScriptHelper() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    private static String getTsTypeName(Class<?> javaClass) {
        if (Jsonable.class.isAssignableFrom(javaClass)) {
            return Jsonable.getJSONClassName(javaClass);
        } else {
            return javaClass.getSimpleName();
        }
    }

    private static Method getGetter(Class<?> javaClass, String fieldName) {
        String methodName = fieldName.substring(0, 1).toUpperCase()
            + fieldName.substring(1);

        try {
            // default getter looks like getXxxx
            return javaClass.getMethod("get" + methodName);
        } catch (NoSuchMethodException ex2) {
            try {
                // boolean getter may looks liek isXxx
                return javaClass.getMethod("is" + methodName);
            } catch (NoSuchMethodException ex3) {
                return null;
            }
        }

    }

    private static Field getField(Class<?> javaClass, String fieldName) {
        Class<?> declaringClass = javaClass;
        Method getter = getGetter(javaClass, fieldName);

        if (getter != null) {
            declaringClass = getter.getDeclaringClass();
        }
        try {
            return declaringClass.getDeclaredField(fieldName);
        } catch (NoSuchFieldException ex) {
            return null;
        }
    }

    /**
     * Generate typescript interface.This method will populate types map with type required by the
     * generated interface
     *
     * @param javaType    the java type to generate bindings for
     * @param types       list of type this interface required to be generated too
     * @param reflections reflection store to fetch abstract classes /interfaces subtypes
     *
     * @return ts interface or type
     *
     * @throws org.apache.maven.plugin.MojoFailureException if generation fails
     */
    public static String generateInterface(
        Type javaType,
        Map<String, Type> types,
        Reflections reflections
    ) throws MojoFailureException {
        if (javaType instanceof Class<?>) {
            Class<?> javaClass = (Class<?>) javaType;
            String name = getTsTypeName(javaClass);
            StringBuilder sb = new StringBuilder("export ");

            int modifiers = javaClass.getModifiers();
            if (Modifier.isAbstract(modifiers) || Modifier.isInterface(modifiers)) {
                // abstract class
                // Type X = directSubCLass | otherdirectsubclass
                sb.append("type ").append(name).append(" = ")
                    .append(reflections.getSubTypesOf(javaClass).stream()
                        // Only keep direct subtypes
                        .filter(subType -> {
                            return (Modifier.isAbstract(modifiers)
                                && javaClass.equals(subType.getSuperclass()))
                                || (Modifier.isInterface(modifiers)
                                && Arrays.stream(subType.getInterfaces())
                                    .anyMatch(iface -> iface.equals(javaClass)));
                        }
                        )
                        .map(subType -> {
                            String subTypeTsName = getTsTypeName(subType);
                            // make sure to generate interface
                            types.put(subTypeTsName, subType);
                            return subTypeTsName;
                        })
                        .collect(Collectors.joining(" | ")))
                    .append(";\n");
            } else {
                // concrete class
                sb.append("interface ").append(name).append("{\n").append("  '@class': '")
                    .append(name).append("';\n");

                try {
                    Object newInstance = javaClass.getConstructor().newInstance();
                    JsonbConfig withNullValues = new JsonbConfig()
                        .withNullValues(Boolean.TRUE);

                    Jsonb jsonb = JsonbBuilder.create(withNullValues);

                    String json = jsonb.toJson(newInstance);
                    JsonParser parser = Json.createParser(new StringReader(json));
                    parser.next();
                    JsonObject object = parser.getObject();
                    Set<String> keySet = object.keySet();
                    for (String key : keySet) {
                        if (!"@class".equals(key)) {
                            Type propertyType = null;
                            boolean optional = true;

                            Field field = getField(javaClass, key);

                            if (field != null) {
                                optional = field.getAnnotation(NotNull.class) == null;
                                propertyType = field.getGenericType();
                            } else {
                                // unable to find a field, rely on method
                                // no way to detect whether the property is optional
                                Method getter = getGetter(javaClass, key);
                                if (getter != null) {
                                    propertyType = getter.getGenericReturnType();
                                }
                            }

                            sb.append("  '").append(key).append("'");
                            if (optional) {
                                sb.append("?");
                            }
                            sb.append(": ");
                            if (propertyType != null) {
                                String tsType = convertType(propertyType, types);
                                sb.append(tsType);
                            } else {
                                sb.append("unknown");
                            }
                            if (optional) {
                                sb.append(" | undefined | null");
                            }
                            sb.append(";\n");
                        }
                    }
                } catch (RuntimeException
                    | NoSuchMethodException
                    | InstantiationException
                    | IllegalAccessException
                    | InvocationTargetException ex) {
                    throw new MojoFailureException("Something went wrong", ex);
                }
                sb.append("}\n");
            }

            return sb.toString();
        } else {
            return "";
        }
    }

    private static boolean isArrayLike(Type javaType) {
        if (javaType instanceof Class) {
            return Collection.class.isAssignableFrom((Class<?>) javaType);
        }
        return false;
    }

    /**
     * Convert java type to typescript type. this method will populate the curtomTypes map with java
     * type which requires a dedicates TS interface.
     *
     * @param javaType    the java type to convert
     * @param customTypes java type to generate TS interface for
     *
     * @return the typescript type name to use
     */
    public static String convertType(Type javaType, Map<String, Type> customTypes) {
        if (javaType == null) {
            return "undefined";
        } else if (javaType instanceof Class) {
            Class<?> javaClass = (Class<?>) javaType;
            if (Number.class.isAssignableFrom(javaClass)
                || byte.class.isAssignableFrom(javaClass)
                || short.class.isAssignableFrom(javaClass)
                || int.class.isAssignableFrom(javaClass)
                || long.class.isAssignableFrom(javaClass)
                || float.class.isAssignableFrom(javaClass)
                || double.class.isAssignableFrom(javaClass)) {
                return "number";
            } else if (String.class.isAssignableFrom(javaClass)) {
                return "string";
            } else if (boolean.class.isAssignableFrom(javaClass)
                || Boolean.class.isAssignableFrom(javaClass)) {
                return "boolean";
            } else if (void.class.isAssignableFrom(javaClass)) {
                return "void";
            } else if (isArrayLike(javaClass)) {
                return "unknown[]";
            } else if (javaClass.isEnum()) {
                return Arrays.stream(javaClass.getEnumConstants())
                    .map(item -> "'" + item.toString() + "'")
                    .collect(Collectors.joining(" | "));
            } else {
                String name = getTsTypeName(javaClass);
                if (!customTypes.containsKey(name)) {
                    customTypes.put(name, javaType);
                    /* } else { // TODO check collision */
                }
                return name;
            }
        } else if (javaType instanceof ParameterizedType) {
            ParameterizedType genericType = (ParameterizedType) javaType;
            Type rawType = genericType.getRawType();
            Type[] args = genericType.getActualTypeArguments();
            if (isArrayLike(rawType)) {
                return convertType(args[0], customTypes) + "[]";
            } else {
                return "unknown";
            }
        } else {
            return "unknown";
        }
    }
}
