'use strict';

var Koa = require('koa');
var app = new Koa();
var router = require('koa-router')();

var logger = require('koa-logger');
app.use(logger());

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
		ctx.body = '121932631112635269';
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

	function timeOut(ms){
		return new Promise((resolve)=>{
			setTimeout(function(){
				resolve('ok');
			},ms);
		})
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

console.log('http://localhost:3000');