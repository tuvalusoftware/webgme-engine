/*globals define*/
/*jshint node:true, browser:true*/

/**
* Generated by PluginGenerator from webgme on Wed Jul 15 2015 15:24:02 GMT-0500 (CDT).
*/

define([
    'plugin/PluginConfig',
    'plugin/PluginBase',
    'common/core/users/merge'
], function (PluginConfig, PluginBase, merge) {
    'use strict';

    /**
    * Initializes a new instance of MergeExample.
    * @class
    * @augments {PluginBase}
    * @classdesc This class represents the plugin MergeExample.
    * @constructor
    */
    var MergeExample = function () {
        // Call base class' constructor.
        PluginBase.call(this);
    };

    // Prototypal inheritance from PluginBase.
    MergeExample.prototype = Object.create(PluginBase.prototype);
    MergeExample.prototype.constructor = MergeExample;

    /**
    * Gets the name of the MergeExample.
    * @returns {string} The name of the plugin.
    * @public
    */
    MergeExample.prototype.getName = function () {
        return 'Merge Example';
    };

    /**
    * Gets the semantic version (semver.org) of the MergeExample.
    * @returns {string} The version of the plugin.
    * @public
    */
    MergeExample.prototype.getVersion = function () {
        return '0.1.0';
    };

    /**
    * Gets the description of the MergeExample.
    * @returns {string} The description of the plugin.
    * @public
    */
    MergeExample.prototype.getDescription = function () {
        return 'Example plugin to show how to use the merge capabilities of webgme.';
    };

    /**
    * Gets the configuration structure for the MergeExample.
    * The ConfigurationStructure defines the configuration for the plugin
    * and will be used to populate the GUI when invoking the plugin from webGME.
    * @returns {object} The version of the plugin.
    * @public
    */
    MergeExample.prototype.getConfigStructure = function () {
        return [
            {
                'name': 'mergeFrom',
                'displayName': 'Merge from',
                //'regex': '^[a-zA-Z]+$', // TODO: verify branch or hash
                //'regexMessage': 'Name can only contain English characters!',
                'description': 'Merging changes from this branch or commit hash.',
                'value': 'development',
                'valueType': 'string',
                'readOnly': false
            },
            {
                'name': 'mergeTo',
                'displayName': 'Merge to',
                //'regex': '^[a-zA-Z]+$', // TODO: verify branch or hash
                //'regexMessage': 'Name can only contain English characters!',
                'description': 'Merging changes to this branch or commit hash.',
                'value': 'master',
                'valueType': 'string',
                'readOnly': false
            }
        ];
    };


    /**
    * Main function for the plugin to execute. This will perform the execution.
    * Notes:
    * - Always log with the provided logger.[error,warning,info,debug].
    * - Do NOT put any user interaction logic UI, etc. inside this method.
    * - callback always has to be called even if error happened.
    *
    * @param {function(string, plugin.PluginResult)} callback - the result callback
    */
    MergeExample.prototype.main = function (callback) {
        // Use self to access core, project, result, logger etc from PluginBase.
        // These are all instantiated at this point.
        var self = this;

        // Obtain the current user configuration.
        var currentConfig = self.getCurrentConfig();
        self.logger.info('Current configuration ' + JSON.stringify(currentConfig, null, 4));

        merge.merge({
            project: self.project,
            logger: self.logger,
            gmeConfig: self.gmeConfig,
            myBranchOrCommit: currentConfig.mergeFrom,
            theirBranchOrCommit: currentConfig.mergeTo,
            auto: true
        })
            .then(function (result) {
                // result.baseCommitHash
                // result.conflict
                // result.diff
                // result.myCommitHash
                // result.projectId
                // result.targetBranchName
                // result.theirCommitHash

                self.logger.info(result);

                if (result.conflict.items.length === 0) {
                    // FIXME: what if it could not update the branch or got a commit hash
                    self.result.setSuccess(true);
                    callback(null, self.result);
                } else {
                    // there was a conflict
                    // TODO: change conflict object as necessary

                    // resolve
                    return merge.resolve({
                        partial: result,
                        project: self.project,
                        logger: self.logger,
                        gmeConfig: self.gmeConfig,
                        myBranchOrCommit: currentConfig.mergeFrom,
                        theirBranchOrCommit: currentConfig.mergeTo,
                        auto: true
                    });
                }

            })
            .then(function (result) {
                // result.updatedBranch
                // result.hash
                // FIXME: what if it could not update the branch or got a commit hash
                self.logger.info(result);

                self.result.setSuccess(true);
                callback(null, self.result);
            })
            .catch(function (err) {
                self.result.setSuccess(false);
                self.result.setError(error);
                callback(err, self.result);
            });
    };

    return MergeExample;
});