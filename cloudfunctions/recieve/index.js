// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  let bluetoothtocloud = '0'; 
  bluetoothtocloud = event.a;

  return {
    // event,
    // openid: wxContext.OPENID,
    // appid: wxContext.APPID,
    // unionid: wxContext.UNIONID,
    //sum: event.a + event.b,
    bluetoothtocloud
  }
}
