// A convenience class for built-in popup toolbars.

L.ToolbarPopup = L.CustomToolbar.extend({
	statics: {
		baseClass: 'leaflet-popup-toolbar ' + L.CustomToolbar.baseClass
	},

	options: {
		anchor: [0, 0]
	},

	initialize: function (latlng, options) {
		L.CustomToolbar.prototype.initialize.call(this, options);

		/* 
		 * Developers can't pass a DivIcon in the options for L.Toolbar.Popup
		 * (the use of DivIcons is an implementation detail which may change).
		 */
		this._marker = new L.Marker(latlng, {
			icon : new L.DivIcon({
				className: this.options.className,
				iconSize: [0, 0],
				iconAnchor: [0, 0]
			})
		});
	},

	onAdd: function (map) {
		this._map = map;
		this._marker.addTo(map);

		this._map.fire('popups:hide', {'caller': this});

		L.CustomToolbar.prototype.onAdd.call(this, map);

		this.appendToContainer(this._marker._icon);

		this._setStyles();

		L.DomEvent.on(this._map.getContainer(), 'mouseleave', this.remove, this);


		L.DomEvent
			.on(this._container, 'click', L.DomEvent.stop)
			.on(this._container, 'mousedown', L.DomEvent.stop)
			.on(this._container, 'dblclick', L.DomEvent.stop)
			.on(this._container, 'contextmenu', L.DomEvent.stop);

		this._map.on({
			'mousedown': this.remove,
			'click': this.remove,
			'movestart': this.remove,
			'zoomstart': this.remove
		}, this);

		this._map.on({'popups:hide': this._onPopupsHide}, this);
	},

	_onPopupsHide: function (e) {
		if (e.caller && e.caller !== this) { this.remove(); }
	},

	onRemove: function (map) {
		L.DomEvent
			.off(this._container, 'click', L.DomEvent.stop)
			.off(this._container, 'mousedown', L.DomEvent.stop)
			.off(this._container, 'dblclick', L.DomEvent.stop)
			.off(this._container, 'contextmenu', L.DomEvent.stop);

		L.DomEvent.off(this._map.getContainer(), 'mouseleave', this.remove, this);
		this._map.off({
			'mousedown': this.remove,
			'click': this.remove,
			'movestart': this.remove,
			'zoomstart': this.remove
		}, this);

		this._map.off({'popups:hide': this._onPopupsHide}, this);

		map.removeLayer(this._marker);

		L.CustomToolbar.prototype.onRemove.call(this, map);

		delete this._map;
	},

	setLatLng: function (latlng) {
		this._marker.setLatLng(latlng);

		return this;
	},

	_setStyles: function () {
		var container = this._container,
			toolbar = this._ul,
			anchor = L.point(this.options.anchor),
			icons = toolbar.querySelectorAll('.leaflet-toolbar-icon'),
			buttonHeights = [],
			buttonWidths = [],
			toolbarWidth = 0,
			toolbarHeight,
			tipSize,
			tipAnchor;

		/* Calculate the dimensions of the toolbar. */
		for (var i = 0, l = icons.length; i < l; i++) {
			if (icons[i].parentNode.parentNode === toolbar) {
				buttonHeights.push(parseInt(L.DomUtil.getStyle(icons[i], 'height'), 10));
				buttonWidths.push(parseInt(L.DomUtil.getStyle(icons[i], 'width'), 10));

//				toolbarWidth += Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'width')));
//				toolbarWidth = Math.max(toolbarWidth, Math.ceil(parseFloat(L.DomUtil.getStyle(icons[i], 'width'))));
			}
		}
//this is max
		toolbarWidth = buttonWidths.reduce(function (val, current) { return Math.max(val, current); }, 0);
//this is sum
		toolbarHeight = buttonHeights.reduce(function (val, current) { return val + current; }, 0);

//		toolbarWidth = buttonWidths.reduce(function (sum, current) { return sum + current; }, 0);
//		toolbarHeight = Math.max.apply(undefined, buttonHeights);

		toolbar.style.width = toolbarWidth + 'px';

		/* Create and place the toolbar tip. */
		this._tipContainer = L.DomUtil.create('div', 'leaflet-toolbar-tip-container', container);
		this._tipContainer.style.width = toolbarWidth + 'px';

		this._tip = L.DomUtil.create('div', 'leaflet-toolbar-tip', this._tipContainer);

		/* Set the tipAnchor point. */
		tipSize = parseInt(L.DomUtil.getStyle(this._tip, 'width'), 10);

//		tipAnchor = new L.Point(toolbarWidth / 2, toolbarHeight + 0.7071 * tipSize);
		tipAnchor = new L.Point(0, 0.7071 * tipSize);
//		tipAnchor = new L.Point(toolbarWidth / 2, (toolbarHeight + 0.7071 * tipSize) / 2);

		/* The anchor option allows app developers to adjust the toolbar's position. */
		container.style.marginLeft = (anchor.x - tipAnchor.x) + 'px';
		container.style.marginTop = (anchor.y - tipAnchor.y) + 'px';
	}
});
/* no factory
L.toolbarpopup = function (options) {
    return new L.ToolbarPopup(options);
};
*/
