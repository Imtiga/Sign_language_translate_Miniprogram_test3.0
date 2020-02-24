// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

//var test = require('cloudfunctions/recieve_test/add.js');

// 云函数入口函数
// exports.main = async (event, context) => {
//   //const wxContext = cloud.getWXContext()
//   let bluetoothtocloud = '0'; 
//   bluetoothtocloud = event.a
//   //bluetoothtocloud = test.add(event.a);

//   const res = await cloud.callFunction({
//     // 要调用的云函数名称
//     name: 'add',
//     // 传递给云函数的参数
//     data: {
//       a: 1,
//       b: 2,
//     }
//   })
//   // 3
//   return res.result
// }

exports.main = async (event, context) => {
  
}
