/*
 * fis
 * http://fis.baidu.com/
 */

module.exports = function(ret, settings, conf, opt){ //打包后处理
    var map = {
        res : {},
        pkg : {}
    };
    fis.util.map(ret.map.res, function(id, res){
        var r = map.res[id] = {};
        if(res.deps) r.deps = res.deps;
        //有打包的话就不要加url了，以减少map.js的体积
        if(res.pkg) {
            r.pkg = res.pkg;
        } else {
            r.url = res.uri;
        }
    });
    fis.util.map(ret.map.pkg, function(id, res){
        var r = map.pkg[id] = {};
        r.url = res.uri;
        if(res.deps) r.deps = res.deps;
    });
	var jsLink=[];
	//提取html里的js外链
	var getJSLink=function(content){
		var reg=/<script.*src=\S(.*?)\S><\/script>/ig,regArray,srcArray=[];
		var srcReg=/src=\"(.*)\"/i;
		jsLink=regArray=content.match(reg)||[];
		for (var i = 0, l = regArray.length; i < l; i++) {
			   srcArray.push(srcReg.exec(regArray[i])[1]);
		}
		return srcArray;
	}
    var mspObject=map;
    var code = 'require.resourceMap(' + JSON.stringify(map, null, opt.optimize ? null : 4) + ');';
    //构造map.js配置文件
    var subpath = (conf.subpath || 'pkg/map.js').replace(/^\//, '');
    var file = fis.file(fis.project.getProjectPath(), subpath);
    file.setContent(code);

    ret.pkg[file.subpath] = file;

    var script = '<script src="' + file.getUrl(opt.hash, opt.domain) + '"></script>';
    fis.util.map(ret.src, function(subpath, file){
        if(file.isHtmlLike && file.noMapJs !== false){ //类html文件
            var content = file.getContent();
            var jsLinks=getJSLink(content),tmp,replaceScripts=[],replaceAllScripts={},pkgName,scriptHtml='';
            if(jsLinks.length>0){
                for (var i = 0, len = jsLinks.length; i < len; i++) {
                    tmp=jsLinks[i];
                    tmp=tmp.slice(tmp.lastIndexOf('/')+1,tmp.lastIndexOf('.'));
                    if(tmp){
                        if(mspObject['res'][tmp]){
                            if(mspObject['res'][tmp]['pkg']){
                                replaceScripts.push(tmp);
                                pkgName= mspObject['res'][tmp]['pkg'];
                                replaceAllScripts[pkgName]=mspObject['pkg'][pkgName]['url'];
                            }
                        }
                    }
                }
            }
            for ( i = 0, len = replaceScripts.length; i < len; i++) {
                var regex=new RegExp('<script.*?'+replaceScripts[i]+'.*?<\/script>');
                content = content.replace(regex, '');
            }
            for (var o in replaceAllScripts) {
                scriptHtml='<script type="text/javascript" src="'+replaceAllScripts[o]+'"></script>'
                content = content.replace(/<\/body>/, '$&\n'+scriptHtml);
            }
            content = content.replace(/<\/head>/, script + '\n$&');
            file.setContent(content);
        }
    });
};