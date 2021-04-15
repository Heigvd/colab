/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator;

import ch.colabproject.colab.generator.plugin.TypeScriptHelper;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

/**
 *
 * @author maxence
 */
public class TypeScriptHelperTest {

    public TypeScriptHelperTest() {
    }

    enum TestEnum {
        ITEM_1,
        ITEM_2
    }

    /**
     * used to fetch a GenericReturnType
     *
     * @return empty list
     */
    public List<String> getList() {
        return new ArrayList<>();
    }

    /**
     * used to fetch a GenericReturnType
     *
     * @return empty map
     */
    public Map<String, Double> getMap() {
        return new HashMap<>();
    }

    @Test
    public void testConvertTypeToNative() throws NoSuchMethodException {
        Map<String, Type> customTypes = new HashMap<>();

        Assertions.assertEquals("string",
            TypeScriptHelper.convertType(String.class, customTypes));

        Assertions.assertEquals("number",
            TypeScriptHelper.convertType(Double.class, customTypes));
        Assertions.assertEquals("number",
            TypeScriptHelper.convertType(Float.class, customTypes));
        Assertions.assertEquals("number",
            TypeScriptHelper.convertType(Integer.class, customTypes));
        Assertions.assertEquals("number",
            TypeScriptHelper.convertType(Long.class, customTypes));

        Assertions.assertEquals("number",
            TypeScriptHelper.convertType(Short.class, customTypes));

        Assertions.assertEquals("'ITEM_1' | 'ITEM_2'",
            TypeScriptHelper.convertType(TestEnum.class, customTypes));

        Assertions.assertEquals("unknown[]",
            TypeScriptHelper.convertType(ArrayList.class, customTypes));

        Type genericList = this.getClass().getDeclaredMethod("getList").getGenericReturnType();
        Assertions.assertEquals("string[]",
            TypeScriptHelper.convertType(genericList, customTypes));

        Type genericMap = this.getClass().getDeclaredMethod("getMap").getGenericReturnType();
        Assertions.assertEquals("{[key: string]: number}",
            TypeScriptHelper.convertType(genericMap, customTypes));
    }
}
