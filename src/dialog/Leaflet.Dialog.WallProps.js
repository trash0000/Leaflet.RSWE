L.Control.Dialog.WallProps = L.Control.Dialog.extend({
	options: {
		size: [ 320, 200 ],
		minSize: [ 320, 200 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	_isOpen: false,
	_innerHTML: {},
	_curRoomId: 0,
	_curWallId: 0,

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
		'<li class="dialog-tab-title selected-li">Wall options</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>Wall options</h3></div></div>',
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
			elem = L.DomUtil.create('div', 'innerHTML');
			tab.appendChild(elem);
			elem.innerHTML = ([
//				'<a href="" download="" style="display:none;"></a>',
				'<label><span> Wall width (cm)</span> <input type="text" name="wallWidth" placeholder="Wall width"/></label>',
//				'&nbsp;<input type="button" value="Save drawing to file"/>',
//				'<br><br><i>Your drawing will be saved into system \"Download\" folder.</i>'
				''
			]).join('');
			this._innerHTML = elem;

			var InputWallWidth = elem.getElementsByTagName('INPUT')[0];

			L.DomEvent.addListener(InputWallWidth, 'change', this.setWallWidth, this);
		}
	},
	setDlgInputs: function (roomId, wallId) {
		this._curRoomId = roomId;
		this._curWallId = wallId;
		this._curWallWidth = this._map.RSWEIndoor.options.roomWallsProps[roomId][this._curWallId].wallWidth;
		this._innerHTML.getElementsByTagName('INPUT')[0].value = parseInt(this._curWallWidth * 100, 10);
		return this;
	},
	setWallWidth: function (event) {
		if (event.target.value) {
//			var val = event.target.value.replace(new RegExp(',', 'g'), '.');
			var val = parseInt(event.target.value, 10);
			if (!isNaN(val) && (val > 0) && (val < 101)) {
				this._map.RSWEIndoor.options.roomWallsProps[this._curRoomId][this._curWallId].wallWidth = val * 0.01;
				this.close();
//				event.target.value = val;
				this._map.RSWEIndoor.RedrawRoom(this._map.RSWEIndoor.options.layers[this._curRoomId].controlLayer);
//				this._map.fire('redraw:all');
			} else {
				event.target.value = parseInt(this._curWallWidth * 100, 10);
			}
		}
	}
});

L.control.dialog.wallprops = function (options) {
    return new L.Control.Dialog.WallProps(options);
};

