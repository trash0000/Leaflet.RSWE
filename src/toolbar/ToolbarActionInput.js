L.ToolbarActionInput = L.ToolbarAction.extend({
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
		placeholder: '',
		setInitValue: function () { return ''; }
	},
	enable: function (event) {
//action  for saving input field
		var result = false;

		if (event) { L.DomEvent.preventDefault(event); }
		if (this._enabled) { return; }
		this._enabled = true;

		if (this.addHooks) { this.addHooks(); }

		if (this._map && this.toolbar) {
			if (typeof this.options.callback === 'function') { result = this.options.callback.call(this, this._map, this._input); }
//autoclose if result = true
			if (result) { this._map.removeLayer(this.toolbar); }
		}
	},
	enableOnEnter: function (event) {
		if (event.which === 13) {
			this._input.blur();
			this.enable(event);
		}
	},
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
		this._link = L.DomUtil.create('a', 'leaflet-toolbar-icon-input', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._link, 'leaflet-toolbar-icon-separator');	}

		this._link.setAttribute('href', '#');
		this._link.setAttribute('title', iconOptions.tooltip);
		L.DomUtil.addClass(this._link, this.constructor.baseClass);

		if (iconOptions.className) {
			L.DomUtil.addClass(this._link, iconOptions.className);
		}

		L.DomEvent.on(this._link, 'click', this.enable, this);

		this._div = L.DomUtil.create('div', 'leaflet-toolbar-div-input', this._icon);

		if (this.options.separator) { L.DomUtil.addClass(this._div, 'leaflet-toolbar-icon-separator');	}

		this._input = L.DomUtil.create('input', '', this._div);

		this._input.setAttribute('onclick', 'this.select();');

		L.DomEvent.on(this._input, 'keypress', this.enableOnEnter, this);

		this._input.setAttribute('type', 'text');

		if (typeof this.options.setInitValue === 'function') {
			this._input.setAttribute('value', this.options.setInitValue.call(this, this._map, this._input));
		}

		if (this.options.placeholder) { this._input.setAttribute('placeholder', this.options.placeholder); }

	}
});
/* no factory
L.toolbaractioninput = function toolbaractioninput(options) {
	return new L.ToolbarActionInput(options);
};
*/

L.ToolbarActionInput.extendOptions = function (options) {
	return this.extend({ options: options });
};
