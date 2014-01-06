"use strict";

define(['js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../Core/ModelDecorator.html',
    '../Core/ModelDecorator.Core',
    '../Core/ModelDecorator.Constants',
    'js/DragDrop/DragConstants',
    'js/DragDrop/DragHelper',
    'css!./ModelDecorator.DiagramDesignerWidget'], function (CONSTANTS,
                                                          nodePropertyNames,
                                                          DiagramDesignerWidgetDecoratorBase,
                                                          DiagramDesignerWidgetConstants,
                                                          modelDecoratorTemplate,
                                                          ModelDecoratorCore,
                                                          ModelDecoratorConstants,
                                                          DragConstants,
                                                          DragHelper) {

    var ModelDecoratorDiagramDesignerWidget,
        DECORATOR_ID = "ModelDecoratorDiagramDesignerWidget",
        PORT_CONTAINER_OFFSET_Y = 15,
        ACCEPT_DROPPABLE_CLASS = 'accept-droppable',
        DRAGGABLE_MOUSE = 'DRAGGABLE';

    ModelDecoratorDiagramDesignerWidget = function (options) {
        var opts = _.extend( {}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);

        this._initializeVariables({"connectors": true});

        this._selfPatterns = {};

        this.logger.debug("ModelDecoratorDiagramDesignerWidget ctor");
    };

    /************************ INHERITANCE *********************/
    _.extend(ModelDecoratorDiagramDesignerWidget.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    _.extend(ModelDecoratorDiagramDesignerWidget.prototype, ModelDecoratorCore.prototype);

    /**************** OVERRIDE INHERITED / EXTEND ****************/

    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.DECORATORID = DECORATOR_ID;


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.$DOMBase = $(modelDecoratorTemplate);


    //callback method for territory update
    ModelDecoratorDiagramDesignerWidget.prototype.onOneEvent = function (events) {
        //don't really care here, just want to make sure that the reference object is loaded in the client
        this.logger.debug('onOneEvent: ' + JSON.stringify(events));
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.on_addTo = function () {
        var self = this;

        this._renderContent();

        // set title editable on double-click
        this.skinParts.$name.on("dblclick.editOnDblClick", null, function (event) {
            if (self.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
                $(this).editInPlace({"class": "",
                    "value": self.name,
                    "onChange": function (oldValue, newValue) {
                        self.__onNodeTitleChanged(oldValue, newValue);
                    }});
            }
            event.stopPropagation();
            event.preventDefault();
        });

        // reference icon on double-click
        this.$el.on("dblclick.refDblClick", '.' + ModelDecoratorConstants.REFERENCE_POINTER_CLASS, function (event) {
            if (!($(this).hasClass(ModelDecoratorConstants.REFERENCE_POINTER_CLASS_NONSET))) {
                self.__navigateToReference();
            }
            event.stopPropagation();
            event.preventDefault();
        });
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.update = function () {
        this._update();
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.calculateDimension = function () {
        this._paddingTop = parseInt(this.$el.css('padding-top'), 10);
        this._borderTop = parseInt(this.$el.css('border-top-width'), 10);

        if (this.hostDesignerItem) {
            this.hostDesignerItem.setSize(this.$el.outerWidth(true), this.$el.outerHeight(true));
        }
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.destroy = function () {
        //drop territory
        if (this._territoryId) {
            this._control._client.removeUI(this._territoryId);
        }

        //call base destroy
        ModelDecoratorCore.prototype.destroy.call(this);
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.getConnectionAreas = function (id/*, isEnd, connectionMetaInfo*/) {
        var result = [],
            edge = 10,
            LEN = 20;

        //by default return the bounding box edges midpoints

        if (id === undefined || id === this.hostDesignerItem.id) {
            //top left
            result.push( {"id": "0",
                "x1": edge,
                "y1": 0,
                "x2": this.hostDesignerItem.getWidth() - edge,
                "y2": 0,
                "angle1": 270,
                "angle2": 270,
                "len": LEN} );

            result.push( {"id": "1",
                "x1": edge,
                "y1": this.hostDesignerItem.getHeight(),
                "x2": this.hostDesignerItem.getWidth() - edge,
                "y2": this.hostDesignerItem.getHeight(),
                "angle1": 90,
                "angle2": 90,
                "len": LEN} );
        } else {
            //subcomponent
            var portConnArea = this._ports[id].getConnectorArea(),
                idx = this._portIDs.indexOf(id);

            result.push( {"id": idx,
                "x1": portConnArea.x1,
                "y1": portConnArea.y1 + PORT_CONTAINER_OFFSET_Y + this._paddingTop + this._borderTop,
                "x2": portConnArea.x2,
                "y2": portConnArea.y2 + PORT_CONTAINER_OFFSET_Y + this._paddingTop + this._borderTop,
                "angle1": portConnArea.angle1,
                "angle2": portConnArea.angle2,
                "len": portConnArea.len} );
        }

        return result;
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    //called when the designer item's subcomponent should be updated
    ModelDecoratorDiagramDesignerWidget.prototype.updateSubcomponent = function (portId) {
        this._updatePort(portId);
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    //Shows the 'connectors' - appends them to the DOM
    ModelDecoratorDiagramDesignerWidget.prototype.showSourceConnectors = function (params) {
        var connectors,
            i;

        if (!params) {
            this.$sourceConnectors.show();
            if (this._portIDs) {
                i = this._portIDs.length;
                while (i--) {
                    this._ports[this._portIDs[i]].showConnectors();
                }
            }
        } else {
            connectors = params.connectors;
            i = connectors.length;
            while (i--) {
                if (connectors[i] === undefined) {
                    //show connector for the represented item itself
                    this.$sourceConnectors.show();
                } else {
                    //one of the ports' connector should be displayed
                    if (this._ports[connectors[i]]) {
                        this._ports[connectors[i]].showConnectors();
                    }
                }
            }
        }
    };

    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    //Hides the 'connectors' - detaches them from the DOM
    ModelDecoratorDiagramDesignerWidget.prototype.hideSourceConnectors = function () {
        var i;

        this.$sourceConnectors.hide();

        if (this._portIDs) {
            i = this._portIDs.length;
            while (i--) {
                this._ports[this._portIDs[i]].hideConnectors();
            }
        }
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    //should highlight the connectors for the given elements
    ModelDecoratorDiagramDesignerWidget.prototype.showEndConnectors = function (params) {
       this.showSourceConnectors(params);
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    //Hides the 'connectors' - detaches them from the DOM
    ModelDecoratorDiagramDesignerWidget.prototype.hideEndConnectors = function () {
        this.hideSourceConnectors();
    };


    /**** Override from DiagramDesignerWidgetDecoratorBase ****/
    ModelDecoratorDiagramDesignerWidget.prototype.notifyComponentEvent = function (componentList) {
        var len = componentList.length;
        while (len--) {
            this._updatePort(componentList[len].id);
        }
        this._checkTerritoryReady();
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._portPositionChanged = function (portId) {
        this.calculateDimension();
        this.hostDesignerItem.canvas.dispatchEvent(this.hostDesignerItem.canvas.events.ITEM_SUBCOMPONENT_POSITION_CHANGED, {"ItemID": this.hostDesignerItem.id,
            "SubComponentID": portId});
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._registerForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.registerComponentIDForPartID(portId, partId);
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._unregisterForNotification = function(portId) {
        var partId = this._metaInfo[CONSTANTS.GME_ID];

        this._control.unregisterComponentIDFromPartID(portId, partId);
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._renderPort = function (portId) {
        var isPort;

        isPort = ModelDecoratorCore.prototype._renderPort.call(this, portId);

        if (isPort) {
            this.__registerAsSubcomponent(portId);
        }
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._removePort = function (portId) {
        var idx = this._portIDs.indexOf(portId);

        if (idx !== -1) {
            this.__unregisterAsSubcomponent(portId);
        }

        ModelDecoratorCore.prototype._removePort.call(this, portId);
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._updateReference = function () {
        var inverseClass = 'inverse-on-hover',
            self = this;

        ModelDecoratorCore.prototype._updateReference.call(this);

        if (this.skinParts.$ref) {
            if (this.skinParts.$ref.hasClass(ModelDecoratorConstants.REFERENCE_POINTER_CLASS_NONSET)) {
                this.skinParts.$ref.removeClass(inverseClass);
            } else {
                this.skinParts.$ref.addClass(inverseClass);
            }

            //edit droppable mode
            this.$el.on('mouseenter.' + DRAGGABLE_MOUSE, null, function (event) {
                self.__onMouseEnter(event);
            })
            .on('mouseleave.' + DRAGGABLE_MOUSE, null, function (event) {
                self.__onMouseLeave(event);
            })
            .on('mouseup.' + DRAGGABLE_MOUSE, null, function (event) {
                self.__onMouseUp(event);
            });
        } else {
            this.$el.off('mouseenter.' + DRAGGABLE_MOUSE)
                .off('mouseleave.' + DRAGGABLE_MOUSE)
                .off('mouseup.' + DRAGGABLE_MOUSE);
        }
    };


    /**** Override from ModelDecoratorCore ****/
    ModelDecoratorDiagramDesignerWidget.prototype._refToChanged = function (oldValue, newValue) {
        this.logger.debug('refToChanged from ' + oldValue + ' to ' + newValue);

        if (oldValue) {
            delete this._selfPatterns[oldValue];
        }

        if (newValue) {
            this._territoryId = this._territoryId || this._control._client.addUI(this, true);
            this._selfPatterns[newValue] = { "children": 0 };
        }

        if (this._selfPatterns && !_.isEmpty(this._selfPatterns)) {
            this._control._client.updateTerritory(this._territoryId, this._selfPatterns);
        } else {
            if (this._territoryId) {
                this._control._client.removeUI(this._territoryId);
            }
        }
    };


    ModelDecoratorDiagramDesignerWidget.prototype.__onBackgroundDroppableOver = function (helper) {
        if (this.__onBackgroundDroppableAccept(helper) === true) {
            this.__doAcceptDroppable(true);
        }
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__onBackgroundDroppableOut = function () {
        this.__doAcceptDroppable(false);
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__onBackgroundDrop = function (helper) {
        var dragInfo = helper.data(DragConstants.DRAG_INFO),
            dragItems = DragHelper.getDragItems(dragInfo),
            dragEffects = DragHelper.getDragEffects(dragInfo);

        if (this.__acceptDroppable === true) {
            if (dragItems.length === 1 && dragEffects.indexOf(DragHelper.DRAG_EFFECTS.DRAG_CREATE_REFERENCE) !== -1) {
                this._setReferenceValue(dragItems[0]);
            }
        }

        this.__doAcceptDroppable(false);
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__onBackgroundDroppableAccept = function (helper) {
        var dragInfo = helper.data(DragConstants.DRAG_INFO),
            dragItems = DragHelper.getDragItems(dragInfo),
            dragEffects = DragHelper.getDragEffects(dragInfo);

        return dragItems.length === 1 &&
            dragItems[0] !== this._metaInfo[CONSTANTS.GME_ID] &&
            dragEffects.indexOf(DragHelper.DRAG_EFFECTS.DRAG_CREATE_REFERENCE) !== -1 &&
            this._control._client.isValidTarget(this._metaInfo[CONSTANTS.GME_ID],CONSTANTS.POINTER_REF,dragItems[0]);
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__doAcceptDroppable = function (accept) {
        if (accept === true) {
            this.__acceptDroppable = true;
            this.$el.addClass(ACCEPT_DROPPABLE_CLASS);
        } else {
            this.__acceptDroppable = false;
            this.$el.removeClass(ACCEPT_DROPPABLE_CLASS);
        }

        this.hostDesignerItem.canvas._enableDroppable(!accept);
    };


    ModelDecoratorDiagramDesignerWidget.prototype.__onMouseEnter = function (event) {
        if (this.hostDesignerItem.canvas.getIsReadOnlyMode() !== true) {
            //check if it's dragging anything with jQueryUI
            if ($.ui.ddmanager.current && $.ui.ddmanager.current.helper) {
                this.__onDragOver = true;
                this.__onBackgroundDroppableOver($.ui.ddmanager.current.helper);
                event.stopPropagation();
                event.preventDefault();
            }
        }
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__onMouseLeave = function (event) {
        if (this.__onDragOver) {
            this.__onBackgroundDroppableOut();
            this.__onDragOver = false;
            event.stopPropagation();
            event.preventDefault();
        }
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__onMouseUp = function (/*event*/) {
        if (this.__onDragOver) {
            //TODO: this is still questionable if we should hack the jQeuryUI 's draggable&droppable and use half of it only
            this.__onBackgroundDrop($.ui.ddmanager.current.helper);
            this.__onDragOver = false;
            this.hostDesignerItem.canvas._enableDroppable(false);
        }
    };


    ModelDecoratorDiagramDesignerWidget.prototype.__registerAsSubcomponent = function(portId) {
        if (this.hostDesignerItem) {
            this.hostDesignerItem.registerSubcomponent(portId, {"GME_ID": portId});
        }
    };

    ModelDecoratorDiagramDesignerWidget.prototype.__unregisterAsSubcomponent = function(portId) {
        if (this.hostDesignerItem) {
            this.hostDesignerItem.unregisterSubcomponent(portId);
        }
    };


    ModelDecoratorDiagramDesignerWidget.prototype.__onNodeTitleChanged = function (oldValue, newValue) {
        var client = this._control._client;

        client.setAttributes(this._metaInfo[CONSTANTS.GME_ID], nodePropertyNames.Attributes.name, newValue);
    };


    ModelDecoratorDiagramDesignerWidget.prototype.__navigateToReference = function () {
        var client = this._control._client,
            nodeObj;

        if (this._refTo) {
            nodeObj = client.getNode(this._refTo);
            if (nodeObj) {
                if (nodeObj.getParentId()) {
                    this._control._client.setSelectedObjectId(nodeObj.getParentId(), this._refTo);
                } else {
                    this._control._client.setSelectedObjectId('root', this._refTo);
                }
            } else {
                this.logger.warning('_navigateToReference client.getNode(' + this._refTo + ') returned null... :(');
            }
        }
    };


    return ModelDecoratorDiagramDesignerWidget;
});