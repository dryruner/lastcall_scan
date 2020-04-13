const fs = require('fs');
const fetch = require('node-fetch');
const config = require('./config.txt');

const pattern = /Sold Out/g;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scan(startIndex, maxNum, debug = false) {
  const soldout = "prod" + startIndex + "_to_prod" + (startIndex + maxNum) + "_soldout.txt";
  const available = "prod" + startIndex + "_to_prod" + (startIndex + maxNum) + "_available.txt";
  for (let i = startIndex; i < startIndex + maxNum; i++) {
    // http://www.lastcall.com/prod42880600/p.prod 
    let url = "http://www.lastcall.com/prod" + i + "/p.prod";
    let resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.163 Safari/537.36' }
    });
//    console.log(resp);
    if (resp.status != 200) {
      let log = `--- Scanning terminated with url "${url}", response code ${resp.status} \n`;
      if (debug) console.log(log);
      await fs.writeFileSync('result.txt', log);
      return;
    }
    let respText = await resp.text();
    if (pattern.test(respText)) {
      if (debug) console.log(`--- ${url} SOLD OUT, skipped...`);
      fs.appendFile(soldout, url + '\n', err => {
        if (err) console.log(err);
      });
    } else {
      if (debug) console.log(`$$$ ${url}`);
      fs.appendFile(available, url + '\n', err => {
        if (err) console.log(err);
      });
    }
    await sleep(1000);  // 1 seconds
  }
  await fs.writeFileSync('result.txt', "Scanning finished successfully!");
}

scan(config.startIndex, config.maxNum);
