/*globals define*/
/*eslint-env node, browser*/

/**
 * A module representing a PluginResult.
 *
 * @author lattmann / https://github.com/lattmann
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['plugin/PluginMessage', 'plugin/PluginResultBase'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('./PluginMessage'), require('./PluginResultBase'));
    }
}(function (PluginMessage, PluginResultBase) {
    'use strict';

    /**
     * Initializes a new instance of a plugin result object.
     *
     * Note: this object is JSON serializable see serialize method.
     *
     * @param config - deserializes an existing configuration to this object.
     * @constructor
     * @augments PluginResultBase
     * @alias PluginResult
     */
    var PluginResult = function (config) {
        var pluginMessage,
            i;
        if (config) {
            this.success = config.success;
            this.pluginName = config.pluginName;
            this.pluginId = config.pluginId;
            this.startTime = config.startTime;
            this.finishTime = config.finishTime;
            this.messages = [];
            this.artifacts = config.artifacts;
            this.error = config.error;
            this.commits = config.commits;
            this.projectId = config.projectId;

            for (i = 0; i < config.messages.length; i += 1) {
                if (config.messages[i] instanceof PluginMessage) {
                    pluginMessage = config.messages[i];
                } else {
                    pluginMessage = new PluginMessage(config.messages[i]);
                }
                this.messages.push(pluginMessage);
            }
        } else {
            this.success = false;
            this.messages = []; // array of PluginMessages
            this.artifacts = []; // array of hashes
            this.pluginName = 'PluginName N/A';
            this.startTime = null;
            this.finishTime = null;
            this.error = null;
            this.projectId = null;
            this.pluginId = null;
            this.commits = [];
        }
    };

    // Prototypical inheritance from PluginResultBase.
    PluginResult.prototype = Object.create(PluginResultBase.prototype);
    PluginResult.prototype.constructor = PluginResult;

    /**
     *
     * @param {object} commitData
     * @param {string} commitData.commitHash - hash of the commit.
     * @param {string} commitData.status - storage.constants./SYNCED/FORKED/MERGED
     * @param {string} commitData.branchName - name of branch that got updated with the commitHash.
     */
    PluginResult.prototype.addCommit = function (commitData) {
        this.commits.push(commitData);
    };

    //------------------------------------------------------------------------------------------------------------------
    //--------------- Methods used by the plugin manager

    /**
     * Sets the name of the plugin to which the result object belongs to.
     *
     * @param {string} pluginName - name of the plugin
     */
    PluginResult.prototype.setPluginName = function (pluginName) {
        this.pluginName = pluginName;
    };

    /**
     * Sets the name of the plugin to which the result object belongs to.
     *
     * @param {string} pluginName - name of the plugin
     */
    PluginResult.prototype.setPluginId = function (pluginId) {
        this.pluginId = pluginId;
    };

    /**
     * Sets the name of the projectId the result was generated from.
     *
     * @param {string} projectId - id of the project
     */
    PluginResult.prototype.setProjectId = function (projectId) {
        this.projectId = projectId;
    };

    /**
     * Gets the ISO 8601 representation of the time when the plugin started its execution.
     *
     * @returns {string}
     */
    PluginResult.prototype.getStartTime = function () {
        return this.startTime;
    };

    /**
     * Sets the ISO 8601 representation of the time when the plugin started its execution.
     *
     * @param {string} time
     */
    PluginResult.prototype.setStartTime = function (time) {
        this.startTime = time;
    };

    /**
     * Gets the ISO 8601 representation of the time when the plugin finished its execution.
     *
     * @returns {string}
     */
    PluginResult.prototype.getFinishTime = function () {
        return this.finishTime;
    };

    /**
     * Sets the ISO 8601 representation of the time when the plugin finished its execution.
     *
     * @param {string} time
     */
    PluginResult.prototype.setFinishTime = function (time) {
        this.finishTime = time;
    };

    /**
     * Gets error if any error occured during execution.
     * FIXME: should this be an Error object?
     * @returns {string}
     */
    PluginResult.prototype.getError = function () {
        return this.error;
    };

    /**
     * Sets the error string if any error occured during execution.
     * FIXME: should this be an Error object?
     * @param {string} time
     */
    PluginResult.prototype.setError = function (error) {
        if (this.error) {
            // Do not overwrite user defined error.
            return;
        }

        if (error instanceof Error) {
            this.error = error.message;
        } else {
            this.error = error;
        }
    };

    /**
     * Serializes this object to a JSON representation.
     *
     * @returns {{success: boolean, messages: plugin.PluginMessage[], pluginName: string, finishTime: stirng}}
     */
    PluginResult.prototype.serialize = function () {
        var result = {
                success: this.success,
                projectId: this.projectId,
                messages: [],
                commits: this.commits,
                artifacts: this.artifacts,
                pluginName: this.pluginName,
                pluginId: this.pluginId,
                startTime: this.startTime,
                finishTime: this.finishTime,
                error: this.error
            },
            i;

        for (i = 0; i < this.messages.length; i += 1) {
            result.messages.push(this.messages[i].serialize());
        }

        return result;
    };

    return PluginResult;
}));
