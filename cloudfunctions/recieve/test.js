
function testOnCloud(a,b){

  let c = 0;
  c = a + b;

  return {
    c
  }
}

//打开被其他就是文件调用的接口
module.exports.testOnCloud = testOnCloud;