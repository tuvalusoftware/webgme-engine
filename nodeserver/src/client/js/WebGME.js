"use strict";

// let require load all the toplevel needed script and call us on domReady
define([   'order!jquery',
    'order!jquery-ui',
    'order!underscore',
    'order!lib/jquery/jquery.qtip',
    'order!bootstrap',
    'logManager',
    'commonUtil',
    'clientUtil',
    'order!js/cli3nt',
    'order!js/corewrapper',
    'order!js/ObjectBrowser/TreeBrowserControl',
    'order!js/ObjectBrowser/JSTreeBrowserWidget',
    'order!js/ObjectBrowser/DynaTreeBrowserWidget',
    'js/ModelEditor/HTML/ModelEditorControl',
    'js/ModelEditor/HTML/ModelEditorView',
    'js/GraphViz/GraphVizControl',
    'js/GraphViz/GraphVizView',
    'js/ModelEditor2/ModelEditorControl',
    'js/ModelEditor2/ModelEditorView'], function (jquery,
                                                            jqueryui,
                                                            underscore,
                                                            qtip,
                                                            bootstrap,
                                                            logManager,
                                                            commonUtil,
                                                            util,
                                                            Client,
                                                            Core,
                                                            TreeBrowserControl,
                                                            JSTreeBrowserWidget,
                                                            DynaTreeBrowserWidget,
                                                            ModelEditorControl,
                                                            ModelEditorView,
                                                            GraphVizControl,
                                                            GraphVizView,
                                                            ModelEditorControl2,
                                                            ModelEditorView2) {

    if (DEBUG === true) {
        logManager.setLogLevel(logManager.logLevels.ALL);
        logManager.excludeComponent("TreeBrowserControl");
        logManager.excludeComponent("JSTreeBrowserWidget");
        logManager.excludeComponent("Client");
        logManager.excludeComponent("ModelEditorSVGWidget");
        logManager.excludeComponent("ModelEditorControl");
        logManager.excludeComponent("ModelEditorSVGConnection*");

        //logManager.excludeComponent("ModelEditorModelComponent*");
        //logManager.excludeComponent("ModelWithPortsDecorator*");
        //logManager.excludeComponent("Port*");
        //logManager.excludeComponent("ModelEditorConnectionComponent*");

        //logManager.excludeComponent("ModelEditorView_*");
        //logManager.excludeComponent("HTML_ModelEditorControl");

        logManager.excludeComponent("GraphVizControl");
        logManager.excludeComponent("GraphVizObject*");


    }

    var client,
        /*tDynaTree,*/
        tJSTree,
        modelEditorSVG,
        modelEditorHTML,
        doConnect,
        lastContainerWidth = 0,
        lastContainerHeight = 0,
        resizeMiddlePane,
        graphViz,
        setActiveVisualizer,
        modelEditorView,
        mainController,
        mainView,
        currentNodeId = null;

    /*
     * Compute the size of the middle pane window based on current browser size
     */
    lastContainerWidth = 0;
    lastContainerHeight = 0;
    resizeMiddlePane = function () {
        var cW = $("#contentContainer").width(),
            cH = $("#contentContainer").height(),
            eW = 0,
            eH = 0,
            horizontalSplit = false;
        if (cW !== lastContainerWidth || cH !== lastContainerHeight) {
            $("#middlePane").outerWidth(cW - $("#leftPane").outerWidth() - $("#rightPane").outerWidth());
            lastContainerWidth = cW;
            lastContainerHeight = cH;

            //by default lay out in vertical split
            /*eW = Math.floor($("#middlePane").width() / 2);
            eH = Math.floor($("#middlePane").height());*/

            /*if (eW < 560) {
                //inner children has to be laid out under each other (horizontal split)
                eW = Math.floor($("#middlePane").width());
                eH = Math.floor($("#middlePane").height() / 2);
                horizontalSplit = true;
            }*/

            /*$("#modelEditorContainer1").outerWidth(eW).outerHeight(eH);
            $("#modelEditorContainer2").outerWidth(eW).outerHeight(eH);*/

            /******************/
            eW = Math.floor($("#middlePane").width());
            eH = Math.floor($("#middlePane").height());

            $("#modelEditorContainer1").outerWidth(eW).outerHeight(eH);
            $("#modelEditorContainer2").outerWidth(eW).outerHeight(eH);

            /******************/

            //set container position correctly
            /*if (horizontalSplit === true) {
                $("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").outerHeight() + $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").position().left});
            } else {
                $("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").outerWidth() + $("#modelEditorContainer1").position().left });
            }*/

            //$("#modelEditorContainer2").offset({ "top": $("#modelEditorContainer1").position().top, "left": $("#modelEditorContainer1").outerWidth() + $("#modelEditorContainer1").position().left });

            if (modelEditorView) {
                if ($.isFunction(modelEditorView.parentContainerSizeChanged)) {
                    modelEditorView.parentContainerSizeChanged(eW, eH);
                }
            }
        }
    };

    //hook up windows resize event
    $(window).resize(function () {
        resizeMiddlePane();
    });

    //and call if for the first time as well
    resizeMiddlePane();

    setActiveVisualizer = function (visualizer) {
        //destroy current controller and visualizer
        if (mainController) {
            mainController.destroy();
        }
        if (mainView) {
            mainView.destroy();
        }

        mainController = null;
        mainView = null;
        if (visualizer === "ModelEditor") {
            mainView = new ModelEditorView("modelEditorHtml");
            mainController = new ModelEditorControl(client, mainView);
        } else if (visualizer === "ModelEditor2") {
            mainView = new ModelEditorView2("modelEditorHtml");
            mainController = new ModelEditorControl2(client, mainView);
        } else if (visualizer === "GraphViz") {
            mainView = new GraphVizView("modelEditorHtml");
            mainController = new GraphVizControl(client, mainView);
        }

        if (currentNodeId) {
            if (mainController) {
                mainController.selectedObjectChanged(currentNodeId);
            }
        }
    };

    $("#visualizerPanel").find('a[class="btn-env"]').click(function (event) {
        var vis = $(this).attr("id");

        $("#visualizerPanel").find('a[class="btn-env"]').parent().removeClass('active');
        $(this).parent().addClass('active');

        setActiveVisualizer(vis);
        event.stopPropagation();
    });

    $("#projectHistoryPanel").find('a.btnFullRefresh').on("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (client) {
            client.fullRefresh();
        }
    });

    $("#projectHistoryPanel").find('a.btnUndo').on("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        if (client) {
            client.undo();
        }
    });

    doConnect = function () {

        //figure out the server to connect to
        /*var serverLocation;

        //by default serverlocation is the same server the page loaded from
        if (commonUtil.standalone.ProjectIP === "self") {
            serverLocation = 'http://' + window.location.hostname + ':' + commonUtil.standalone.ProjectPort;
        } else {
            serverLocation = 'http://' + commonUtil.standalone.ProjectIP + ':' + commonUtil.standalone.ProjectPort;
        }

        if (commonUtil.hashbasedconfig.inuse) {
            client = new Core(commonUtil.combinedserver);
        } else {
            client = new Client(serverLocation);
        }*/
        client = new Core(commonUtil.combinedserver);

        client.addEventListener(client.events.SELECTEDOBJECT_CHANGED, function (__project, nodeId) {
            currentNodeId = nodeId;
            if (mainController) {
                mainController.selectedObjectChanged(currentNodeId);
            }
        });

        //tDynaTree = new TreeBrowserControl(client, new DynaTreeBrowserWidget("tbDynaTree"));
        tJSTree = new TreeBrowserControl(client, new JSTreeBrowserWidget("tbJSTree"));

        //modelEditorSVG = new ModelEditorControl(client, new ModelEditorSVGWidget("modelEditorSVG"));
        //modelEditorHTML = new WidgetManager(client, $("#modelEditorHtml"));
        //modelEditorView = new ModelEditorView("modelEditorHtml");
        //modelEditorHTML = new ModelEditorControl(client, modelEditorView);
        //graphViz = new GraphVizControl(client, new GraphVizView("modelEditorSVG"));

        //hide GraphViz first and hook up radio button

    };

    return {
        start : function () {
            doConnect();
            setActiveVisualizer("ModelEditor");
        }
    };
});