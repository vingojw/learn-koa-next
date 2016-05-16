'use strict';

var Koa = require('koa');
var app = new Koa();
var router = require('koa-router')();

var logger = require('koa-logger');
app.use(logger());

//上传
debugger;
//每次使用 一个 multer 都会生成一个实例
var multer = require('koa-multer');
//var uploadsSingle = multer({dest:'uploads/'});

//单文件
var storage = multer.diskStorage({ 
	destination: 'uploads/',  // 注意这里的格式呀，  囧
	filename: function (req, file, cb) {
		debugger;
		 var fileFormat = (file.originalname).split(".");
		cb(null, file.fieldname + '-lalalalala' + Date.now()+'.'+fileFormat.pop())
	}
})
var uploadsSingle = multer({storage: storage});

//多文件
var uploadsArray = multer({dest:'uploads1/'});

// 带进度条的上传
var uploadProgress = multer({dest:'uploadProgress/'});

// multer.diskStorage({

// });

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
		ctx.body = ` 
		<form action="/profile" method="POST" enctype="multipart/form-data">
		  单文件: 
		  <input type="file" name="avatar">
		  <input type="submit" value="Upload Image">
		</form> 
		<form action="/profilelist" method="POST" enctype="multipart/form-data">
		  多文件:
		  <input type="file" name="avatar" multiple />
		  <input type="submit" value="Upload Image">
		</form>

		<p>进度条：</p>
		<input id="filename" type="file" multiple="multiple" />
		<progress id="uploadprogress" min="0" max="100" value="0">0</progress>
		<button id="btn">上传</button>
		<script>
			document.getElementById('btn').onclick = function(){
				go();
			}
			function go(){
				debugger;
				var xhr = new XMLHttpRequest();

				var files = document.getElementById('filename').files;
				var formData = new FormData();
				formData.append('progress', files[0]); // index 为第 n 个文件的索引


				xhr.open('post', '/profileProgress'); // url 为提交的后台地址
				
				// 定义上传完成后的回调函数
				xhr.onload = function () {
					if (xhr.status === 200) {
					　　console.log('上传成功');
					} else {
					　　console.log('出错了');
					}
				};
				//定义在 send 前面
				xhr.upload.onprogress = function (event) {
					if (event.lengthComputable) {
						console.log(event.loaded);
						console.log(event.total);
						var complete = (event.loaded / event.total * 100 | 0);
						var progress = document.getElementById('uploadprogress');
						progress.value = progress.innerHTML = complete;
					}
				};
				xhr.send(formData);
				// xhr.upload.addEventListener("progress", function(event){
				// 	　　　　　var complete = (event.loaded / event.total * 100 | 0);
				// 	　　　　　var progress = document.getElementById('uploadprogress');
				// 	　　　　　progress.value = progress.innerHTML = complete;
				// }, false); 
				// 处理上传进度
				// xhr.addEventListener("load", uploadComplete, false); // 处理上传完成
				// xhr.addEventListener("error", uploadFailed, false); // 处理上传失败
				// xhr.addEventListener("abort", uploadCanceled, false); // 处理取消上传



			}

		</script>

		`;
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
	.listen(3000);

console.log('访问：http://localhost:3000');
console.log('可以编辑./src/app.js，保存后自动重启服务');