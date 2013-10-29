# fis-postpackager-ypm

a postpackager plugin for fis to process map.json and create map.js and package js for ypm

## usage

    $ npm install -g fis-postpackager-ypm
    $ vi path/to/project/fis-conf.js

```javascript
//file : path/to/project/fis-conf.js
fis.config.set('modules.postpackager', 'ypm');
//settings
fis.config.set('settings.postpackager.modjs.subpath', 'pack/map.js');
```