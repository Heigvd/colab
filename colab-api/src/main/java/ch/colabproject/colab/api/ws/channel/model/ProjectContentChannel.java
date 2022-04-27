/*
 * The coLAB projectId
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel.model;

import ch.colabproject.colab.api.model.project.Project;
import java.util.Objects;

/**
 * A channel to propagate content of a given projectId.
 * <p>
 * Usage :
 * </p>
 * <p>
 * subscription when a project is edited<br>
 * unsubscription when a project is closed<br>
 * </p>
 * <p>
 * Can be watched by admin in the Who page
 * </p>
 *
 * @author maxence
 */
public class ProjectContentChannel implements WebsocketChannel {

    private static final long serialVersionUID = 1L;

    /**
     * id of the project this channel is about.
     */
    private Long projectId;

    /**
     * ID of the project this channel is about
     *
     * @return the projectId
     */
    public Long getProjectId() {
        return projectId;
    }

    /**
     * Set the projectId
     *
     * @param projectId new projectId
     */
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 53 * hash + Objects.hashCode(this.projectId);
        return hash;
    }

    /**
     * Channel equals if they both refer to the same projectId
     *
     * @param obj other channel
     *
     * @return true if both ContentChannel refer to the same projectId
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null) {
            return false;
        }
        if (getClass() != obj.getClass()) {
            return false;
        }
        final ProjectContentChannel other = (ProjectContentChannel) obj;

        return Objects.equals(this.projectId, other.projectId);
    }

    @Override
    public String toString() {
        return "ProjectContentChannel{" + "projectId=" + this.projectId + '}';
    }

    /**
     * get the channel dedicated to the given project.
     *
     * @param project the project
     *
     * @return the project very own channel
     */
    public static ProjectContentChannel build(Project project) {
        return build(project.getId());
    }

    /**
     * get the channel dedicated to the project having the given id.
     *
     * @param projectId id of the project
     *
     * @return the project very own channel
     */
    public static ProjectContentChannel build(Long projectId) {
        ProjectContentChannel channel = new ProjectContentChannel();
        channel.setProjectId(projectId);
        return channel;
    }
}
