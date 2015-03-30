/*jshint node:true*/

'use strict';

module.exports = {
        'msgTypes':{
            'request'     : 'request',
            'result'      : 'result',
            'info'        : 'info',
            'initialize'  : 'initialize',
            'initialized' : 'initialized',
            'query'       : 'query'
        },
        'workerStates':{
            'initializing' : 'initializing',
            'free'         : 'free',
            'working'      : 'working',
            'waiting'      : 'waiting'
        },
        'workerTypes':{
            'connected' : 'connected',
            'simple'    : 'simple'
        },
        'workerCommands':{
            'initialize': 'initialize',
            'getResult': 'getResult',
            'dumpMoreNodes': 'dumpMoreNodes',
            'generateJsonURL': 'generateJsonURL',
            'executePlugin': 'executePlugin',
            'exportLibrary': 'exportLibrary',
            'createProjectFromFile': 'createProjectFromFile',
            'getAllProjectsInfo': 'getAllProjectsInfo',
            'setBranch': 'setBranch',
            'connectedWorkerStart': 'connectedWorkerStart',
            'connectedWorkerQuery': 'connectedWorkerQuery',
            'connectedWorkerStop': 'connectedworkerStop',
            'getProjectInfo': 'getProjectInfo',
            'setProjectInfo': 'setProjectInfo',
            'getAllInfoTags': 'getAllInfoTags'
        }
    };
