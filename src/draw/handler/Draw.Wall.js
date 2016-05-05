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
			iconSize: new L.Point(8, 8),
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
			this._markers[0].on('click', this._closeShape, this);
		}

	},
	_closeShape: function () {
		this.Poly = L.Polygon;
		this._finishShape();
		this.Poly = L.Polyline;
	}
});