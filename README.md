# Leaflet.RSWE
Room Sketches Web Editor (RSWE) Leaflet plugin allows you draw, edit, save and load simple indoor sketches directly on Leaflet maps.

See [demo](http://trash0000.github.io/Leaflet.RSWE/RSWE.600x800.html)

# Important
Leaflet.RSWE requires [Leaflet 0.7.x](https://github.com/Leaflet/Leaflet/releases).


## Table of Contents
###[Building Leaflet.RSWE from sources](#build)
###[Using the plugin](#using)
###[Basic features](#features)
###[Thanks](#thanks)

<a name="build" />
## Building Leaflet.RSWE from sources

Install [NodeJS](https://nodejs.org/en/download/). Add path to node.exe into your system environment variable PATH 

Install Jake.
The best way is to download sources from [Jake Repository](https://github.com/jakejs/jake) and manually uppack into NodeJS node_modules directory.
Also copy file jake.bat into the root of NodeJS directory.

Download Leaflet.RSWE sources from [Leaflet.RSWE Repository](https://github.com/trash0000/Leaflet.RSWE/)
Unpack sources in Your working dirrectory (e.g. C:\RSWE) and run commands:

    npm install -g jake
    npm install

All necessary Jake additional modules will be downloaded and installed into your working directory.

Run command

    jake 

to build plugin from source codes

If you obtain error : 
jake aborted.
TypeError: Object [object Promise] has no method 'cancellable'
    at List._refresh (..\node_modules\karma\lib\file-list.js:199:4)
    at List.refresh (..\node_modules\karma\lib\file-list.js:252:27)
(See full trace by running task with --trace)

Please manually open file  node_modules\karma\lib\file-list.js in your working catalog (e.g. C:\RSWE\node_modules\karma\lib\file-list.js)
and comment line 199 :

    //  .cancellable()


Leaflet.RSWE plugin will be built from distributives after commmand 

    jake

<a name="using" />
## Using the plugin

This plugin based on Leaflet.draw/

Use HTML code like this : 

    	<link rel="stylesheet" href="leaflet.css" />
    	<link rel="stylesheet" href="leaflet.RSWE.css" />
    	<script src="leaflet.js"></script>
    	<script src="leaflet.RSWE.js"></script>
    ...
    	<div id="map" style="margin: auto; top: 50; left: 50; width: 800px; height: 600px;"/>
    	<script>map = new L.map('map', { center: [0,0], zoom: 24, maxZoom: 31, RSWEIndoor: true });</script>
    ...



<a name="features" />
## Basic features

Leaflet.RSWE plugin based on Leaflet.draw source code. For detailed instructions please refer to [Leaflet.draw manuals](https://github.com/Leaflet/Leaflet.draw) . 

Leaflet.RSWE integrates customized code of the next plugins (see details on this links):

- [Leaflet.fullscreen](https://github.com/Leaflet/Leaflet.fullscreen)
- [leaflet-graphicscale](https://github.com/nerik/leaflet-graphicscale)
- [Leaflet.SimpleGraticule](https://github.com/ablakey/Leaflet.SimpleGraticule)
- [Leaflet.curve](https://github.com/elfalem/Leaflet.curve)
- [Leaflet.contextmenu](https://github.com/aratcliffe/Leaflet.contextmenu)
- [Leaflet.Dialog](https://github.com/NBTSolutions/Leaflet.Dialog)
- [Leaflet.SlideMenu](https://github.com/unbam/Leaflet.SlideMenu)
- [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap)



In the base version Leaflet.RSWE plugin you can:
- draw simple indoor schemas using base shapes. e.g. walls, windows, doors. 
- rotate doors and hide walls via right-click. 
- edit schemas and correct element layouts
- configure basic View options - switch on|off grids and measurement ruler
- configure Edit options - change wall width
- configure Snap options - switch on|off snapping objects to snap grid and to another objects.
- save and restore drawings in local files (JSON) via top-menu
- export and import JSON data like this:

For import/export JSON data use code like this:

    ...
    map = new L.map('map', { center: [0,0], zoom: 24, maxZoom: 31, RSWEIndoor: true });
    ...
    JSON = map.RSWEIndoor.getData();
    ...
    map.RSWEIndoor.loadData(JSON);
    ...


(Save and restore options not implemented this version. But you can make your ows builds with your own option defaults.) 

<a name="thanks" />
## Thanks

Thanks so much to [jacobtoye](https://github.com/jacobtoye) and his [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw) plugin. That was a base source for this plugin.
Thanks to plugin developers
- [mapbox](https://github.com/mapbox) for [Leaflet.fullscreen](https://github.com/Leaflet/Leaflet.fullscreen)
- [Erik Escoffier](https://github.com/nerik) for [leaflet-graphicscale](https://github.com/nerik/leaflet-graphicscale)
- [Andrew Blakey](https://github.com/ablakey) for [Leaflet.SimpleGraticule](https://github.com/ablakey/Leaflet.SimpleGraticule)
- [elfalem](https://github.com/elfalem) for [Leaflet.curve](https://github.com/elfalem/Leaflet.curve)
- [Adam Ratcliffe](https://github.com/aratcliffe) for [Leaflet.contextmenu](https://github.com/aratcliffe/Leaflet.contextmenu)
- [NBT Solutions](https://github.com/NBTSolutions) for [Leaflet.Dialog](https://github.com/NBTSolutions/Leaflet.Dialog)
- [Masashi Takeshita](https://github.com/unbam) for [Leaflet.SlideMenu](https://github.com/unbam/Leaflet.SlideMenu)
- [Mathieu Leplatre](https://github.com/leplatrem) for [Leaflet.Snap](https://github.com/makinacorpus/Leaflet.Snap)
