/*
L.Edit = L.Edit || {};
L.Edit.Popup = L.Edit.Popup || {};

L.Edit.Popup.Edit = L.ToolbarAction.extend({
	options: {
		toolbarIcon: { html: 'Edit', className: 'leaflet-draw-edit-edit' }
	},

	initialize: function (map, shape, options) {
		this._map = map;

		this._shape = shape;
		this._shape.options.editing = this._shape.options.editing || {};

		L.ToolbarAction.prototype.initialize.call(this, map, options);
	},

	enable: function () {
		var map = this._map,
			shape = this._shape;

		shape.editing.enable();
		map.removeLayer(this.toolbar);
		
		map.on('click', function () {
			shape.editing.disable();
		});
	}
});

L.Edit = L.Edit || {};
L.Edit.Popup = L.Edit.Popup || {};

L.Edit.Popup.Delete = L.ToolbarAction.extend({
	options: {
		toolbarIcon: { html: 'Remove', className: 'leaflet-draw-edit-remove' }
	},

	initialize: function (map, shape, options) {
		this._map = map;
		this._shape = shape;

		L.ToolbarAction.prototype.initialize.call(this, map, options);
	},

	addHooks: function () {
		this._map.removeLayer(this._shape);
		this._map.removeLayer(this.toolbar);
	}
});
*/
/*
L.WallPropsToolbarPopup = L.ToolbarPopup.extend({
	options: {
		actions: [
			L.Edit.Popup.Edit,
			L.Edit.Popup.Delete
		]
	},

	onAdd: function (map) {
		var shape = this._arguments[1];

		if (shape instanceof L.Marker) {
*/			/* Adjust the toolbar position so that it doesn't cover the marker. */
/*			this.options.anchor = L.point(shape.options.icon.options.popupAnchor);
		}

		L.ToolbarPopup.prototype.onAdd.call(this, map);
	}
});
*/