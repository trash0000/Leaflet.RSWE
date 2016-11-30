L.Draw.Marker = L.Draw.Feature.extend({
	statics: {
		TYPE: 'marker'
	},

	options: {
		icon: new L.Icon.Default(),
		repeatMode: false,
		zIndexOffset: 2000, // This should be > than the highest z-index any markers

		toolbarIcon: {
			className: 'leaflet-draw-draw-marker',
			tooltip: L.drawLocal.draw.toolbar.buttons.marker
		}
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Draw.Marker.TYPE;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);

		if (this._map) {
			this._tooltip.updateContent({ text: L.drawLocal.draw.handlers.marker.tooltip.start });

			// Same mouseMarker as in Draw.Polyline
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40]
					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker
				.on('click', this._onClick, this)
				.addTo(this._map);

			this._map.on('mousemove', this._onMouseMove, this);
		}
	},
	setStyle: function (style) {
		L.setOptions(this, style);

		if (this._container) {
			this._updateStyle();
		}

		return this;
	},


//	setStyle: function (style) {
//		L.Draw.Feature.prototype.setStyle(this, style);
//	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);

		if (this._map) {
			if (this._marker) {
				this._marker.off('click', this._onClick, this);
				this._map
					.off('click', this._onClick, this)
					.removeLayer(this._marker);
				delete this._marker;
			}

			this._mouseMarker.off('click', this._onClick, this);
			this._map.removeLayer(this._mouseMarker);
			delete this._mouseMarker;

			this._map.off('mousemove', this._onMouseMove, this);
		}
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

		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		this._mouseMarker.setLatLng(latlng);

		if (!this._marker) {
			this._marker = new L.Marker(latlng, {
				icon: this.options.icon,
				zIndexOffset: this.options.zIndexOffset
			});
			// Bind to both marker and map to make sure we get the click event.
			this._marker.on('click', this._onClick, this);
			this._map
				.on('click', this._onClick, this)
				.addLayer(this._marker);
		}
		else {
			latlng = this._mouseMarker.getLatLng();
			this._marker.setLatLng(latlng);
		}
	},

	_onClick: function (e) {
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

		this._fireCreatedEvent();

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	},

	_fireCreatedEvent: function () {
		var marker = new L.Marker(this._marker.getLatLng(), { icon: this.options.icon });
		L.Draw.Feature.prototype._fireCreatedEvent.call(this, marker);
	}
});
