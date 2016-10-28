L.Control.Dialog.Save = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
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
		this.options.size = [ Math.max(this.options.size[0], this.options.minSize[0]), Math.max(this.options.size[1], this.options.minSize[1]) ];
		this.options.anchor = [ Math.floor(0.5 * (mapSize.x - this.options.size[0])), Math.floor(0.5 * (mapSize.y - this.options.size[1])) ];

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
		'<li class="dialog-tab-title selected-li">Save Drawing As</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Save Drawing As</h3></div></div>',
		'</div>',
		'</div>',
		''
	],
	saveAsText: function () {
		var link = this.options.saveALink;

		var filename = 'RSWE.json';
		if (this.options.InputName.value) { filename = this.options.InputName.value; }

		link.download = filename;

		var data = this._map.RSWEIndoor.getData();
		link.href = 'data:text/plain;base64,' + L.Util.base64Encode(data);

		link.click();
		this.close();
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
				'&nbsp;<input type="button" value="Save drawing to file"/>',
				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
			]).join('');

			this.options.saveALink = elem.firstChild;
			this.options.InputName = elem.getElementsByTagName('INPUT')[0];
			this.options.InputButton = elem.getElementsByTagName('INPUT')[1];

			L.DomEvent.addListener(this.options.InputButton, 'click', function () { this.saveAsText(); }, this);
		}
	}

});

L.control.dialog.save = function (options) {
    return new L.Control.Dialog.Save(options);
};

