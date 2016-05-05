L.Control.Dialog.Options = L.Control.Dialog.extend({
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
		this.options.size = [ Math.floor(0.6 * mapSize.x), Math.floor(0.6 * mapSize.y) ];
		this.options.maxSize = [ Math.floor(0.6 * mapSize.x), Math.floor(0.6 * mapSize.y) ];
		this.options.anchor = [ Math.floor(0.2 * mapSize.x), Math.floor(0.2 * mapSize.y) ];

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
		'<li class="dialog-tab-title selected-li">View Options</li>',
		'<li class="dialog-tab-title">Edit Options</li>',
		'<li class="dialog-tab-title">Snap Options</li>',
//		'<li class="dialog-tab-title">Test</li>',
		'</ul>',
		'<div class="dialog-tabs">',
		'<div class="dialog-tab selected"><div class="dialog-tab-content"><h3>View Options</h3></div></div>',
		'<div class="dialog-tab"><div class="dialog-tab-content"><h3>Edit Options</h3></div></div>',
		'<div class="dialog-tab"><div class="dialog-tab-content"><h3>Snap Options</h3></div></div>',
//		'<div class="dialog-tab">',
//		'<div class="dialog-tab-content"><h3>Test Dlg fuctions</h3><br>',
//		'<p>Hello! Welcome to your nice new dialog box!</p>',
//		'<button class="btn btn-primary" onclick="map.RSWEIndoor.optionsDialog.setSize([ 350, 350 ])">dialog.setSize</button><br/>',
//		'<button class="btn btn-primary" onclick="map.RSWEIndoor.optionsDialog.setLocation([ 50, 50 ])">dialog.setLocation</button><br/>',
//		'<button class="btn btn-danger" onclick="map.RSWEIndoor.optionsDialog.freeze()">dialog.freeze()</button><br/>',
//		'<button class="btn btn-success" onclick="map.RSWEIndoor.optionsDialog.unfreeze()">dialog.unfreeze()</button>',
//		'</div>',
//		'</div>',
		'</div>',
		'</div>',
		''
	],
	_dlgCreateControls: function () {
// ... initialize other DOM elements, add listeners, etc.
		var tab, elem;
		tab = this._getTabContainer(0);
		if (tab) {
			if (this._map.options.simpleGraticule !== undefined) {
				elem = L.DomUtil.create('div', 'display-grid-control');
				tab.appendChild(elem);
				if (this._map.options.simpleGraticule.options.hidden === false) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="simpleGraticule" value="1" />Display Measure Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="simpleGraticule" value="1" />Display Measure Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.simpleGraticule.show();
					} else {
						this._map.options.simpleGraticule.hide();
					}
				}, this);
			}

			if (this._map.options.graphicScaleControl !== undefined) {
				elem = L.DomUtil.create('div', 'display-graphicscale-control');
				tab.appendChild(elem);
				if (this._map.options.graphicScaleControl.style.display === 'none') {
					elem.innerHTML =
						'<label><input type="checkbox" name="graphicScaleControl" value="1" />Display Ruler</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="graphicScaleControl" value="1" />Display Ruler</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.graphicScaleControl.style.display = 'block';
					} else {
						this._map.options.graphicScaleControl.style.display = 'none';
					}
				}, this);
			}

			if (this._map.RSWEIndoor.options.fitBondsAfterLoad !== undefined) {
				elem = L.DomUtil.create('div', 'display-graphicscale-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.fitBondsAfterLoad === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="fitBondsAfterLoad" value="1" />Fit Bonds After Load</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="fitBondsAfterLoad" value="1" />Fit Bonds After Load</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.fitBondsAfterLoad = true;
					} else {
						this._map.RSWEIndoor.options.fitBondsAfterLoad = false;
					}
				}, this);
			}
		}
		tab = this._getTabContainer(1);
		if (tab) {
			if (this._map.RSWEIndoor.options.wallWidth !== undefined) {
				elem = L.DomUtil.create('div', 'wallwidth-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name="wallWidthControl" /> Wall Width (meters)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.wallWidth);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = evt.target.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							this._map.RSWEIndoor.options.wallWidth = val;
							evt.target.value = val;
							this._map.fire('redraw:all');
						} else {
							evt.target.value = this._map.RSWEIndoor.options.wallWidth;
						}
					}
				}, this);
			}
		}
		tab = this._getTabContainer(2);
		if (tab) {
			if (this._map.RSWEIndoor.options.snapOptions.displaySnapGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.options.snapGrid.options.hidden === true) {
					elem.innerHTML =
						'<label><input type="checkbox" name="displaySnapGrid" value="1" /> Display Snap Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="displaySnapGrid" value="1" /> Display Snap Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.options.snapGrid.show();
						this._map.RSWEIndoor.options.snapOptions.displaySnapGrid = true;
					} else {
						this._map.options.snapGrid.hide();
						this._map.RSWEIndoor.options.snapOptions.displaySnapGrid = false;
					}
				}, this);
			}

			if (this._map.RSWEIndoor.options.snapOptions.gridStep !== undefined) {
				elem = L.DomUtil.create('div', 'snap-grid-step-options-control');
				tab.appendChild(elem);
				elem.innerHTML = '<label><input type="text" name=snapgridstep" /> Snap Grid Step (meters)</label>';
				elem.firstChild.firstElementChild.setAttribute('value', this._map.RSWEIndoor.options.snapOptions.gridStep);
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.value) {
						var val = this.value.replace(new RegExp(',', 'g'), '.');
						if (!isNaN(val)) {
							val = +val;
							this._map.RSWEIndoor.options.snapOptions.gridStep = val;
							evt.target.value = val;
							this._map.options.snapGrid.options.interval = val;
							this._map.RSWEIndoor.SetSnapOptions();

							this._map.options.snapGrid.redraw();

							this._map.RSWEIndoor.options.controlLayer.eachLayer(function (layer) {
								if (layer.snapediting !== undefined) {
									if (layer.snapediting._snapper !== undefined) {
										layer.snapediting._snapper.options.gridStep = val;
									}
								}
							});
						} else {
							evt.target.value = this._map.RSWEIndoor.options.snapOptions.gridStep;
						}
					}
				}, this);

			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWallsToGrid" value="1" /> Snap Walls To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWallsToGrid" value="1" /> Snap Walls To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWallsToObjects" value="1" /> Snap Walls To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWallsToObjects" value="1" /> Snap Walls To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWallsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWindowsToGrid" value="1" /> Snap Windows To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWindowsToGrid" value="1" /> Snap Windows To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapWindowsToObjects" value="1" /> Snap Windows To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapWindowsToObjects" value="1" /> Snap Windows To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapWindowsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapDoorsToGrid" value="1" /> Snap Doors To Grid</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapDoorsToGrid" value="1" /> Snap Doors To Grid</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToGrid = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
			if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects !== undefined) {
				elem = L.DomUtil.create('div', 'display-snap-grid-options-control');
				tab.appendChild(elem);
				if (this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects === true) {
					elem.innerHTML =
						'<label><input type="checkbox" checked name="snapDoorsToObjects" value="1" /> Snap Doors To Objects</label>';
				} else {
					elem.innerHTML =
						'<label><input type="checkbox" name="snapDoorsToObjects" value="1" /> Snap Doors To Objects</label>';
				}
				L.DomEvent.addListener(elem.firstChild.firstElementChild, 'change', function (evt) {
					if (evt.target.checked) {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects = true;
						this._map.RSWEIndoor.SetSnapOptions();
					} else {
						this._map.RSWEIndoor.options.snapOptions.snapDoorsToObjects = false;
						this._map.RSWEIndoor.SetSnapOptions();
					}
				}, this);
			}
		}
	}
});

L.control.dialog.options = function (options) {
    return new L.Control.Dialog.Options(options);
};

