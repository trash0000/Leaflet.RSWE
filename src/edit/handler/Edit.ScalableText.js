L.Edit = L.Edit || {};

L.Edit.ScalableText = L.Handler.extend({
	options: {
		icon: new L.DivIcon({
			iconSize: new L.Point(16, 16),
			className: 'leaflet-div-icon leaflet-editing-icon'
		})
	},

	initialize: function (scalabletext, options) {
		this._scalabletext = scalabletext;
		L.setOptions(this, options);
	},

	addHooks: function () {
		var scalabletext = this._scalabletext;

		scalabletext.setStyle(scalabletext.options.editing);

		if (this._scalabletext.options.editable && this._scalabletext._map) {
			if (!this._markerGroup) {
				this._initMarkers();
			}
			this._scalabletext._map.addLayer(this._markerGroup);
		}
	},

	removeHooks: function () {
		var scalabletext = this._scalabletext;

		scalabletext.setStyle(scalabletext.options.original);

		if (this._scalabletext.options.editable && this._scalabletext._map) {
			scalabletext._map.removeLayer(this._markerGroup);
			delete this._markerGroup;
			delete this._markers;
		}
	},

	updateMarkers: function () {
		this._markerGroup.clearLayers();
		this._initMarkers();
	},

	_initMarkers: function () {
		if (!this._markerGroup) {
			this._markerGroup = new L.LayerGroup();
		}
		this._markers = [];

		var latlngs = this._scalabletext._latlngs, marker;//i, len, j


		if (!this._scalabletext.options.markerOnTop) {
			marker = this._createMarker(latlngs[0], 0);
			this._markers.push(marker);
		} else {
			marker = this._createMarker(latlngs[1], 1);
			this._markers.push(marker);
		}
	},
	_createMarker: function (latlng, index) {
		var marker = new L.Marker(latlng, {
			draggable: true,
			icon: this.options.icon
		});

		marker._origLatLng = latlng;
		marker._index = index;

		marker.on('drag', this._onMarkerDrag, this);
		marker.on('dragend', this._fireEdit, this);

		this._markerGroup.addLayer(marker);

		return marker;
	},

	_removeMarker: function (marker) {
		var i = marker._index;

		this._markerGroup.removeLayer(marker);
		this._markers.splice(i, 1);
		this._scalabletext.spliceLatLngs(i, 1);
		this._updateIndexes(i, -1);

		marker
			.off('drag', this._onMarkerDrag, this)
			.off('dragend', this._fireEdit, this)
			.off('click', this._onMarkerClick, this);
	},

	_fireEdit: function () {
		this._scalabletext.edited = true;
		this._scalabletext.fire('edit');
		this._scalabletext._map.fire('edit', { layer: this._scalabletext});
	},

	_onMarkerDrag: function (e) {
		var marker = e.target;

		L.DomEvent.preventDefault(e);
		var delta = {'lat': (marker._latlng.lat - marker._origLatLng.lat), 'lng': (marker._latlng.lng - marker._origLatLng.lng)};
		if (this._scalabletext.options.editable && this._scalabletext.options.onDrag) { this._scalabletext.options.onDrag.call(this, marker, delta); }

		if (!this._scalabletext.options.markerOnTop) {
			this._scalabletext._latlngs[1].lat += marker._latlng.lat - marker._origLatLng.lat;
			this._scalabletext._latlngs[1].lng += marker._latlng.lng - marker._origLatLng.lng;
		} else {
			this._scalabletext._latlngs[0].lat += marker._latlng.lat - marker._origLatLng.lat;
			this._scalabletext._latlngs[0].lng += marker._latlng.lng - marker._origLatLng.lng;
		}

		L.extend(marker._origLatLng, marker._latlng);


		this._scalabletext.redraw();
	},

	_updateIndexes: function (index, delta) {
		this._markerGroup.eachLayer(function (marker) {
			if (marker._index > index) {
				marker._index += delta;
			}
		});
	}
});

L.ScalableText.addInitHook(function () {

	// Check to see if handler has already been initialized. This is to support versions of Leaflet that still have L.Handler.PolyEdit
	if (this.editing) {
		return;
	}

	if (L.Edit.ScalableText) {
		this.editing = new L.Edit.ScalableText(this);

//		if (this.options.editable) {
//			this.editing.enable();
//		}
	}

	this.on('add', function () {
		if (this.editing && this.editing.enabled() && this.options.editable) {
			this.editing.addHooks();
		}
	});

	this.on('remove', function () {
		if (this.editing && this.editing.enabled() && this.options.editable) {
			this.editing.removeHooks();
		}
	});
});
