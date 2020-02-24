// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

//定义要调用的js文件所在位置
//var test = require('cloudfunctions/recieve/test.js');

// 云函数入口函数
// exports.main = async (event, context) => {
//   const wxContext = cloud.getWXContext()

//   let bluetoothtocloud = '0'; 
//   bluetoothtocloud = test.testOnCloud(event.a,event.a);
//   // bluetoothtocloud = event.a;

//   return {
//     // event,
//     // openid: wxContext.OPENID,
//     // appid: wxContext.APPID,
//     // unionid: wxContext.UNIONID,
//     //sum: event.a + event.b,
//     bluetoothtocloud
//   }
// }

exports.main = async (event, context) => {

  let c = 0
  return {
    c = event.a + 1
  }
}
