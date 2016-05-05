L.Control.Dialog.RoomProps = L.Control.Dialog.extend({
	options: {
		size: [ 300, 300 ],
		minSize: [ 100, 100 ],
		maxSize: [ 350, 350 ],
		anchor: [ 50, 50 ],
		position: 'topleft',
		initOpen: false
	},
	roomId : -1,
	wallId: -1,
	roomWallsPropsItem: {},

	initialize: function (wall, roomId, wallId, roomWallsPropsItem) {//(options) {
		this.wall = wall;
		this.roomId = roomId;
		this.wallId = wallId;
		this.roomWallsPropsItem = roomWallsPropsItem;
		this._sethtml();

		L.setOptions(this, this.options);
		L.Control.Dialog.prototype.initialize.call(this, this.options);
	},

	onAdd: function (map) {
		return L.Control.Dialog.prototype.onAdd.call(this, map);
	},

//	binddlg: function (wall, roomId, wallId) {
//			console.log('This is my menu example');

//		var dlg = new L.Control.Dialog(); //options)
//		var roomWallsProps = map.RSWEIndoor[roomId].roomWallsProps[wallId];
//		this.wall = wall;
//		this.roomId = roomId;
//		this.waiiId = wallId;
//		this._sethtml();

//        var html = '';
//        html = html + '<p>Hello! </p><p> This is a room[' + roomId + ']</p><p>This is a wall[' + wallId;
//        html = html + ']</p><p>The wall type is : ' + roomWallsProps.wallType + '</p>';
//        html = html + '</p><p>The gap size is from  ' + roomWallsProps.gapStart + '% to ' + roomWallsProps.gapEnd + '%</p>';
//        dlg.setContent(html);
//        dlg.addTo(map);
//			dlg.open();
//		return this;
//	},
	contents: [
//		'<script>var dialog = map.activeRoomPropsDlg;</script>',
		'<p>Hello! Welcome to your nice new dialog box!</p>',
		'<button class="btn btn-primary" onclick="map.activeRoomPropsDlg.setSize([ 350, 350 ])">dialog.setSize([ 350, 350 ])</button><br/><br/>',
		'<button class="btn btn-primary" onclick="dialog.setLocation([ 50, 50 ])">dialog.setLocation([ 50, 50 ])</button><br/><br/>',
		'<button class="btn btn-danger" onclick="dialog.freeze()">dialog.freeze()</button>&nbsp;&nbsp;',
		'<button class="btn btn-success" onclick="dialog.unfreeze()">dialog.unfreeze()</button><br/><br/>'
	],
	setWallType: function (wallType) {
		this.roomWallsPropsItem.wallType = wallType;
		this._sethtml();
		this.open();
		map.fire('edit', {layer: map.RSWEIndoor.Indoor[this.roomId].controlLayer});
	},
	_sethtml: function () {

		var html = '';
//		html = this.contents.join('');
//		this.setContent(html);

//		var roomWallsProps = map.RSWEIndoor[this.roomId].roomWallsProps[this.wallId];

		html = html + '<p>Hello! </p><p> This is a room[' + this.roomId + ']</p><p>This is a wall[' + this.wallId + ']</p>';
//		html = html + '<p>The wall type is :';
		html = html + '<div><div>The wall type is : </div><div><ul class="dropdown">';
		html = html + '<li class="dropdown-top">';
		html = html + '<a class="dropdown-top"> ' + this.roomWallsPropsItem.wallType + '</i></a>';
		html = html + '<ul class="dropdown-inside">';
		html = html + '<li><a href="#" class="fa fa-stop" onclick="map.activeRoomPropsDlg.setWallType(\'solid\')">&nbsp;solid</a></li>';
		html = html + '<li><a href="#" class="fa fa-arrows-h" onclick="map.activeRoomPropsDlg.setWallType(\'gap\')">&nbsp;gap</a></li>';
		html = html + '<li><a href="#" class="fa fa-th-large" onclick="map.activeRoomPropsDlg.setWallType(\'window\')">&nbsp;window</a></li>';
		html = html + '<li><a href="#" class="fa fa-stack-overflow" onclick="map.activeRoomPropsDlg.setWallType(\'door1\')">&nbsp;door1</a></li>';
		html = html + '<li><a href="#" class="fa fa-stack-overflow" onclick="map.activeRoomPropsDlg.setWallType(\'door2\')">&nbsp;door2</a></li>';
		html = html + '<li><a href="#" class="fa fa-stack-overflow" onclick="map.activeRoomPropsDlg.setWallType(\'door3\')">&nbsp;door3</a></li>';
		html = html + '<li><a href="#" class="fa fa-stack-overflow" onclick="map.activeRoomPropsDlg.setWallType(\'door4\')">&nbsp;door4</a></li>';
		html = html + '</ul>';
		html = html + '</li>';
		html = html + '</ul></div></div>';
		html = html + '<div>The gap size is from  ' + this.roomWallsPropsItem.gapStart + '% to ' + this.roomWallsPropsItem.gapEnd + '%</div>';


		this.setContent(html);
//		this.addTo(map);

	},
	close: function () {
		delete this.roomWallsPropsItem.editMode;
		L.Control.Dialog.prototype.close.call(this);
	},
	open: function () {
		map.drawControl._toolbars.draw.disable();
		map.drawControl._toolbars.edit.disable();

		if (map.activeRoomPropsDlg) { map.activeRoomPropsDlg.close(); }
		L.Control.Dialog.prototype.open.call(this);
		map.activeRoomPropsDlg = this;
		this.roomWallsPropsItem.editMode = 1;

	},
	showdlg: function () {
//		this._sethtml();
//		console.log('inside showdlg');
//
//		L.Control.Dialog.prototype.open.call(this);
//		this.addTo(map);
//			map.RSWEIndoor.RedrawRoom(layer);
//		map.RSWEIndoor.RedrawRoom(map.RSWEIndoor.Indoor[this.roomId].layerRoom);

//		this._map.fire('draw:editstop', { handler: this.type });

		this.open();
//		this.addTo(map);
//		this.addTo(map);
	}
});

L.control.dialog.roomprops = function (options) {
    return new L.Control.Dialog.RoomProps(options);
};
