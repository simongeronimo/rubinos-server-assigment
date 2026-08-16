// Checks the rotation rule, pulled straight out of index.html so it can't drift.
// Run: node test.js
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync(__dirname + '/public/index.html', 'utf8');
const S = {servers: [{id: 'a'}, {id: 'b'}, {id: 'c'}], tables: []};
const nextFor = new Function('S', src.match(/function nextFor[\s\S]*?\n}/)[0] + ' return nextFor;')(S);

const seat = (label, people, server) => S.tables.push({label, people, big: people >= 6, server});
const reg = () => nextFor(false).id, big = () => nextFor(true).id;

assert.equal(reg(), 'a', 'first table goes to the first server registered');
seat('R1', 2, 'a');
assert.equal(reg(), 'b', 'then down the list in order');

assert.equal(big(), 'a', 'big tables start their own rotation');
seat('R2', 8, 'a');
assert.equal(big(), 'b');
assert.equal(reg(), 'b', 'a big table does not move the regular rotation');

seat('R3', 4, 'b');
seat('R4', 4, 'c');
assert.equal(reg(), 'a', 'wraps around');

seat('R5', 4, 'b');   // override: skipped Ana, gave it to Bo
assert.equal(reg(), 'c', 'after an override, continue from whoever actually got the table');

S.tables = S.tables.filter(t => t.label !== 'R5');
assert.equal(reg(), 'a', 'removing a table rewinds the rotation');

console.log('ok');
