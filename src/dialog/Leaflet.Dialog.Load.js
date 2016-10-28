L.Control.Dialog.Load = L.Control.Dialog.extend({
	options: {
		size: [ 300, 150 ],
		minSize: [ 300, 150 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	msgDiv: {},
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
		this.msgDiv.innerHTML = '';
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
		'<li class="dialog-tab-title selected-li">Load Drawing From File</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content" ><h3>Load Drawing From File</h3></div></div>',
		'</div>',
		'</div>',
		''
	],

	_dlgCreateControls: function () {
// ... initialize other DOM elements, add listeners, etc.
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			elem = L.DomUtil.create('div', 'save-file-name');
			tab.appendChild(elem);

			if (window.File && window.FileReader && window.FileList && window.Blob) {
// Great success! All the File APIs are supported.
				elem.innerHTML = ([
					'<div></div>',
					'<input type="file" name="file" />',
					'<output id="list"></output>'
				]).join('');

				this.msgDiv = elem.getElementsByTagName('DIV')[0];
				this.InputName = elem.getElementsByTagName('INPUT')[0];

				L.DomEvent.addListener(this.InputName, 'change', function (evt) { this.handleFileSelect(evt); }, this);

			} else {
				elem.innerHTML = ([
					'<div>Sorry. The File APIs are not fully supported in this browser.</div>'
				]).join('');
			}
		}
	},

	handleFileSelect: function (evt) {
		var files = evt.target.files;

		if (!files.length) {
			this.msgDiv.innerHTML = 'Please select a file!';
			return;
		}

		var reader = new FileReader();
		reader.thisDlg = this;

		reader.onloadend = function (evt) {
			if (evt.target.readyState === FileReader.DONE) {

				evt.target.thisDlg.InputName.value = '';

				var isOK = evt.target.thisDlg._map.RSWEIndoor.loadData(evt.target.result);
				if (isOK) {
					evt.target.thisDlg.close();
				} else {
					evt.target.thisDlg.msgDiv.innerHTML = 'ERROR loading data!  Please check file contents.';
					return;
				}
			}
		};

		var blob = files[0].slice(0, files[0].size);
		reader.readAsBinaryString(blob);
	}
});

L.control.dialog.load = function (options) {
    return new L.Control.Dialog.Load(options);
};

