L.Control.Dialog.SavePNG = L.Control.Dialog.extend({
	options: {
		size: [ 300, 300 ],
		minSize: [ 100, 100 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,

	initialize: function () {

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},
	_getTabCount: function () {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes.length;
	},
	_getTab: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i];
	},
	_getTabTitle: function (i) {
		return this._container.firstChild.firstChild.firstChild.getElementsByTagName('UL')[0].childNodes[i];
	},
	_getTabContainer: function (i) {
		return this._container.firstChild.firstChild.firstChild.lastChild.childNodes[i].childNodes[0];
	},

	_selectTab: function (idx) {
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) {
			var _tab = this._getTab(i);
			var _tabTitle = this._getTabTitle(i);
			if (idx !== i) {
				_tab.setAttribute('class', 'dialog-tab');
				_tabTitle.setAttribute('class', 'dialog-tab-title');
			} else {
				_tab.setAttribute('class', 'dialog-tab selected');
				_tabTitle.setAttribute('class', 'dialog-tab-title selected-li');
			}
		}
	},
	onAdd: function (map) {
//prototupe call
		this._container = L.Control.Dialog.prototype.onAdd.call(this, map);

		this._map = map;
		var mapSize = map.getSize();

//init dialog size and position
		this.options.size = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.maxSize = [ Math.floor(0.5 * mapSize.x), Math.floor(0.5 * mapSize.y) ];
		this.options.anchor = [ Math.floor(0.25 * mapSize.x), Math.floor(0.25 * mapSize.y) ];

		this._isOpen = false;

		L.setOptions(this, this.options);
//init dialog tabs logic
		var html = this.contents.join('');
		this.setContent(html);
		var func =  function (i) {return function () { this._selectTab(i); }; };
		var tabCount = this._getTabCount();
		for (var i = 0; i < tabCount; i++) { L.DomEvent.addListener(this._getTabTitle(i), 'click', func(i), this); }

// create another dialog elements, add listeners, etc.
		this._dlgCreateControls();

//re-close dialog if initOpen==false to awoid some bugs
		if (!this.options.initOpen) { this.close(); }
		else { this.open(); }

		return this._container;
	},

	close: function () {
		this._isOpen = false;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		this._map.fire('close_all_dialogs');
		
		this._isOpen = true;
		L.Control.Dialog.prototype.open.call(this);
	},

	contents: [
		'<div class="dialog-container">',
		'<ul class="dialog-tabs-title">',
		'<li class="dialog-tab-title selected-li">Save Data As PNG</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save SVG Data As</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsPNG: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.png';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var _this = this;
		this._map.RSWEIndoor.getPNGData(function (data) {
			link.href = 'data:image/png;base64,' + data;
			link.click();
			_this.close();
		});
	},

	_dlgCreateControls: function () {
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);
			elem.innerHTML = ([
				'<a href="" download="" style="display:none;"></a>',
				'<label><input type="text" name="saveFileName" placeholder="Enter file name"/></label>',
				'&nbsp;<input type="button" value="Save data to PNG file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsPNG(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};

