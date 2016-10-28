L.Draw.Polygon = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
		showArea: false,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,//true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		toolbarIcon: {
			className: 'leaflet-draw-draw-polygon',
			tooltip: L.drawLocal.draw.toolbar.buttons.polygon
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Polygon.TYPE;
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;

		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			L.DomEvent.addListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp, this);
		}

// Add and update the double click handler
		if (markerCount > 2) {
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp, this);
			L.DomEvent.addListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp, this);
// Only need to remove handler if has been added before
			if (markerCount > 3) {
				L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'mouseup', this._onMarkerMouseUp);
				L.DomEvent.removeListener(this._markers[markerCount - 2]._icon, 'touchend', this._onMarkerMouseUp);

			}
		}
	},

	_getTooltipText: function () {
		var text, subtext;

		if (this._markers.length === 0) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.start;
		} else if (this._markers.length < 3) {
			text = L.drawLocal.draw.handlers.polygon.tooltip.cont;
		} else {
			text = L.drawLocal.draw.handlers.polygon.tooltip.end;
			subtext = this._getMeasurementString();
		}

		return {
			text: text,
			subtext: subtext
		};
	},

	_getMeasurementString: function () {
		var area = this._area;

		if (!area) {
			return null;
		}

		return L.GeometryUtil.readableArea(area, this.options.metric);
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexChanged: function (latlng, added) {
		var latLngs;

		// Check to see if we should show the area
		if (!this.options.allowIntersection && this.options.showArea) {
			latLngs = this._poly.getLatLngs();

			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		L.Draw.Polyline.prototype._vertexChanged.call(this, latlng, added);
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			L.DomEvent.removeListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp);

			if (markerCount > 2) {
				L.DomEvent.removeListener(this._markers[markerCount - 1]._icon, 'mouseup', this._onMarkerMouseUp);
				L.DomEvent.removeListener(this._markers[markerCount - 1]._icon, 'touchend', this._onMarkerMouseUp);

			}
		}
	}
});
