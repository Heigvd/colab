/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.ws.channel;

import ch.colabproject.colab.api.controller.RequestManager;
import ch.colabproject.colab.api.model.project.Project;
import ch.colabproject.colab.api.persistence.user.UserDao;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * A channel to propagate general data about a specific project. Such general information contains:
 * the project object itself, the team composition, and other relevant info when looking at a
 * project from the "outside".
 *
 * @author maxence
 */
public class ProjectOverviewChannel implements WebsocketMetaChannel {

    private static final long serialVersionUID = 1L;

    /**
     * The project this channel is about.
     */
    private Project project;

    /**
     * The project this channel is about
     *
     * @return the project
     */
    public Project getProject() {
        return project;
    }

    /**
     * Set the project
     *
     * @param project new project
     */
    public void setProject(Project project) {
        this.project = project;
    }

    /**
     * Resolve this meta channel to list of effective channels. Project overview shall be sent to
     * all team members. It shall be sent to all admin too.
     *
     * @return set of USerChannel, one for each project member
     */
    @Override
    public Set<WebsocketEffectiveChannel> resolve(UserDao userDao, RequestManager requestManager) {
        Set<WebsocketEffectiveChannel> channels = new HashSet<>();
        if (this.project != null) {
            // get channel of each team member
            channels.addAll(
                this.project.getTeamMembers().stream()
                    // filter out pending invitation
                    .filter(member -> member.getUser() != null)
                    .map(member -> member.getUser().getEffectiveChannel())
                    .collect(Collectors.toSet()));
        }

        // add all admin user channels
        channels.addAll((new AdminChannel()).resolve(userDao, requestManager));

        return channels;
    }

    @Override
    public int hashCode() {
        int hash = 7;
        hash = 13 * hash + Objects.hashCode(this.project);
        return hash;
    }

    /**
     * Channel equals if they both refer to the same project
     *
     * @param obj other channel
     *
     * @return true if both OverviewChannel refer to the same project
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
        final ProjectOverviewChannel other = (ProjectOverviewChannel) obj;

        return Objects.equals(this.project, other.project);
    }

    /**
     * get the channel dedicated to the given project.
     *
     * @param project the project
     *
     * @return the project very own channel
     */
    public static ProjectOverviewChannel build(Project project) {
        ProjectOverviewChannel channel = new ProjectOverviewChannel();
        channel.setProject(project);
        return channel;
    }
}
