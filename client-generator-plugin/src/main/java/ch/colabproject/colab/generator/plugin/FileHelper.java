/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;

/**
 * @author maxence
 */
public class FileHelper {

    /**
     * never-called private constructor
     */
    private FileHelper() {
        throw new UnsupportedOperationException(
            "This is a utility class and cannot be instantiated");
    }

    /**
     * Read file as string
     *
     * @param path path of the file to read
     *
     * @return file content or null if file does not exists
     */
    public static String readFile(String path) {
        try {
            InputStream stream = FileHelper.class.getClassLoader().getResourceAsStream(path);
            byte[] buffer = stream.readAllBytes();
            return Charset.defaultCharset().decode(ByteBuffer.wrap(buffer)).toString();
        } catch (IOException ex) {
            return null;
        }
    }
}
