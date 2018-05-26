# if(xxx)判断
在js中尽量使用if(变量 === 判定值)的方式使用if条件语句，
使用if(变量)的方式使用if条件语句，容易产生你所不希望的结果，
先来看看如下的代码
if ("hello") {
    console.log("hello")
}
//true

if ("") {
    console.log('empty')
}
//flase

if (" ") {
    console.log('blank')
}
//true

if ([0]) {
    console.log('array')
}
//true

if('0.00'){
  console.log('0.00')
}
//true
有些能够输出，有些不能输出

那么上面的if是按照什么原理的呢?
实际上在js是把括号里面的变量转化成布尔类型的变量然后进行判断的。
遵循以下原则

|  类型|  结果 |
| ------------ | ------------ |
|  Undefined |   false|
| Nul  | false  |
|  Boolean |  直接判断 |
|String   |  除了空字符串为false，其他为true|
|  Number | 除了0，-0，+0，Nan其他为 true |
| Object  | true  |




# a == b
在js中有‘=’，‘==’，‘===’三种等号
分别代表赋值，不严格相等，严格相同
==在比较相同类型的数据时，和===是一样的结果。
而不同的数据类型在进行===比较时会直接返回fals。

而==则不一样，有如下的规则

|  ==两边变量的类型 | 规则  |
| ------------ | ------------ |
|   原始类型的值| 原始类型的数据会转换成数值类型再进行比较  |
|  对象与原始类型值比较 |对象（这里指广义的对象，包括数组和函数）与原始类型的值比较时，对象转化成原始类型的值，再进行比较   |
|   undefined 和 null| undefined和null与其他类型的值比较时，结果都为false，它们互相比较时结果为true  |
|   相等运算符的缺点|  相等运算符隐藏的类型转换，会带来一些违反直觉的结果 |

###举例
- 0 == ''             // true
- 0 == '0'            // true
- 2 == true           // false
- 2 == false          // false
- false == 'false'    // false
- false == '0'        // true
- false == undefined  // false
- false == null       // false
- null == undefined   // true
- ' \t\r\n ' == 0     // true
所以日常最好使用严格相等运算符===。

