/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package ch.albasim.html.report;

import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Locale;

import org.apache.maven.doxia.sink.Sink;
import org.apache.maven.plugin.logging.Log;
import org.apache.maven.plugins.annotations.LifecyclePhase;
import org.apache.maven.plugins.annotations.Mojo;
import org.apache.maven.plugins.annotations.Parameter;
import org.apache.maven.plugins.annotations.ResolutionScope;
import org.apache.maven.project.MavenProject;
import org.apache.maven.reporting.AbstractMavenReport;
import org.apache.maven.reporting.MavenReportException;

/**
 * TODO:publish to maven central
 *
 * @author maxence
 */
@Mojo(
    name = "html-report",
    defaultPhase = LifecyclePhase.SITE,
    requiresDependencyResolution = ResolutionScope.RUNTIME,
    requiresProject = true,
    threadSafe = true
)
public class HtmlReport extends AbstractMavenReport {

    /**
     * Practical reference to the Maven project
     */
    @Parameter(defaultValue = "${project}", readonly = true, required = true)
    private MavenProject project;

    @Parameter(defaultValue = "${name}", readonly = true, required = true)
    private String name;

    @Parameter(defaultValue = "${description}", readonly = true, required = true)
    private String description;

    @Parameter(defaultValue = "${htmlReportDirectory}", readonly = true, required = true)
    private String htmlReportDirectory;

    @Parameter(defaultValue = "${index}", readonly = true, required = true)
    private String index;

    @Override
    public String getOutputName() {
        return name;
    }

    @Override
    public String getName(Locale locale) {
        return name;
    }

    @Override
    public String getDescription(Locale locale) {
        return description;
    }

    private void deleteFolder(Path path) throws IOException {
        if (Files.exists(path)) {
            Files.walkFileTree(path,
                new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult postVisitDirectory(
                    Path dir, IOException exc) throws IOException {
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFile(
                    Path file, BasicFileAttributes attrs)
                    throws IOException {
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }
            });
        }
    }

    private void copyR(Path source, Path dest) throws IOException {
        if (Files.isDirectory(source)) {
            Files.walk(source).forEach(path -> {
                Path destination = Paths.get(dest.toString(), path.toString()
                    .substring(source.toString().length()));
                try {
                    Files.copy(path, destination, StandardCopyOption.REPLACE_EXISTING);
                } catch (IOException e) {
                    e.printStackTrace();
                }
            });
        }
    }

    private void copyReport() throws IOException {
        Path reportPath = Paths.get(this.htmlReportDirectory);
        Path outputPath = Paths.get(this.outputDirectory.getPath() + "/" + getOutputName());

        getLog().info("Copy report from " + reportPath + " to " + outputPath);
        deleteFolder(outputPath);
        this.copyR(reportPath, outputPath);
    }

    private String getIndexLocation() {
        return name + "/" + index;
    }

    @Override
    protected void executeReport(Locale locale) throws MavenReportException {

        // Get the logger
        Log logger = getLog();

        // Some info
        logger.info("Generating " + getOutputName() + ".html"
            + " for " + project.getName() + " " + project.getVersion());

        try {
            copyReport();

            Sink mainSink = getSink();
            if (mainSink == null) {
                throw new MavenReportException("Could not get the Doxia sink");
            }

            // Page title
            mainSink.head();
            mainSink.title();
            mainSink.text(this.getName(locale) + " Report for " + project.getName() + " " + project.getVersion());
            mainSink.title_();
            mainSink.head_();

            mainSink.body();

            // Heading 1
            mainSink.section1();
            mainSink.sectionTitle1();
            mainSink.text(this.getName(locale) + " Report for " + project.getName() + " " + project.getVersion());
            mainSink.sectionTitle1_();

            // Content
            mainSink.paragraph();
            mainSink.link(getIndexLocation());
            mainSink.text("report");
            mainSink.link("");
            mainSink.paragraph_();

            // Close
            mainSink.section1_();
            mainSink.body_();

        } catch (IOException ex) {
            logger.error("Failed to copy report !", ex);
        }
    }

}
