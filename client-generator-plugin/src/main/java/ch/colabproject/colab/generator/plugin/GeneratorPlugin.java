/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.generator.plugin;

import org.apache.maven.plugin.AbstractMojo;
import org.apache.maven.plugin.MojoExecutionException;
import org.apache.maven.plugin.MojoFailureException;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;

/**
 * Maven plugin to generate REST client. It allows to scan packages by reflections. It looks for
 * Jakarta EE {@link javax.ws.rs.Path} annotations.
 *
 * @author maxence
 */
@Mojo(
    name = "generate",
    defaultPhase = LifecyclePhase.PROCESS_CLASSES,
    requiresDependencyResolution = ResolutionScope.COMPILE
)
public class GeneratorPlugin extends AbstractMojo {

    /**
     * Package to extract REST method from
     */
    @Parameter(property = "generate.restPackages", required = true)
    private String[] restPackages;

    /**
     * Generate java client in this package
     */
    @Parameter(property = "generate.packageName", required = true)
    private String packageName;

    /**
     * Class name of the client to generate
     */
    @Parameter(property = "generate.clientName", required = true)
    private String clientName;

    /**
     * the maven project that will receive the generated clients
     */
    @Parameter(readonly = true, defaultValue = "${project}")
    private MavenProject project;

    /**
     * path of generated java client
     */
    @Parameter(
        property = "generate.javaOutputDir",
        defaultValue = "${project.build.directory}/generated-sources/javaClient"
    )
    private String javaOutputDir;

    /**
     * path of generated typescript client
     */
    @Parameter(
        property = "generate.tsOutputDir",
        defaultValue = "${project.build.directory}/generated-sources/tsClient"
    )
    private String tsOutputDir;

    /**
     * if true, do not generate any file but print classes to console
     */
    private boolean dryRun;

    /**
     * Default constructor.
     */
    public GeneratorPlugin() {
        this(false);
    }

    /**
     * DryRun constructor
     *
     * @param dryRun set dryRun value
     */
    private GeneratorPlugin(boolean dryRun) {
        this.dryRun = dryRun;
    }

    /**
     * {@inheritDoc }
     */
    @Override
    public void execute() throws MojoExecutionException, MojoFailureException {
        Generator generator = new Generator(restPackages, packageName, clientName, getLog());

        generator.processPackages();

        // generate package in the output dir
        generator.generateJavaClient(javaOutputDir, this.dryRun);

        generator.generateTypescriptClient(tsOutputDir, this.dryRun);

        if (!dryRun) {
            // and add it to the current project to make sure the client
            // can be use during this very run
            this.project.addCompileSourceRoot(javaOutputDir);
        }

        // @TODO generate typescript client
        //generator.generateTypescriptClient();
    }

    /**
     * Simple app to test the generator.it will not generate any files but will print output
     *
     * @param args unsed yet
     *
     * @throws org.apache.maven.plugin.MojoExecutionException if ...
     * @throws org.apache.maven.plugin.MojoFailureException   if ...
     */
    public static void main(String... args) throws MojoExecutionException, MojoFailureException {
        GeneratorPlugin generator = new GeneratorPlugin(true);
        generator.packageName = "ch.colabproject.colab.generator";
        generator.clientName = "TestClient";
        String[] p = {"ch.colabproject.colab.api"};

        generator.restPackages = p;

        generator.execute();
    }
}
