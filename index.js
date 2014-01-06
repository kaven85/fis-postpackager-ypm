/*
 * fis
 * http://fis.baidu.com/
 */

<<<<<<< HEAD
module.exports = function(ret, settings, conf, opt){ //打包后处理
    var map = {
        res : {},
        pkg : {},
        cssres:{},
        csspkg:{}
    };
    fis.util.map(ret.map.res, function(id, res){
        if('js'==res['type']){
            var r = map.res[id] = {};
            if(res.deps) r.deps = res.deps;
            //有打包的话就不要加url了，以减少map.js的体积
            if(res.pkg) {
                r.pkg = res.pkg;
            } else {
                r.url = res.uri;
            }
        }else{
            var r = map.cssres[res.uri] = {};
            if(res.deps) r.deps = res.deps;
            if(res.pkg) {
                r.pkg = res.pkg;
            } else {
                r.url = res.uri;
            }
        }

    });
    fis.util.map(ret.map.pkg, function(id, res){
        if('js'==res['type']){
            var r = map.pkg[id] = {};
            r.url = res.uri;
            if(res.deps) r.deps = res.deps;
        }else{
            var r = map.csspkg[id] = {};
            r.url = res.uri;
            if(res.deps) r.deps = res.deps;
        }
    });
	//提取html里的js外链
	var getJSLink=function(content){
		var reg=/\<script\s+(type\="text\/javascript")?\s+src\="([^"]*)"\>\s*\<\/script\>/ig,regArray,srcArray=[];
		var srcReg=/src=\"(.*)\"/i;
		regArray=content.match(reg)||[];
		for (var i = 0, l = regArray.length; i < l; i++) {
			   srcArray.push(srcReg.exec(regArray[i])[1]);
		}
		return srcArray;
	}
	var getStyleLink=function(content){
		var reg=/\<link\s+(rel\="stylesheet")?\s+href\="([^"]*)"\>\s*\<\/link\>/ig,regArray,srcArray=[];
		var srcReg=/href=\"(.*)\"/i;
		regArray=content.match(reg)||[];
		for (var i = 0, l = regArray.length; i < l; i++) {
			   srcArray.push(srcReg.exec(regArray[i])[1]);
		}
		return srcArray;
	}
    var mspObject=map;
    //只对js进行配置
    var code = 'require.resourceMap(' + JSON.stringify({res:map['res'],pkg:map['pkg']}, null, opt.optimize ? null : 4) + ');';
    //构造map.js配置文件
    var subpath = (conf.subpath || 'pkg/map.js').replace(/^\//, '');
    var file = fis.file(fis.project.getProjectPath(), subpath);
    file.setContent(code);

    ret.pkg[file.subpath] = file;
    var script = '<script src="' + file.getUrl(opt.hash, opt.domain) + '"></script>';
    fis.util.map(ret.src, function(subpath, file){
        if(file.isHtmlLike && file.noMapJs !== false){ //类html文件
            var content = file.getContent();
            var jsLinks=getJSLink(content),tmp,tmpM,replaceScripts=[],replaceAllScripts={},pkgName,scriptHtml='';
			var cssLinks=getStyleLink(content),replaceStyle=[],replaceAllStyle={},styleHtml;
            if(jsLinks.length>0){
                for (var i = 0, len = jsLinks.length; i < len; i++) {
                    tmp=jsLinks[i];
                    tmpM=tmp;
                    if(opt.md5){
                        tmp=tmp.slice(tmp.lastIndexOf('/')+1,tmp.lastIndexOf('_'))
                    }else{
                        tmp=tmp.slice(tmp.lastIndexOf('/')+1,tmp.lastIndexOf('.'))
                    }
                    if(tmp){
                        if(mspObject['res'][tmp]){
                            if(mspObject['res'][tmp]['pkg']){
                                replaceScripts.push(tmpM);
                                pkgName= mspObject['res'][tmp]['pkg'];
                                replaceAllScripts[pkgName]=mspObject['pkg'][pkgName]['url'];
                            }
                        }
                    }
                }
            }
            if(cssLinks.length>0){
                for (var i = 0, len = cssLinks.length; i < len; i++) {
                    tmp=cssLinks[i];
                    if(tmp){
                        if(mspObject['cssres'][tmp]){
                            if(mspObject['cssres'][tmp]['pkg']){
                                replaceStyle.push(tmp);
                                pkgName= mspObject['cssres'][tmp]['pkg'];
                                replaceAllStyle[mspObject['csspkg'][pkgName]['url']]=mspObject['csspkg'][pkgName]['url'];
                            }
                        }
                    }
                }
            }
            /**
             * 处理css,去除分散的css引用
             * @param {string}
             **/
            for ( i = 0, len = replaceStyle.length; i < len; i++) {
                var regex=new RegExp('<link\\s+(rel="stylesheet")?\\s+href="'+replaceStyle[i]+'">\\s*<\/link>');
                content = content.replace(regex, '');
            }
            /**
             * 处理css,引入打包的css
             * @param {string}
             **/
            for (var o in replaceAllStyle) {
                styleHtml='<link rel="stylesheet" href="'+replaceAllStyle[o]+'"></link>'
                content = content.replace(/<\/head>/, '\n'+styleHtml+'\n$&');
            }

            //=================================
            /**
             * 处理js,去除分散的js引用
             * @param {string}
             **/
            for ( i = 0, len = replaceScripts.length; i < len; i++) {
                var regex=new RegExp('<script\\s+(type="text\/javascript")?\\s+src="'+replaceScripts[i].replace('/','\/')+'">\\s*<\/script>');
                content = content.replace(regex, '');
            }
            /**
             * 处理js,引入打包的js
             * @param {string}
             **/
            for (var o in replaceAllScripts) {
                scriptHtml='<script type="text/javascript" src="'+replaceAllScripts[o]+'"></script>'
                content = content.replace(/<\/body>/, '$&\n'+scriptHtml);
=======
module.exports = function (ret, settings, conf, opt) { //打包后处理
    //把配置文件中的seajs节点配置读出来
    var fis_sea_conf = fis.config.get('seajs', {});
    fis_sea_conf.alias = fis_sea_conf.alias || {};
    //构建别名表
    fis.util.map(ret.map.res, function (id, res) {
        if ('js' == res['type']) {
            fis_sea_conf.alias[id] = res.uri;
        }
    });
    //构造seajs的config.js配置文件
    var seajs_config = fis.file(fis.project.getProjectPath(), 'sea-config.js');
    //拼接字符串，生成sea.config调用
    seajs_config.setContent('seajs.config(' + JSON.stringify(fis_sea_conf, null, opt.optimize ? null : 4) + ');');
    //把新生成的文件放到打包文件输出表
    ret.pkg[seajs_config.subpath] = seajs_config;
    //构造页面插入的script标签内容
    var script = '<script src="' + seajs_config.getUrl(opt.hash, opt.domain) + '"></script>';
    //找到所有的源码文件，对其进行配置文件script标签插入
    fis.util.map(ret.src, function (subpath, file) {
        if (file.isHtmlLike) { //类html文件
            var content = file.getContent();
            if (/\bseajs\.use\s*\(/.test(content)) { //如果有sea.use(，才会插入
                //插入到页面</head>标签结束之前
                content = content.replace(/<\/head>/, script + '\n$&');
                file.setContent(content);
>>>>>>> db0a432ad16b951a09f5c2fc6b80578e17dfb946
            }
        }
    });


};