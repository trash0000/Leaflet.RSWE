L.Draw.Wall = L.Draw.Polyline.extend({
	statics: {
		TYPE: 'wall'
	},

	Poly: L.Polyline,

	options: {
		allowIntersection: true,
		repeatMode: false,
		drawError: {
			color: '#bbbbb',
			timeout: 2500
		},
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		}),
		guidelineDistance: 20,
		maxGuideLineLength: 4000,
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: false,
			clickable: true
		},
		metric: true, // Whether to use the metric meaurement system or imperial
		showLength: true, // Whether to display distance in the tooltip
		zIndexOffset: 2000, // This should be > than the highest z-index any map layers
		toolbarIcon: {
			className: 'leaflet-draw-draw-polyline',
			tooltip: L.drawLocal.draw.toolbar.buttons.polyline
		}
	},

	initialize: function (map, options) {
		L.Draw.Polyline.prototype.initialize.call(this, map, options);
		this.type = 'wall';
	},

	_updateStartHandler: function () {
		var markerCount = 0;
		if (this._markers !== undefined) {
			markerCount = this._markers.length;
		}
		if (markerCount === 3) {
			L.DomEvent.addListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp0, this);
			L.DomEvent.addListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp0, this);
		}
	},
	_onMarkerMouseUp0: function (e) {
		e.preventDefault();
		this._closeShape();
	},
	_closeShape: function () {
		this.Poly = L.Polygon;
		this._finishShape();
		this.Poly = L.Polyline;
	},
	_cleanUpShape: function () {
		if (this._markers.length > 1) {
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'mouseup', this._onMarkerMouseUp);
			L.DomEvent.removeListener(this._markers[this._markers.length - 1]._icon, 'touchend', this._onMarkerMouseUp);
		}
		if (this._markers.length > 2) {
			L.DomEvent.removeListener(this._markers[0]._icon, 'mouseup', this._onMarkerMouseUp0);
			L.DomEvent.removeListener(this._markers[0]._icon, 'touchend', this._onMarkerMouseUp0);
		}
	}

});