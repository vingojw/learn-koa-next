'use strict';
var fs = require('fs');
var path = require('path');

var Koa = require('koa');
var app = new Koa();
var router = require('koa-router')();

var logger = require('koa-logger');
app.use(logger());

//模拟请求
var superagent = require('superagent');


//上传
//每次使用 一个 multer 都会生成一个实例
var multer = require('koa-multer');
//var uploadsSingle = multer({dest:'uploads/'});

//单文件
var storage = multer.diskStorage({ 
	destination: 'uploads/',  // 注意这里的格式呀，  囧
	filename: function (req, file, cb) {
		 var fileFormat = (file.originalname).split(".");
		cb(null, file.fieldname + '-lalalalala' + Date.now()+'.'+fileFormat.pop())
	}
})
var uploadsSingle = multer({storage: storage});

//多文件
var uploadsArray = multer({dest:'uploads1/'});

// 带进度条的上传
var uploadProgress = multer({dest:'uploadProgress/'});

//router post请求  https://github.com/koajs/bodyparser/tree/3.x
var bodyParser = require('koa-bodyparser');
app.use(bodyParser());

router
	.get('/',function(ctx, next){
		
		//ctx.cookies.get('expires')//获取cookie
		//session 级别 httpOnly 默认为true  
		//设置session cookie的办法是：在创建cookie不设置Expires即可
		ctx.cookies.set('test','test');
		ctx.cookies.set('expires','2016/4/20',{expires: new Date('2016/5/20') });
		//httpOnly:false
		ctx.cookies.set('httpOnlyFalse','httpOnlyFalse',{httpOnly:false});

		// Cookie.prototype.path = "/";
		// Cookie.prototype.expires = undefined;
		// Cookie.prototype.domain = undefined;
		// Cookie.prototype.httpOnly = true;
		// Cookie.prototype.secure = false;
		// Cookie.prototype.overwrite = false;
		//ctx.throw('sss',502);  //抛出一个错误
		
		//载入静态文件
		ctx.body = fs.createReadStream(path.join(__dirname, 'index.html'));
		ctx.type = 'html'; // 不加这句访问的时候就会当文件下载下来。
		 

	})
	.get('/chat',function(ctx, next){
		ctx.body = fs.createReadStream(path.join(__dirname, 'chat.html'));
		ctx.type = 'html'; // 不加这句访问的时候就会当文件下载下来。
	})
	.get('/users/:id', function (ctx, next){
		//http://localhost:3000/users/123
		ctx.body = {search:ctx.params.id};
	})  
	.post('/post', function(ctx, next){
		// //浏览器发起post请求
		// xhr = new XMLHttpRequest();
		// xhr.open('post', 'http://localhost:3000/post', true);
		// //application/x-www-form-urlencoded： 窗体数据被编码为名称/值对。
		// xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		// xhr.onreadystatechange = function(){
		//    if(xhr.readyState == 4 && xhr.status == 200){
		//            console.log(xhr.responseText);
		//    }
		// }
		// xhr.send('id=1');
		var id = ctx.request.body.id;  
		ctx.body = "you post data:"+JSON.stringify({id:id}); 
	})
	.get('/timeout/:str/:ms' , async function(ctx){
		//指定时间返回指定字符串
		//访问:  http://localhost:3000/timeout/str/1500
		console.log('ctx.params.ms--->'+ctx.params.ms);
		var s = await timeOut(ctx.params.ms);
		ctx.body = s + ctx.params.str
		console.log(ctx.params.str);
	}).
	get('/close', function(ctx){
		return ctx.req.destroy();
	})

	// multer上传相关
	// 文章：https://cnodejs.org/topic/564f32631986c7df7e92b0db
	// muilter.single(‘file’), //适用于单文件上传
	// muilter.array(‘file’,num), //适用于多文件上传，num为最多上传个数，上传文件的数量可以小于num,
	// muilter.fields(fields), //适用于混合上传，比如A类文件1个，B类文件2个。官方API有详细说明。
	//单个文件
	.post('/profile', uploadsSingle.single('avatar'),function(ctx){
		ctx.body = `
			上传成功${ctx.req.file.filename}
			文件路径${ctx.req.file.path}
		`;
		console.log('上传成功'+ctx.req.file.filename);
		console.log('文件路径'+ctx.req.file.path);
		//ctx.req.file.filename  文件名
		//ctx.req.file.path      文件路径
	})
	// .post('/profile', function(ctx,next){
	// 	uploadsSingle.single('avatar')(ctx.req, ctx.res,function(err){
	// 		if(err){
	// 			console.log('出错了');
	// 			return;
	// 		}

	// 		console.log('上传成功!');
	// 	})
	// }) 
	//多文件
	.post('/profilelist', uploadsArray.fields([
		{ name: 'avatar', maxCount: 2 }
	]), function(ctx){
		ctx.body="fieldsOk";
	} )
	//带进度条的上传
	.post('/profileProgress', uploadProgress.single('progress'),function(ctx, next){
		ctx.body = "profileProgressOK";
	})
	//模拟 .get('/users 接口
	.get('/superagentUsers', async function(ctx){
		var getUsers = await new Promise((resolve)=>{
			superagent.get('http://localhost:3000/users/test').end(function(err,res){
				console.log(res.text);
				resolve(res.text);
			})
		});

		ctx.body = getUsers;
	})




	function timeOut(ms){
		return new Promise((resolve)=>{
			setTimeout(function(){
				resolve('ok');
			},ms);
		});
	}


	app.use((ctx, next) => {
		const start = new Date();
		return next().then(() => {
			const ms = new Date() - start;
			console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
		});
	});

	console.log(process.env.NODE_ENV);

	// app.use(ctx => {
	// 	//ctx.body = 'hello Koa';
	// 	//ctx.body = {a:1};  
	// 	//
	// 	//console.log(ctx.request);
	// 	//console.log(this.cookies);
	// 	//建议api写法
	// 	ctx.body={
	// 		"status": {
	// 			"code": 10000,
	// 			"message": 'Success'
	// 	  	},
	// 	  "data": {
	// 	    // ...results...
	// 	  }
	// 	};
	// });
	



app
	.use(router.routes())
	.use(router.allowedMethods())
	


//koa-send: 用于处理静态文件
//http://stackoverflow.com/questions/32721311/koa-js-serving-static-files-and-rest-api
// this last middleware catches any request that isn't handled by
// koa-static or koa-router, ie your index.html in your example
//https://www.npmjs.com/package/koa-send
var send = require('koa-send');
app.use(async function (ctx, next){
  //if ('/' == ctx.path) return ctx.body = 'Try GET /package.json';
  await send(ctx, ctx.path);
  //console.log(ctx.path+'------------------');
  //await send(ctx, '/src/socket.io/socket.io.js');
})


//socket 链接  放在最后一个 use 后面
//https://www.npmjs.com/package/koa-socket
var IO = require('koa-socket');
var io = new IO();
io.attach(app);
 

io.on('connection', function (socket) {
  console.log('a user connected');
  
});

io.on('chat message', function (ctx, data) {
	io.socket.emit('chat message', data);
    console.log('message: ' + data);
});
 
io.socket.emit('chat message', {for:'everyone'});

app.listen(3000, function(){
	console.log('listening on * 3000');
})




console.log('访问：http://localhost:3000');
console.log('可以编辑./src/app.js，保存后自动重启服务');