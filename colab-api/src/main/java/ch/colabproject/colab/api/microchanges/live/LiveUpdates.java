/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
package ch.colabproject.colab.api.microchanges.live;

import ch.colabproject.colab.api.microchanges.model.Change;
import ch.colabproject.colab.api.microchanges.model.MicroChange;
import ch.colabproject.colab.api.microchanges.model.MicroChange.Type;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Set of pending changes.
 *
 * @author maxence
 */
public class LiveUpdates implements Serializable {

    private static final long serialVersionUID = 1L;

    /** Logger */
    private static final Logger logger = LoggerFactory.getLogger(LiveUpdates.class);

    /**
     * JsonDiscriminator to fetch the class this change targets
     */
    private String targetClass;

    /**
     * Id of the object this change targets
     */
    private Long targetId;

    /**
     * initial revision of content
     */
    private String revision;

    /**
     * root content
     */
    private String content;

    /**
     * List of pending changes
     */
    private List<Change> pendingChanges = new ArrayList<>();

    /**
     * Get the JSON discriminator
     *
     * @return JSON discriminator
     */
    public String getTargetClass() {
        return targetClass;
    }

    /**
     * Set the JSON discriminator
     *
     * @param targetClass new discriminator
     */
    public void setTargetClass(String targetClass) {
        this.targetClass = targetClass;
    }

    /**
     * The object id.
     *
     * @return the id of the object
     */
    public Long getTargetId() {
        return targetId;
    }

    /**
     * set object id
     *
     * @param targetId object id
     */
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    /**
     * Get the revision
     *
     * @return the revision
     */
    public String getRevision() {
        return revision;
    }

    /**
     * Set the revision
     *
     * @param revision the revision
     */
    public void setRevision(String revision) {
        this.revision = revision;
    }

    /**
     * Get initial "root" content
     *
     * @return the root content
     */
    public String getContent() {
        return content;
    }

    /**
     * Set initial content
     *
     * @param content the content
     */
    public void setContent(String content) {
        this.content = content;
    }

    /**
     * Get the list of pending changes
     *
     * @return changes
     */
    public List<Change> getPendingChanges() {
        return pendingChanges;
    }

    /**
     * set the list of pending changes
     *
     * @param pendingChanges changes
     */
    public void setPendingChanges(List<Change> pendingChanges) {
        this.pendingChanges = pendingChanges;
    }

    /**
     * Get changes which are direct children of given parent
     *
     * @param changes all changes
     * @param basedOn parent id
     *
     * @return all changes which are based on the given parentId
     */
    public List<Change> getByParent(List<Change> changes, String basedOn) {
        List<Change> collect = changes.stream()
            .filter(ch -> ch.getBasedOn().equals(basedOn))
            .collect(Collectors.toList());
        return new ArrayList<Change>(collect);
    }

    /**
     * Get changes which are direct children of the given parent, authored by the same live-session.
     * This method is used to detect if a live session has diverged.
     *
     * @param changes list of changes
     * @param parent  parent
     *
     * @return children of parent if they are authored by the same person
     */
    public List<Change> getByParentAndSession(List<Change> changes, Change parent) {
        logger.trace("Get Children By Parent And Session");

        List<Change> collect = changes.stream()
            .filter(ch -> ch.getBasedOn().equals(parent.getRevision())
            && ch.getLiveSession().equals(parent.getLiveSession()))
            .collect(Collectors.toList());
        return new ArrayList<Change>(collect);
    }

    /**
     * Include new offset within the map.
     *
     * @param offsets offsets mapped by indexes
     * @param index   new offset index
     * @param value   new offset value
     */
    private void modifyOffset(Map<Integer, Integer> offsets, Integer index, Integer value) {
        Integer currentOffset = offsets.get(index);
        if (currentOffset == null) {
            currentOffset = 0;
        }
        currentOffset += value;
        logger.trace("  modOffset.start " + offsets);

        offsets.put(index, currentOffset);

        logger.trace("  modOffset.second " + offsets);

        Map<Integer, Integer> modified = new HashMap<>();

        // shift offsets after current index
        for (var entry : offsets.entrySet()) {
            Integer key = entry.getKey();

            if (key > index && key < index + value) {
                logger.trace("CONFLIT");
            }
            if (key > index) {
                // move offset to new index
                Integer v = entry.getValue();
                if (v != null) {
                    int newKey = key + value;
                    int newValue = v;
                    if (offsets.containsKey(newKey)) {
                        newValue = offsets.get(newKey) + newValue;
                    }
                    modified.put(key, 0);
                    modified.put(newKey, newValue);
                }
            }
        }

        logger.trace("  modOffset.third " + modified);

        // merge shifted offsets
        for (var entry : modified.entrySet()) {
            Integer key = entry.getKey();
            int current = entry.getValue();
            offsets.put(key, current);
        }

        logger.trace(" mod Offsets.done " + offsets);
    }

    /**
     * Apply microchange to the buffer
     *
     * @param buffer the buffet
     * @param mu     the patch
     */
    private void applyChange(StringBuilder buffer, MicroChange mu) {
        logger.trace("Apply {} to {}", mu, buffer);
        if (mu.getT() == MicroChange.Type.D) {
            if (mu.getO() < buffer.length()) {
                buffer.length();
                buffer.delete(mu.getO(), mu.getO() + mu.getL());
            } else {
                logger.trace("Skip micro change");
            }
        } else if (mu.getT() == MicroChange.Type.I) {
            if (mu.getO() >= buffer.length()) {
                buffer.append(mu.getV());
            } else {
                buffer.insert(mu.getO(), mu.getV());
            }
        }
    }

    /**
     * Compute offset the set of microchanges will generate.
     * <li>2:20 means 20 characters are added at index 2
     * <li>5:-10 means 10 characters are removed from index 5
     *
     * @param change set of microchanges
     *
     * @return offset mapped by index
     */
    private Map<Integer, Integer> computeOffset(Change change) {
        Map<Integer, Integer> offsets = new HashMap<>();

        List<MicroChange> muChanges = change.getMicrochanges();
        for (int i = muChanges.size() - 1; i >= 0; i--) {
            MicroChange mu = muChanges.get(i);
            if (mu.getT() == MicroChange.Type.D) {
                modifyOffset(offsets, mu.getO() + mu.getL(), -mu.getL());
            } else if (mu.getT() == MicroChange.Type.I) {
                modifyOffset(offsets, mu.getO(), mu.getV().length());
            }
        }

        return offsets;
    }

    /**
     * Modify microchange to reflect given offsets
     *
     * @param change  changes to update
     * @param offsets offsets, mapped by indexes
     * @param forward shif if true, unshift otherwise
     *
     * @return true if operation was successful, false if there ws some conflict
     */
    private boolean shift(Change change, Map<Integer, Integer> offsets, boolean forward) {
        boolean conflictFree = true;
        if (forward == false) {
            logger.warn("TODO: implement backward shift");
        }
        //int way = forward ? 1 : -1; // TODO

        logger.trace("Shift offsets: {}", change);
        List<MicroChange> microchanges = change.getMicrochanges();
        for (int i = 0; i < microchanges.size(); i++) {
            MicroChange mu = microchanges.get(i);

            for (Map.Entry<Integer, Integer> entry : offsets.entrySet()) {
                Integer offsetValue = entry.getValue();
                Integer offsetIndex = entry.getKey();

                int muStart = mu.getO();

                if (offsetValue > 0 && mu.getT().equals(Type.I)) {
                    // both are insetion
                    if (mu.getO() >= offsetIndex) {
                        // changes is after the first insertion => shift it
                        mu.setO(mu.getO() + offsetValue);
                    }
                } else if (offsetValue < 0 && mu.getT().equals(Type.D)) {
                    // both are deletion
                    int deleteFromIndex = offsetIndex + offsetValue;
                    int deleteToIndex = offsetIndex;
                    int muEnd = muStart + mu.getL();

                    // nothing to do if mu is complely before offset
                    if (muEnd >= deleteFromIndex) {
                        // mu is completely before offset
                        // nothing to do
                        if (muStart > deleteToIndex) {
                            // mu is completely after offset
                            // just shift mu
                            mu.setO(mu.getO() + offsetValue);
                        } else {
                            // deletions overlap
                            if (muStart <= deleteFromIndex && muEnd >= deleteToIndex) {
                                // mu wraps offset
                                // off          |---|
                                // mu       |---------|
                                // new mu   |---     -|
                                mu.setL(mu.getL() + offsetValue);
                            } else if (muStart >= deleteFromIndex && muEnd <= deleteToIndex) {
                                // offset wraps mu => mus is useless
                                // off       |---------|
                                // mu          |---|
                                // new mu    canceled
                                microchanges.remove(i);
                                i--;
                            } else if (muStart <= deleteFromIndex && muEnd <= deleteToIndex) {
                                // partial overlap
                                // off       |-----|
                                // mu     |-----|
                                // new mu |--|
                                mu.setL(deleteFromIndex - muStart);
                            } else if (muStart >= deleteFromIndex && muEnd >= deleteToIndex) {
                                // partial overlap
                                // off    |-----|
                                // mu        |-----|
                                // new mu       |--| shifted at offsetStart
                                mu.setL(muEnd - deleteToIndex);
                                mu.setO(deleteFromIndex);
                            } else {
                                logger.error("Unhandled case offset{}:{}, mu:{}",
                                    deleteFromIndex, offsetValue, mu);
                            }
                        }
                    }
                } else if (offsetValue < 0 && mu.getT().equals(Type.I)) {
                    // offset is deletion, mu is addition
                    int deleteFromIndex = offsetIndex + offsetValue;
                    int deleteToIndex = offsetIndex;

                    if (muStart >= deleteToIndex) {
                        // off    |-----|
                        // mu               |+++++|
                        // just shift to the left
                        mu.setO(mu.getO() + offsetValue);
                    } else if (muStart > deleteFromIndex) {
                        // off         |-----|
                        // mu            |+|
                        // mu          |+|
                        mu.setO(deleteFromIndex);
//                    } else {
                        // mu is before offset
                        // off         |-----|
                        // mu     |+|
                        // nothing to do
                    }
                } else if (offsetValue > 0 && mu.getT().equals(Type.D)) {
                    // offset is addition, mu is deletion
                    int muEnd = muStart + mu.getL();

                    // nothing to do if mu is completely before offset
                    if (muEnd >= offsetIndex) {
                        if (muStart > offsetIndex) {
                            // off   |+|
                            // mu         |---|
                            // new mu : shift
                            mu.setO(mu.getO() + offsetValue);
                        } else {
                            // off        |+|
                            // mu      |--------|
                            // new v1  |--|  |--|
                            // split mu to preserve addition
                            Integer totalLength = mu.getL();
                            mu.setL(offsetIndex - muStart);
                            MicroChange newMu = new MicroChange();
                            newMu.setT(Type.D);
                            newMu.setO(offsetIndex + offsetValue);
                            newMu.setL(totalLength - mu.getL());
                            microchanges.add(i + 1, newMu);
                            i++;
                        }
                    }
                }
            }
        }

        logger.trace(
            "Shift done: {}", change);

        return conflictFree;
    }

    /**
     * Compute shifed offset by reflecting changes.
     *
     * @param offsets original offsets
     * @param change  change
     *
     * @return new map of shifted offsets
     */
    private Map<Integer, Integer> shiftOffsets(Map<Integer, Integer> offsets, Change change) {
        Map<Integer, Integer> shifted = new HashMap<>();

        for (Map.Entry<Integer, Integer> entry : offsets.entrySet()) {
            Integer offsetIndex = entry.getKey();
            Integer offsetValue = entry.getValue();

            List<MicroChange> muChanges = change.getMicrochanges();
            for (int i = muChanges.size() - 1; i >= 0; i--) {
                MicroChange mu = muChanges.get(i);
                if (mu.getT() == MicroChange.Type.D) {
                    offsetIndex -= mu.getL();
                } else if (mu.getT() == MicroChange.Type.I) {
                    offsetIndex += mu.getV().length();
                }
            }
            shifted.put(offsetIndex, offsetValue);
        }

        return shifted;
    }

    /**
     * Propagate offset to children
     *
     * @param parent  starting point
     * @param offsets offset to propagate
     *
     * @return conflict free propagation or not
     */
    private boolean propagateOffsets(List<Change> changes, Change parent, Map<Integer, Integer> offsets, boolean forward) {
        boolean conflictFree = true;

        for (Change child : getByParentAndSession(changes, parent)) {
            // should propagate to children from same LiveSession only
            boolean shiftFree = this.shift(child, offsets, forward);
            Map<Integer, Integer> shiftedOffsets = shiftOffsets(offsets, child);
            boolean pFree = this.propagateOffsets(changes, child, shiftedOffsets, forward);
            conflictFree = conflictFree && shiftFree && pFree;
        }
        return conflictFree;
    }

    /**
     * Move a change to a new base.
     *
     * @param newBase
     * @param change
     * @param offsets
     *
     * @return true if rebase has been done without conflict
     */
    private boolean rebase(Change newBase, Change change) {
        if (newBase.getBasedOn().equals(change.getBasedOn())) {
            Map<Integer, Integer> offsets = computeOffset(newBase);
            boolean conflictFree = true;

            logger.trace("Rebase Sieblings: " + change + " on " + newBase
                + " with offset " + offsets);

            change.setBasedOn(newBase.getRevision());

            conflictFree = shift(change, offsets, true) && conflictFree;
            conflictFree = propagateOffsets(pendingChanges, change,
                offsets, true) && conflictFree;
            logger.trace(" -> " + change);
            return conflictFree;
        } else if (newBase.getBasedOn().equals(change.getRevision())) {
            logger.trace("Inverse hierachy : " + change + " on " + newBase);
            // [x] -> change -> newBase
            // ==>[x] ->  newBase -> change

            boolean conflictFree = true;

            Map<Integer, Integer> changeOffsets = computeOffset(change);

            newBase.setBasedOn(change.getBasedOn());
            change.setBasedOn(newBase.getRevision());

            conflictFree = shift(newBase, changeOffsets, false) && conflictFree;

            Map<Integer, Integer> newBaseOffsets = computeOffset(newBase);
            conflictFree = shift(change, newBaseOffsets, true) && conflictFree;

            logger.trace(" with offsets " + changeOffsets + " and " + newBaseOffsets);
            logger.trace(" -> " + change);

            return conflictFree;
        } else {
            logger.error("Changes must be sieblings or newBase must be a child of change");
            return false;
        }
    }

    /**
     * FIlter list of change and return only those which match the given live session
     *
     * @param changes list of changes
     * @param author  live-session id
     *
     * @return list of changes authored by the given author
     */
    public List<Change> filterByAuthor(List<Change> changes, String author) {
        return changes.stream()
            .filter(child
                -> child.getLiveSession().equals(author))
            .collect(Collectors.toList());
    }

    /**
     * Apply all changes.
     *
     * @param strict to be implemented: fail when there is some conflicts or not
     *
     * @return up-to date content
     */
    public LiveResult process(boolean strict) {
        StringBuilder buffer = new StringBuilder();
        if (this.content != null) {
            buffer.append(this.content);
        }

        logger.trace("Process: {}", this);

        String currentRevision = this.revision;

        List<Change> changes = this.getPendingChanges();

        while (!changes.isEmpty()) {
            // fetch all changes based on the current revision
            List<Change> children = getByParent(changes, currentRevision);
            if (!children.isEmpty()) {
                //Map<Integer, Integer> offsets = new HashMap<>();
                //logger.trace("new empty offsets " + offsets);

                // apply first child only
                Change change = children.remove(0);
                changes.remove(change);

                logger.trace("Process: {}", change);

                List<MicroChange> muChanges = change.getMicrochanges();
                for (int i = muChanges.size() - 1; i >= 0; i--) {
                    applyChange(buffer, muChanges.get(i));
                    logger.trace("  " + i + ")" + buffer);
                }

                logger.trace(" -> {}", buffer);
                //logger.trace("Offsets" + offsets);
                // rebase others children

                changes.removeAll(children);
                for (int i = children.size() - 1; i >= 0; i--) {
                    Change child = children.remove(i);
                    if (!rebase(change, child) && strict) {
                        // todo throw ?
                        logger.error("Conflict");
                    }
                    changes.add(0, child);
                }
                currentRevision = change.getRevision();

            } else {
                logger.error("Some children without any parents left: {}", changes);
                break;
            }
        }

        return LiveResult.build(buffer.toString(), currentRevision);
    }

    @Override
    public String toString() {
        return "LiveUpdates{" + "targetClass=" + targetClass + ", targetId=" + targetId + ", revision=" + revision + ", content=" + content + ", pendingChanges=" + pendingChanges + '}';
    }
}
