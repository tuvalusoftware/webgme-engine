/*globals define*/
/*jshint node:true, browser:true*/

/**
* Generated by PluginGenerator from webgme on Fri Apr 17 2015 11:49:47 GMT-0500 (Central Daylight Time).
*/
if (typeof define === 'undefined') {

} else {
    define(['plugin/PluginConfig', 'plugin/PluginBase'], function (PluginConfig, PluginBase) {
        'use strict';

        /**
         * Initializes a new instance of MultipleMainCallbackCalls.
         * @class
         * @augments {PluginBase}
         * @classdesc This class represents the plugin MultipleMainCallbackCalls.
         * @constructor
         */
        var MultipleMainCallbackCalls = function () {
            // Call base class' constructor.
            PluginBase.call(this);
        };

        // Prototypal inheritance from PluginBase.
        MultipleMainCallbackCalls.prototype = Object.create(PluginBase.prototype);
        MultipleMainCallbackCalls.prototype.constructor = MultipleMainCallbackCalls;

        /**
         * Gets the name of the MultipleMainCallbackCalls.
         * @returns {string} The name of the plugin.
         * @public
         */
        MultipleMainCallbackCalls.prototype.getName = function () {
            return 'Multiple Main Callbacks Calls';
        };

        /**
         * Gets the semantic version (semver.org) of the MultipleMainCallbackCalls.
         * @returns {string} The version of the plugin.
         * @public
         */
        MultipleMainCallbackCalls.prototype.getVersion = function () {
            return '0.1.0';
        };

        /**
         * Gets the description of the MultipleMainCallbackCalls.
         * @returns {string} The description of the plugin.
         * @public
         */
        MultipleMainCallbackCalls.prototype.getDescription = function () {
            return 'This plugin calls the main callback ';
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
        MultipleMainCallbackCalls.prototype.main = function (callback) {
            // Use self to access core, project, result, logger etc from PluginBase.
            // These are all instantiated at this point.
            var self = this;

            // This will save the changes. If you don't want to save;
            // exclude self.save and call callback directly from this scope.
            self.result.setSuccess(true);
            callback(null, self.result);
            callback(null, self.result);
            callback(null, self.result);
            callback(null, self.result);
        };

        return MultipleMainCallbackCalls;
    });
}