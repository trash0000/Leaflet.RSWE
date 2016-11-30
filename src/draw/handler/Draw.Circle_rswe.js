L.Draw.Circle = L.Draw.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
		shapeOptions: {
			stroke: true,
			color: '#bbbbbb',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true
		},
		showRadius: true,
		metric: true, // Whether to use the metric meaurement system or imperial

		toolbarIcon: {
			className: 'leaflet-draw-draw-circle',
			tooltip: L.drawLocal.draw.toolbar.buttons.circle
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Circle.TYPE;

		this._initialLabelText = L.drawLocal.draw.handlers.circle.tooltip.start;

		L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		} else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
		L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
	},

	_onMouseMove: function (e) {
		e.originalEvent = (e.originalEvent) ? e.originalEvent : e;
		if (e.originalEvent.touches) {
			e.originalEvent.clientX = (e.originalEvent.clientX) ? e.originalEvent.clientX : e.originalEvent.touches[0].clientX;
			e.originalEvent.clientY = (e.originalEvent.clientY) ? e.originalEvent.clientY : e.originalEvent.touches[0].clientY;
			this.startTouch = e.originalEvent.touches[0];
			this.lastTouch = e.originalEvent.touches[0];
		}

		e.containerPoint = (e.containerPoint) ? e.containerPoint : this._map.mouseEventToContainerPoint(e.originalEvent);
		e.layerPoint = (e.layerPoint) ? e.layerPoint : this._map.containerPointToLayerPoint(e.containerPoint);
		e.latlng = (e.latlng) ? e.latlng : this._map.layerPointToLatLng(e.layerPoint);

		e.originalEvent.preventDefault();

		var latlng = e.latlng,
			showRadius = this.options.showRadius,
			useMetric = this.options.metric,
			radius;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);

			// Get the new radius (rounded to 1 dp)
			radius = this._shape.getRadius().toFixed(1);

			this._tooltip.updateContent({
				text: this._endLabelText,
				subtext: showRadius ? L.drawLocal.draw.handlers.circle.radius + ': ' + L.GeometryUtil.readableDistance(radius, useMetric) : ''
			});
		}
	}
});
