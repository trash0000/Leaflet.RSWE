L.Toolbar.Control = L.CustomToolbar.extend({
	statics: {
		baseClass: 'leaflet-control-toolbar ' + L.CustomToolbar.baseClass
	},

	initialize: function (options) {
		L.CustomToolbar.prototype.initialize.call(this, options);

		this._control = new L.Control.Toolbar(this.options);
	},

	onAdd: function (map) {
		this._control.addTo(map);

		L.CustomToolbar.prototype.onAdd.call(this, map);

		this.appendToContainer(this._control.getContainer());
	},

	onRemove: function (map) {
		L.CustomToolbar.prototype.onRemove.call(this, map);
		if (this._control.remove) { this._control.remove(); }  // Leaflet 1.0
		else { this._control.removeFrom(map); }
	}
});

L.Control.Toolbar = L.Control.extend({
	onAdd: function () {
		return L.DomUtil.create('div', '');
	}
});
/*
L.toolbar.control = function (options) {
    return new L.Toolbar.Control(options);
};
*/