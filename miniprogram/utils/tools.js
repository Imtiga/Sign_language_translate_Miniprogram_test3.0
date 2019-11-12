
function getJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText)
  };
  xhr.open('GET', url, true);
  xhr.send();
}


export function getBLEName() {
  var BleDevs = "88a0";
  return BleDevs;
} 