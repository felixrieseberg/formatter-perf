const perfy = require('perfy');
const os = require('os');
const util = require('util');

function getTimestamp() {
  const d = new Date();
  let ms = d.getMilliseconds();
  ms = ms < 999 ? `00${ms}`.slice(-3) : ms;

  const t = `${d.getHours()}:${d.getMinutes()}:${d.getMinutes()}:${ms}`;
  return `${d.getMonth()}/${d.getDate()}/${d.getFullYear().toString().slice(2)}, ${t}`;
}

function formatterA(options) {
  const { timestamp, level, message, meta } = options;

  // util.inspect is superior to JSON.stringify in almost every way
  const metaString = meta && Object.keys(meta).length > 0 ? `${os.EOL}${util.inspect(meta)}` : '';
  const messageString = `${level || 'nolevel'}: ${message || '(no message)'}${metaString}`;
  const timestampString = typeof timestamp === 'function' ? `[${timestamp()}] ` : '';

  return `${timestampString}${messageString}`;
}

function formatterB(options) {
  const { timestamp, level, message, meta } = options;
  let metaString = '';

  if (meta && Object.keys(meta).length > 0) {
    try {
      metaString = `${os.EOL}${JSON.stringify(meta)}`;
    } catch (error) {
      metaString = `${os.EOL}${util.inspect(meta)}`;
    }
  }

  const messageString = `${level || 'nolevel'}: ${message || '(no message)'}${metaString}`;
  const timestampString = typeof timestamp === 'function' ? `[${timestamp()}] ` : '';

  return `${timestampString || ''}${messageString}`;
}

const options = {
  timestamp: getTimestamp,
  level: 'info',
  message: `Hi, I'm a simple test message`,
  meta: process.env
}

// Test
function test(iterations = 1000) {
  perfy.start('old-formatter');
  for (let i = 0; i < iterations; i++) {
    formatterA(options);
  }
  var oldResult = perfy.end('old-formatter');

  perfy.start('new-formatter');
  for (let i = 0; i < iterations; i++) {
    formatterB(options);
  }
  var newResult = perfy.end('new-formatter');

  return { oldResult, newResult };
}

console.log(`Running both formatters, each 5000 times:`);

const results = [];

for (let i = 0; i < 5; i++) {
  const result = test(5000);
  results.push(result);
  console.log(`Old: ${result.oldResult.time} seconds`);
  console.log(`New: ${result.newResult.time} seconds`);
  console.log(`----------------------`);
}

const oldAvg = (results.map((v) => v.oldResult.time).reduce((a, b) => a + b, 0) / results.length).toFixed(4);
const newAvg = (results.map((v) => v.newResult.time).reduce((a, b) => a + b, 0) / results.length).toFixed(4);
const diff = oldAvg - newAvg;
const improvement = diff % oldAvg * 100;

console.log(`\nAverages:`)
console.log(`Old: ${oldAvg} seconds`);
console.log(`New: ${newAvg} seconds`);
console.log(`Improvement: ${improvement}%`);
