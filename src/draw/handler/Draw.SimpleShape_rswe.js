L.SimpleShape = {};

L.Draw.SimpleShape = L.Draw.Feature.extend({
	options: {
		repeatMode: false
	},

	initialize: function (map, options) {
		this._endLabelText = L.drawLocal.draw.handlers.simpleshape.tooltip.end;

		L.Draw.Feature.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		L.Draw.Feature.prototype.addHooks.call(this);
		if (this._map) {
//			this._mapDraggable = this._map.dragging.enabled();

			if (this._map.dragging) { this._map.dragging.disable();	}
/*
			if (!this._mouseMarker) {
				this._mouseMarker = L.marker(this._map.getCenter(), {
					icon: L.divIcon({
						className: 'leaflet-div-icon leaflet-mouse-marker',
						iconAnchor: [20, 20],
						iconSize: [40, 40],
						draggable: true

					}),
					opacity: 0,
					zIndexOffset: this.options.zIndexOffset
				});
			}

			this._mouseMarker.addTo(this._map);
//			this._mouseMarker.setLatLng(latlng);
*/



			//TODO refactor: move cursor to styles
			this._container.style.cursor = 'crosshair';

			this._tooltip.updateContent({ text: this._initialLabelText });

//			this._map
//				.on('mousedown', this._onMouseDown, this)
//				.on('mousemove', this._onMouseMove, this);

			L.DomEvent.addListener(this._map._container, 'mousedown', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'mousemove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'mouseup', this._onMouseUp, this);

			L.DomEvent.addListener(this._map._container, 'touchstart', this._onMouseDown, this);
			L.DomEvent.addListener(this._map._container, 'touchmove', this._onMouseMove, this);
			L.DomEvent.addListener(this._map._container, 'touchend', this._onMouseUp, this);

		}
	},

	removeHooks: function () {
		L.Draw.Feature.prototype.removeHooks.call(this);
		if (this._map) {
			if (this._map.dragging) { this._map.dragging.enable(); }

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			L.DomEvent.removeListener(this._map._container, 'mousedown', this._onMouseDown);
			L.DomEvent.removeListener(this._map._container, 'mousemove', this._onMouseMove);
			L.DomEvent.removeListener(this._map._container, 'mouseup', this._onMouseUp);

			L.DomEvent.removeListener(this._map._container, 'touchstart', this._onMouseDown);
			L.DomEvent.removeListener(this._map._container, 'touchmove', this._onMouseMove);
			L.DomEvent.removeListener(this._map._container, 'touchend', this._onMouseUp);

//			this._map
//				.off('mousedown', this._onMouseDown, this)
//				.off('mousemove', this._onMouseMove, this);

//			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				this._map.removeLayer(this._shape);
				delete this._shape;
			}
/*
			if (this._mouseMarker) {
				this._map.removeLayer(this._mouseMarker);
				delete this._mouseMarker;
			}
*/
		}
		this._isDrawing = false;
	},

	_getTooltipText: function () {
		return {
			text: this._endLabelText
		};
	},

	_onMouseDown: function (e) {
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


		this._isDrawing = true;

		var map = this._map, containerPoint;
		if (e.touches) {
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
		}
		if (!map._container) { containerPoint = new L.Point(e.clientX, e.clientY); }
		var rect = map._container.getBoundingClientRect();
		containerPoint = new L.Point(
			e.clientX - rect.left - map._container.clientLeft,
			e.clientY - rect.top - map._container.clientTop);

		var layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

		this._startLatLng = latlng;
		e.preventDefault();

//		this.fire(e.type, {
//			latlng: latlng,
//			layerPoint: layerPoint,
//			containerPoint: containerPoint,
//			originalEvent: e
//		});


//		this._startLatLng = e.latlng;

//		L.DomEvent
//			.on(document, 'mouseup', this._onMouseUp, this)
//			.preventDefault(e.originalEvent);
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

		var map = this._map, containerPoint;

		if (e.touches) {
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
		}
		if (!map._container) { containerPoint = new L.Point(e.clientX, e.clientY); }
		var rect = map._container.getBoundingClientRect();
		containerPoint = new L.Point(
			e.clientX - rect.left - map._container.clientLeft,
			e.clientY - rect.top - map._container.clientTop);

		var layerPoint = map.containerPointToLayerPoint(containerPoint),
		    latlng = map.layerPointToLatLng(layerPoint);

//		this._startLatLng = latlng;
//		e.preventDefault();

//		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._tooltip.updateContent(this._getTooltipText());
			this._drawShape(latlng);
		}
/*
		if (this._mouseMarker) { this._mouseMarker.setLatLng(latlng); }
*/
	},

	_onMouseUp: function (e) {
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

		if (this._shape) {
			this._fireCreatedEvent();
		}

		this.disable();
		if (this.options.repeatMode) {
			this.enable();
		}
	}
});