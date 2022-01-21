/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin;

import ch.colabproject.colab.generator.model.interfaces.WithJsonDiscriminator;
import ch.colabproject.colab.generator.model.tools.ClassDoc;
import ch.colabproject.colab.generator.plugin.rest.ErrorHandler;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.StringReader;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.time.temporal.Temporal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import javax.json.Json;
import javax.json.JsonObject;
import javax.json.bind.Jsonb;
import javax.json.bind.JsonbBuilder;
import javax.json.bind.JsonbConfig;
import javax.json.stream.JsonParser;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.ws.rs.core.Response;
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
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    private static String getTsTypeName(Class<?> javaClass) {
        if (WithJsonDiscriminator.class.isAssignableFrom(javaClass)) {
            return WithJsonDiscriminator.getJsonDiscriminator(javaClass);
        } else {
            Logger.warn("Consider to implement WithJsonDiscriminator: "
                + javaClass.getSimpleName());
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
     * @param inheritance this method will populate this map will known implementation
     * @param reflections reflection store to fetch abstract classes /interfaces directSubtypes
     * @param javadoc     javadoc as extracted by the JavaDocEtractor
     *
     * @return ts interface or type
     *
     * @throws org.apache.maven.plugin.MojoFailureException if generation fails
     */
    public static String generateInterface(
        Type javaType,
        Map<String, Type> types,
        Map<String, List<String>> inheritance,
        Reflections reflections,
        Map<String, ClassDoc> javadoc
    ) throws MojoFailureException {
        if (javaType instanceof Class<?>) {
            Class<?> javaClass = (Class<?>) javaType;
            String name = getTsTypeName(javaClass);
            if (javaClass.isArray()) {
                // hack: remove []
                name = name.replace("[]", "");
            }
            StringBuilder sb = new StringBuilder();

            int modifiers = javaClass.getModifiers();

            if (javaClass.isEnum()) {
                String joinType = Arrays.stream(javaClass.getEnumConstants())
                    .map(item -> "'" + item.toString() + "'")
                    .collect(Collectors.joining(" | "));
                sb.append("export type ").append(name).append(" = ")
                    .append(joinType).append(";\n");
            } else if (Modifier.isAbstract(modifiers) || Modifier.isInterface(modifiers)) {
                // abstract class
                // Type X = directSubCLass | otherdirectsubclass

                List<String> allConcreteSubtypes = reflections.getSubTypesOf(javaClass).stream()
                    .filter(subType
                        -> !Modifier.isAbstract(subType.getModifiers())
                    && !Modifier.isInterface(subType.getModifiers())
                    )
                    .map(subType -> getTsTypeName(subType))
                    .collect(Collectors.toList());
                inheritance.put(name, allConcreteSubtypes);

                String directSubtypes = reflections.getSubTypesOf(javaClass).stream()
                    // Only keep direct directSubtypes
                    .filter(subType -> {
                        return (Modifier.isAbstract(modifiers)
                            && javaClass.equals(subType.getSuperclass()))
                            || (Modifier.isInterface(modifiers)
                            && Arrays.stream(subType.getInterfaces())
                                .anyMatch(iface -> iface.equals(javaClass)));
                    })
                    .map(subType -> {
                        String subTypeTsName = getTsTypeName(subType);
                        // make sure to generate interface
                        types.put(subTypeTsName, subType);
                        return subTypeTsName;
                    })
                    .collect(Collectors.joining(" | "));

                sb.append("export type ").append(name).append(" = ")
                    .append(directSubtypes == null || directSubtypes.isBlank() ? " never"
                        : directSubtypes)
                    .append(";\n");
            } else {
                inheritance.put(name, new ArrayList<>());
                inheritance.get(name).add(name);

                // concrete class
                ///////////////////////////////
                ClassDoc classDoc = javadoc.get(javaClass.getName());
                Map<String, String> fields = null;
                // javadoc
                sb.append("/**\n");
                if (classDoc != null) {
                    sb.append(classDoc.getDoc());
                    fields = classDoc.getFields();
                } else {
                    Logger.warn("No javadoc for class " + name);
                }
                sb.append("*/\n");

                sb.append("export interface ").append(name).append("{\n");

                if (WithJsonDiscriminator.class.isAssignableFrom(javaClass)) {
                    sb.append("  '@class': '").append(name).append("';\n");
                }

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
                                optional
                                    = (field.getAnnotation(NotNull.class) == null)
                                    && (field.getAnnotation(NotEmpty.class) == null)
                                    && (field.getAnnotation(NotBlank.class) == null);
                                propertyType = field.getGenericType();
                            } else {
                                // unable to find a field, rely on method
                                // no way to detect whether the property is optional
                                Method getter = getGetter(javaClass, key);
                                if (getter != null) {
                                    propertyType = getter.getGenericReturnType();
                                }
                            }
                            if (fields != null) {
                                String fieldDoc = fields.getOrDefault(key, "");
                                sb.append("  /**\n  ").append(fieldDoc).append("  */\n");
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

    private static boolean isMap(Type javaType) {
        if (javaType instanceof Class) {
            return Map.class.isAssignableFrom((Class<?>) javaType);
        }
        return false;
    }

    /**
     * Convert java type to typescript type. this method will populate the customTypes map with java
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
                || double.class.isAssignableFrom(javaClass)
                || Temporal.class.isAssignableFrom(javaClass)) {
                return "number";
            } else if (String.class.isAssignableFrom(javaClass)) {
                return "string";
            } else if (boolean.class.isAssignableFrom(javaClass)
                || Boolean.class.isAssignableFrom(javaClass)) {
                return "boolean";
            } else if (void.class.isAssignableFrom(javaClass)) {
                return "void";
            } else if (InputStream.class.isAssignableFrom(javaClass)
                || OutputStream.class.isAssignableFrom(javaClass)
                || File.class.isAssignableFrom(javaClass)) {
                return "File";
            } else if (Response.class.isAssignableFrom(javaClass)) {
                return "HttpResponse";
            } else if (ErrorHandler.class.isAssignableFrom(javaClass)) {
                return "ErrorHandler";
            } else if (isArrayLike(javaClass)) {
                return "unknown[]";
//            } else if (javaClass.isEnum()) {
//                return Arrays.stream(javaClass.getEnumConstants())
//                    .map(item -> "'" + item.toString() + "'")
//                    .collect(Collectors.joining(" | "));
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
            } else if (isMap(rawType)) {
                return "{"
                    + "[key: " + convertType(args[0], customTypes) + "]: "
                    + convertType(args[1], customTypes)
                    + "}";
            } else {
                return "unknown";
            }
        } else {
            return "unknown";
        }
    }
}
