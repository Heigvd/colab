/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.model.tools;


import ch.colabproject.colab.generator.model.annotations.ExtractJavaDoc;
import java.io.IOException;
import java.io.InputStream;
import java.io.Writer;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.enterprise.util.TypeLiteral;
import javax.json.bind.Jsonb;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ExecutableElement;
import javax.lang.model.element.PackageElement;
import javax.lang.model.element.TypeElement;
import javax.lang.model.element.VariableElement;
import javax.persistence.Entity;
import javax.tools.Diagnostic.Kind;
import javax.tools.FileObject;
import javax.tools.StandardLocation;
import javax.ws.rs.Path;

/**
 * Annotations Processor to extract Javadoc of REST endpoints and JPA entities.
 *
 * @author maxence
 */
@SupportedSourceVersion(SourceVersion.RELEASE_11)
@SupportedAnnotationTypes({"javax.ws.rs.Path", "javax.persistence.Entity"})
public class JavaDocExtractor extends AbstractProcessor {

    /**
     * Store
     */
    private final Map<String, ClassDoc> data = new HashMap<>();

    /**
     *
     * @param element element to extract javadoc from
     *
     * @return the javadoc
     */
    private String getJavaDoc(Element element) {
        String docComment = processingEnv.getElementUtils().getDocComment(element);
        if (docComment != null) {
            return docComment.replaceAll("@author[^\n]*\n", "");
        } else {
            return null;
        }
    }

    /**
     * get the classDoc instance which match the given element,
     *
     * @param element element to analyse
     *
     * @return the classDoc to use for {@code element}
     */
    private ClassDoc getClassDoc(Element element) {
        if (element instanceof TypeElement) {
            final TypeElement typeElement = (TypeElement) element;
            final PackageElement packageElement
                = (PackageElement) typeElement.getEnclosingElement();
            String packageName = packageElement.getQualifiedName().toString();
            String className = typeElement.getSimpleName().toString();

            String fullName = packageName + "." + className;

            if (!this.data.containsKey(fullName)) {
                String javadoc = this.getJavaDoc(element);

                ClassDoc classDoc = new ClassDoc();

                classDoc.setDoc(javadoc);
                classDoc.setPackageName(packageName);
                classDoc.setClassName(className);

                this.data.put(fullName, classDoc);
            }

            return this.data.get(fullName);

        } else if (element != null) {
            return getClassDoc(element.getEnclosingElement());
        } else {
            processingEnv.getMessager().printMessage(
                Kind.ERROR,
                "Error while extracting class javadoc");
            return null;
        }
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        /*
         * Process REST endpoints
         */
        for (final Element element : roundEnv.getElementsAnnotatedWith(Path.class)) {
            final ClassDoc classDoc = this.getClassDoc(element);
            final Map<String, String> methods = classDoc.getMethods();

            if (element instanceof TypeElement) {
                final TypeElement typeElement = (TypeElement) element;
                typeElement.getEnclosedElements().stream().flatMap(elem -> {
                    if (elem instanceof ExecutableElement) {
                        return Stream.of((ExecutableElement) elem);
                    } else {
                        return Stream.of();
                    }
                }).forEach(methodElement -> {
                    String name = methodElement.getSimpleName().toString();
                    if (methods.containsKey(name)) {
                        processingEnv.getMessager().printMessage(
                            Kind.ERROR,
                            "Duplicate methods: " + classDoc.getFullName() + "::" + name);
                    } else {
                        methods.put(name, getJavaDoc(methodElement));
                    }
                });
            }
        }

        /*
         * Process @Entity & @ExtractJavadoc
         */

        Set<Element> elements = new HashSet<>();
        elements.addAll(roundEnv.getElementsAnnotatedWith(Entity.class));
        elements.addAll(roundEnv.getElementsAnnotatedWith(ExtractJavaDoc.class));

        for (final Element element : elements) {
            if (element instanceof TypeElement) {
                final ClassDoc classDoc = this.getClassDoc(element);
                final Map<String, String> fields = classDoc.getFields();
                element.getEnclosedElements().stream().flatMap(elem -> {
                    if (elem instanceof VariableElement) {
                        return Stream.of((VariableElement) elem);
                    } else {
                        return Stream.of();
                    }
                }).forEach(methodElement -> {
                    String name = methodElement.getSimpleName().toString();
                    if (fields.containsKey(name)) {
                        processingEnv.getMessager().printMessage(
                            Kind.ERROR,
                            "Duplicate field: " + classDoc.getFullName() + "::" + name);
                    } else {
                        fields.put(name, getJavaDoc(methodElement));
                    }
                });
            }
        }

        if (roundEnv.processingOver()) {
            processingEnv.getMessager().printMessage(Kind.NOTE, "WRITE IT");

            try {
                final FileObject fileObject = processingEnv.getFiler().createResource(
                    StandardLocation.SOURCE_OUTPUT,
                    "ch.colabproject.colab.generator.json", "javadoc.json");

                try (Writer writer = fileObject.openWriter()) {
                    Jsonb jsonb = JsonbProvider.getJsonb();
                    writer.append(jsonb.toJson(this.data));
                }
            } catch (IOException ex) {
                processingEnv.getMessager().printMessage(
                    Kind.ERROR,
                    "Error while writing javadoc to JSON file");
            }
        }
        return true;
    }

    /**
     * Load javadoc from generated json.
     *
     * @return class doc maps by full class names
     */
    public static Map<String, ClassDoc> loadJavaDocFromJson() {
        InputStream resourceAsStream = JavaDocExtractor.class
            .getClassLoader()
            .getResourceAsStream("ch/colabproject/colab/generator/json/javadoc.json");
        return JsonbProvider.getJsonb().fromJson(resourceAsStream,
            (new TypeLiteral<HashMap<String, ClassDoc>>() {
            }).getType());
    }
}
