//(function () {

L.Handler.MarkerSnap = L.Handler.extend({
    options: {
        snapType: 'undefined',
        gridStep: 0.1, //in meters
        snapDistance: 6, // in pixels
        snapToGrid: true,
        snapToObjects: true,
        snapVertices: true
    },

    initialize: function (map, marker, options) {
        L.Handler.prototype.initialize.call(this, map);
        this._markers = [];
        this._guides = [];

        if (arguments.length === 2) {
            if (!(marker instanceof L.Class)) {
                options = marker;
                marker = null;
            }
        }

        L.Util.setOptions(this, options || {});

        if (marker) {
            // new markers should be draggable !
            if (!marker.dragging) { marker.dragging = new L.Handler.MarkerDrag(marker); }
            marker.dragging.enable();
            this.watchMarker(marker);
        }

        // Convert snap distance in pixels into buffer in degres, for searching around mouse
        // It changes at each zoom change.
        function computeBuffer() {
            this._buffer = map.layerPointToLatLng(new L.Point(0, 0)).lat -
                           map.layerPointToLatLng(new L.Point(this.options.snapDistance, 0)).lat;
        }
        map.on('zoomend', computeBuffer, this);
        map.whenReady(computeBuffer, this);
        computeBuffer.call(this);
    },

    enable: function () {
        this.disable();
        for (var i = 0; i < this._markers.length; i++) {
            this.watchMarker(this._markers[i]);
        }
    },

    disable: function () {
        for (var i = 0; i < this._markers.length; i++) {
            this.unwatchMarker(this._markers[i]);
        }
    },

    watchMarker: function (marker) {
        if (this._markers.indexOf(marker) === -1) { this._markers.push(marker); }
        marker.on('move', this._snapMarker, this);
    },

    unwatchMarker: function (marker) {
        marker.off('move', this._snapMarker, this);
        delete marker.snap;
    },

    addGuideLayer: function (layer) {
        for (var i = 0, n = this._guides.length; i < n; i++) {
            if (L.stamp(layer) === L.stamp(this._guides[i])) { break; }
        }
        this._guides.push(layer);
        return this._guides;
    },

    addGuideLayersFromGroup: function (layerGroup) {
        layerGroup.eachLayer(this.addGuideLayer, this);
        return this._guides;
    },

    removeGuideLayer: function (layer) {
        for (var i = 0, n = this._guides.length; i < n; i++) {
            if (L.stamp(layer) === L.stamp(this._guides[i])) {
                this._guides.splice(i, 1);
                break;
            }
        }
        return this._guides;
    },
    _snapMarker: function (e) {
        var marker = e.target,
            latlng = marker.getLatLng(),
            snaplist = [],
            closest = null;
//snap to grid mode
        if (this.options.snapToGrid) {
            closest = this._findClosestGridSnap(this._map,
                                             latlng,
                                             this.options.gridStep,
                                             this.options.snapDistance);
            if (closest !== null) {
                this._updateSnap(marker, marker, closest.latlng);
                return;
            }
        }

//snap to objects mode
        function processGuide(guide) {
            if ((guide._layers !== undefined) &&
                (typeof guide.searchBuffer !== 'function')) {
                // Guide is a layer group and has no L.LayerIndexMixin (from Leaflet.LayerIndex)
                for (var id in guide._layers) {
                    processGuide(guide._layers[id]);
                }
            }
            else if (typeof guide.searchBuffer === 'function') {
            // Search snaplist around mouse
                snaplist = snaplist.concat(guide.searchBuffer(latlng, this._buffer));
            }
            else {
                snaplist.push(guide);
            }
        }
        if (this.options.snapToObjects) {

            for (var i = 0, n = this._guides.length; i < n; i++) {
                var guide = this._guides[i];

/* jshint ignore:start */
//when editing layers we don't snap layers to itself
//so we process only guides except ones which are parent layers for this marker

                if (guide.snapediting !== undefined ) {
                    if (marker._leaflet_id in guide.snapediting._markerGroup._layers) {
                        continue;
                    }
                }
/* jshint ignore:end */
                processGuide.call(this, guide);
            }

            closest = this._findClosestLayerSnap(this._map,
                                                 snaplist,
                                                 latlng,
                                                 this.options.snapDistance,
                                                 this.options.snapVertices);
        }

        closest = closest || {layer: null, latlng: null};
        this._updateSnap(marker, closest.layer, closest.latlng);
    },

    _findClosestLayerSnap: function (map, layers, latlng, tolerance, withVertices) {
        return L.GeometryUtil.closestLayerSnap(map, layers, latlng, tolerance, withVertices);
    },

    _findClosestGridSnap: function (map, latlng, gridStep, tolerance) {
        return L.GeometryUtil.closestGridSnap(map, latlng, gridStep, tolerance);
    },

    _updateSnap: function (marker, layer, latlng) {
        if (layer && latlng) {
            marker._latlng = L.latLng(latlng);
            marker.update();
            if (marker.snap !== layer) {
                marker.snap = layer;
                if (marker._icon) { L.DomUtil.addClass(marker._icon, 'marker-snapped'); }
                marker.fire('snap', {layer: layer, latlng: latlng});
            }
        }
        else {
            if (marker.snap) {
                if (marker._icon) { L.DomUtil.removeClass(marker._icon, 'marker-snapped'); }
                marker.fire('unsnap', {layer: marker.snap});
            }
            delete marker.snap;
        }
    }
});


//if (!L.Edit) {
//    // Leaflet.Draw not available.
//    return;
//}


L.Handler.PolylineSnap = L.Edit.Poly.extend({
    initialize: function (map, poly, options) {
        var that = this;

        L.Edit.Poly.prototype.initialize.call(this, poly, options);
        this._snapper = new L.Handler.MarkerSnap(map, options);
        poly.on('remove', function () {
            that._snapper.disable();
        });
    },

    addGuideLayer: function (layer) {
        this._snapper.addGuideLayer(layer);
        return this._snapper._guides;
    },

    addGuideLayersFromGroup: function (layerGroup) {
        layerGroup.eachLayer(this.addGuideLayer, this);
        return this._snapper._guides;
    },

    removeGuideLayer: function (layer) {
        this._snapper.removeGuideLayer(layer);
        return this._snapper._guides;
    },

    _createMarker: function (latlng, index) {
        var marker = L.Edit.Poly.prototype._createMarker.call(this, latlng, index);

        // Treat middle markers differently
        var isMiddle = index === undefined;
        if (isMiddle) {
            // Snap middle markers, only once they were touched
            marker.on('dragstart', function () {
                this._snapper.watchMarker(marker);
            }, this);
        }
        else {
            this._snapper.watchMarker(marker);
        }
        return marker;
    }
});


L.Draw.Feature.SnapMixin = {
    _snapInitialize: function () {
        this.on('enabled', this._snapOnEnabled, this);
        this.on('disabled', this._snapOnDisabled, this);
    },

    _snapOnEnabled: function () {
        if (!this.options.guideLayers) {
            return;
        }

        if (!this._mouseMarker) {
//            this._map.on('layeradd', this._snapOnEnabled, this);
            return;
//        } else {
//            this._map.off('layeradd', this._snapOnEnabled, this);
        }

        if (!this._snapper) {
            this._snapper = new L.Handler.MarkerSnap(this._map);

            L.Util.setOptions(this._snapper, this.options);
        }

        for (var i = 0, n = this.options.guideLayers.length; i < n; i++) {
            this._snapper.addGuideLayer(this.options.guideLayers[i]);
        }

        var marker = this._mouseMarker;

        this._snapper.watchMarker(marker);

        // Show marker when (snap for user feedback)
        var icon = marker.options.icon;
        marker.on('snap', function () {
            marker.setIcon(this.options.icon);
            marker.setOpacity(1);
        }, this);
        marker.on('unsnap', function () {
            marker.setIcon(icon);
            marker.setOpacity(0);
        }, this);

        marker.on('click', this._snapOnClick, this);
    },

    _snapOnClick: function (e) {
//        if (this._mouseMarker) { this._mouseMarker.off('click', this._snapOnClick, this); }

        if (this._markers) {
            var markerCount = this._markers.length,
                marker = this._markers[markerCount - 1];
            if (this._mouseMarker.snap) {
                if (e && marker) {
                  // update the feature being drawn to reflect the snapped location:
                    marker.setLatLng(e.target._latlng);
                    if (this._poly) {
                        var polyPointsCount = this._poly._latlngs.length;
                        this._poly._latlngs[polyPointsCount - 1] = e.target._latlng;
                        this._poly.redraw();
                    }
                    if (marker._icon) { L.DomUtil.addClass(marker._icon, 'marker-snapped'); }
                }
            }
        }
    },

    _snapOnDisabled: function () {
        if (this._mouseMarker) { this._mouseMarker.off('click', this._snapOnClick, this); }
        delete this._snapper;
    }
};

L.Draw.Feature.include(L.Draw.Feature.SnapMixin);
L.Draw.Feature.addInitHook('_snapInitialize');

//})();
