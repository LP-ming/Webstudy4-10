app.get('/getNews', function(req, res) {
  var news = [
  "看电视",
  '大学在学习',
  '大家在跑步',
  '天气预报',
  '我要吃饭',
  '看电视'
]
var data = [];
for(var i=0; i<3; i++){
  var index = parseInt(Math.random()*news.length);
  data.push(news[index]);
news.splice(index,1);
}
res.header("Access-Control-Allow-Origin","http://a.jrg.com:8080");//CORS
//res.header("Access-Control-Allow-Origin","*");
res.send( data );
});