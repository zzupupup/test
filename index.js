'use strict'

const fs = require('fs');

const {request} = require('./request');

// 解析配置文件
let config = JSON.parse(fs.readFileSync('./config.json'));

// 添加环境测试
// process.env.COOKIE = 
// process.env.TOKEN = 

// 读取cookie
request.defaults.headers.common.cookie = eval(config.COOKIE);

request.defaults.headers.common["user-agent"] = config["User-Agent"];

// 签到请求
const checkIn = () =>{
  return request({
    method: 'post',
    url: 'https://glados.rocks/api/user/checkin',
    data: {
      token: 'glados_network',
    }
  })
}

// 获得状态
const getStatus = ()=>{
  return request({
    method: 'get',
    url: 'https://glados.rocks/api/user/status',
    data: {
      token: 'glados_network',
    }
  })
}

// 处理数据结果
function dealData(checkInRes, statusRes){
  return {
    message: checkInRes.message,
    // checkInRec: checkInRes.list,
    useDays: statusRes.days,
    email: statusRes.email,
    leftDays: parseFloat(statusRes.leftDays).toFixed(),
  }
}

function pushMessage(content){
  return request({
    method: 'get',
    url: 'http://pushplus.hxtrip.com/send',
    data: {
      token: eval(config.TOKEN),
      title: 'GlaDos签到结果',
      content: content,
      template: 'html',
    } 
  });
}

function prettyRes(res, during){
  let {useDays, leftDays, message, email} = res;
  let content = "<table border='1px solid black'><thead><tr><td>key</td><td>value</td></tr></thead><tbody>";
  let tr1 = "<tr><td>useDays</td><td>" + useDays + "</td></tr>";
  let tr2 = "<tr><td>leftDays</td><td>" + leftDays + "</td></tr>";
  let tr3 = "<tr><td>email</td><td>" + email + "</td></tr>";
  let tr4 = "<tr><td>message</td><td>" + message + "</td></tr>";
  let tr5 = "<tr><td>cost</td><td>" + during + "</td></tr>";
  let tail = "</tbody></table>";
  content += (tr1 + tr2 + tr3 + tr4 + tr5 + tail);
  
  return content
}

async function main(){
  let start = new Date();
  const checkInRes =  await checkIn();
  const StatusRes = await getStatus();
  let end = new Date();
  let during = (end - start) / 1000;
  let res = dealData(checkInRes.data, StatusRes.data.data);
  console.log(res);
  console.log("done, use " + during + "s");
  let content = prettyRes(res, during);
  pushMessage(content);
}

main();
