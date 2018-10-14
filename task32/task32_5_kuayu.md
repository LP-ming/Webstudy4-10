# 跨域的几种方法

1. JSONP
2. CROS
3. 降域
4. postMessage

## JSONP
HTML 中 script 标签可以加载其他域下的js，比如我们经常引入一个其他域下线上cdn的jQuery。那如何利用这个特性实现从其他域下获取数据呢？

可以先这样试试：
```js
<script src="http://api.jirengu.com/weather.php"></script>
```
这时候会向天气接口发送请求获取数据，获取数据后做为 js 来执行。 但这里有个问题， 数据是 JSON 格式的数据，直接作为 JS 运行的话我如何去得到这个数据来操作呢？

这样试试：
```js
<script src="http://api.jirengu.com/weather.php?callback=showData"></script>
```
这个请求到达后端后，后端会去解析callback这个参数获取到字符串showData，在发送数据做如下处理：

之前后端返回数据： {"city": "hangzhou", "weather": "晴天"} 现在后端返回数据： showData({"city": "hangzhou", "weather": "晴天"}) 前端script标签在加载数据后会把 「showData({“city”: “hangzhou”, “weather”: “晴天”})」做为 js 来执行，这实际上就是调用showData这个函数，同时参数是 {“city”: “hangzhou”, “weather”: “晴天”}。 用户只需要在加载提前在页面定义好showData这个全局函数，在函数内部处理参数即可。
```js
<script>
function showData(ret){
console.log(ret);
}
</script>
<script src="http://api.jirengu.com/weather.php?callback=showData"></script>
```
这就是 JSONP(JSON with padding)

总结一下：

JSONP是通过 script 标签加载数据的方式去获取数据当做 JS 代码来执行 提前在页面上声明一个函数，函数名通过接口传参的方式传给后台，后台解析到函数名后在原始数据上「包裹」这个函数名，发送给前端。换句话说，JSONP 需要对应接口的后端的配合才能实现。

server.js

```js
var http = require('http')
var fs = require('fs')
var path = require('path')
var url = require('url')

http.createServer(function(req, res){
  var pathObj = url.parse(req.url, true)

  switch (pathObj.pathname) {
    case '/getNews':
      var news = [
        "第11日前瞻：中国冲击4金 博尔特再战200米羽球",
        "正直播柴飚/洪炜出战 男双力争会师决赛",
        "女排将死磕巴西！郎平安排男陪练模仿对方核心"
        ]
      res.setHeader('Content-Type','text/json; charset=utf-8')
      if(pathObj.query.callback){
        res.end(pathObj.query.callback + '(' + JSON.stringify(news) + ')')
      }else{
        res.end(JSON.stringify(news))
      }

      break;

    default:
      fs.readFile(path.join(__dirname, pathObj.pathname), function(e, data){
        if(e){
          res.writeHead(404, 'not found')
          res.end('<h1>404 Not Found</h1>')
        }else{
          res.end(data)
        }
      }) 
  }
}).listen(8080)
```
index.html
```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <ul class="news">
    </ul>
    <button class="show">show news</button>
  </div>

<script>

  $('.show').addEventListener('click', function(){
    var script = document.createElement('script');
    script.src = 'http://127.0.0.1:8080/getNews?callback=appendHtml';
    document.head.appendChild(script);
    document.head.removeChild(script);
  })

  function appendHtml(news){
    var html = '';
    for( var i=0; i<news.length; i++){
      html += '<li>' + news[i] + '</li>';
    }
    console.log(html);
    $('.news').innerHTML = html;
  }

  function $(id){
    return document.querySelector(id);
  }
</script>
</html>
```
打开终端，输入 node server.js ，浏览器打开 http://localhost:8080/index.html

## CORS
CORS 全称是跨域资源共享（Cross-Origin Resource Sharing），是一种 ajax 跨域请求资源的方式，支持现代浏览器，IE支持10以上。 实现方式很简单，当你使用 XMLHttpRequest 发送请求时，浏览器发现该请求不符合同源策略，会给该请求加一个请求头：Origin，后台进行一系列处理，如果确定接受请求则在返回结果中加入一个响应头：Access-Control-Allow-Origin; 浏览器判断该相应头中是否包含 Origin 的值，如果有则浏览器会处理响应，我们就可以拿到响应数据，如果不包含浏览器直接驳回，这时我们无法拿到响应数据。所以 CORS 的表象是让你觉得它与同源的 ajax 请求没啥区别，代码完全一样。

server.js

```js
var http = require('http')
var fs = require('fs')
var path = require('path')
var url = require('url')

http.createServer(function(req, res){
  var pathObj = url.parse(req.url, true)

  switch (pathObj.pathname) {
    case '/getNews':
      var news = [
        "第11日前瞻：中国冲击4金 博尔特再战200米羽球",
        "正直播柴飚/洪炜出战 男双力争会师决赛",
        "女排将死磕巴西！郎平安排男陪练模仿对方核心"
        ]

      res.setHeader('Access-Control-Allow-Origin','http://localhost:8080')
      //res.setHeader('Access-Control-Allow-Origin','*')
      res.end(JSON.stringify(news))
      break;
    default:
      fs.readFile(path.join(__dirname, pathObj.pathname), function(e, data){
        if(e){
          res.writeHead(404, 'not found')
          res.end('<h1>404 Not Found</h1>')
        }else{
          res.end(data)
        }
      }) 
  }
}).listen(8080)
```
index.html
```html
<!DOCTYPE html>
<html>
<body>
  <div class="container">
    <ul class="news">

    </ul>
    <button class="show">show news</button>
  </div>

<script>

  $('.show').addEventListener('click', function(){
    var xhr = new XMLHttpRequest()
    xhr.open('GET', 'http://127.0.0.1:8080/getNews', true)
    xhr.send()
    xhr.onload = function(){
      appendHtml(JSON.parse(xhr.responseText))
    }
  })

  function appendHtml(news){
    var html = ''
    for( var i=0; i<news.length; i++){
      html += '<li>' + news[i] + '</li>'
    }
    $('.news').innerHTML = html
  }

  function $(selector){
    return document.querySelector(selector)
  }
</script>
</html>
```
启动终端，执行 node server.js ，浏览器打开 http://localhost:8080/index.html ,查看效果和网络请求

## 降域
降域主要应用在域名相同的网站之间的跨域

举个例子
```html
http://a.jrg.com:8080/a.html
http://b.jrg.com:8080/a.html
```
根据同源策略上面的两个网址是不是本域，但他们的域名相同，都是jrg.com所以可以通过降域的方式跨域 。具体的实现方法分别在对应的网页的JS中加入
```html
document.domain = "jrg.com";
```
## postMessage
postMessage是html5新引入的API，允许来自不同源的脚本采用异步方式进行有限的通信，可以实现跨文本档、多窗口、跨域消息传递。

### 语法

### 1. 发送
```js
otherWindow.postMessage(message, targetOrigin, [transfer]);
```
* otherWindow

    其他窗口的一个引用，比如iframe的contentWindow属性、执行window.open返回的窗口对象、或者是命名过或数值索引的window.frames。
* message
    将要发送到其他 window的数据。它将会被[结构化克隆算法序列化。这意味着你可以不受什么限制的将数据对象安全的传送给目标窗口而无需自己序列化。
* targetOrigin
    通过窗口的origin属性来指定哪些窗口能接收到消息事件，其值可以是字符串""（表示无限制）或者一个URI。在发送消息的时候，如果目标窗口的协议、主机地址或端口这三者的任意一项不匹配targetOrigin提供的值，那么消息就不会被发送；只有三者完全匹配，消息才会被发送。这个机制用来控制消息可以发送到哪些窗口；例如，当用postMessage传送密码时，这个参数就显得尤为重要，必须保证它的值与这条包含密码的信息的预期接受者的orign属性完全一致，来防止密码被恶意的第三方截获。如果你明确的知道消息应该发送到哪个窗口，那么请始终提供一个有确切值的targetOrigin，而不是。不提供确切的目标将导致数据泄露到任何对数据感兴趣的恶意站点。
* transfer
    可选是一串和message 同时传递的 Transferable
    对象. 这些对象的所有权将被转移给消息的接收方，而发送一方将不再保有所有权。
### 2. 监听
执行如下代码, 其他window可以监听派遣的message:
```js
window.addEventListener("message", receiveMessage, false);

function receiveMessage(event)
{
  // For Chrome, the origin property is in the event.originalEvent
  // object.
  var origin = event.origin || event.originalEvent.origin; 
  if (origin !== "http://example.org:8080")
    return;

  // ...
}
```
### message 的属性有:

* data
    从其他 window 中传递过来的对象。
* origin
    调用 postMessage时消息发送方窗口的 origin。这个字符串由 协议、“://“、域名、“ : 端口号”拼接而成。
* source
    对发送消息的窗口对象的引用; 您可以使用此来在具有不同origin的两个窗口之间建立双向通信。

# END