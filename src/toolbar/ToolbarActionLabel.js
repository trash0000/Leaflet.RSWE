L.ToolbarActionLabel = L.ToolbarAction.extend({
	statics: {
		baseClass: 'leaflet-toolbar-icon'
	},

	options: {
		toolbarIcon: {
			html: '',
			className: '',
			tooltip: ''
		},
		isHidden: function () { return false; },
		separator: false,
		label: ''
	},
	enable: function (event) {
//action  for saving input field
		if (event) { L.DomEvent.preventDefault(event); }
		this._enabled = false;
		return;
	},
//	enableOnEnter: function (event) {
//		if (event.which === 13) {
//			this._input.blur();
//			this.enable(event);
//		}
//	},
	disable: function () {
		if (!this._enabled) { return; }
		this._enabled = false;

		if (this.removeHooks) { this.removeHooks(); }
	},
	_createIcon: function (toolbar, container) {//, args) {
		var iconOptions = this.options.toolbarIcon;

		this.toolbar = toolbar;
		this._map = toolbar._map;

		if (this.options.isHidden.call(this, this._map)) { return; }

		this._icon = L.DomUtil.create('li', '', container);
		this._link = L.DomUtil.create('a', 'leaflet-toolbar-noicon leaflet-toolbar-label', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._link, 'leaflet-toolbar-icon-separator'); }

		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);
		L.DomUtil.addClass(this._link, this.constructor.baseClass);

		if (iconOptions.className) { L.DomUtil.addClass(this._link, iconOptions.className); }

		L.DomEvent.on(this._link, 'click', this.enable, this);

		this._div = L.DomUtil.create('div', 'leaflet-toolbar-div-label', this._link);

		if (this.options.label) { this._div.innerHTML = this.options.label; }
	}
});
/* no factory
L.toolbaractionlabel = function toolbaractionlabel(options) {
	return new L.ToolbarActionLabel(options);
};
*/

L.ToolbarActionLabel.extendOptions = function (options) {
	return this.extend({ options: options });
};
