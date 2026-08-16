// Checks the assignment rule, pulled straight out of index.html so it can't drift.
// Run: node test.js
const fs = require('fs'), assert = require('assert');
const src = fs.readFileSync(__dirname + '/public/index.html', 'utf8');
const S = {servers: [{id: 'a'}, {id: 'b'}, {id: 'c'}], tables: []};
const nextFor = new Function('S', src.match(/function nextFor[\s\S]*?\n}/)[0] + ' return nextFor;')(S);

const seat = (label, people, server) => S.tables.push({label, people, big: people >= 6, server});
const reg = () => nextFor(false).id, big = () => nextFor(true).id;

assert.equal(reg(), 'a', 'nobody has a table yet: the first server registered');

// Overriding must not cost the skipped server their turn.
seat('R1', 2, 'b');
assert.equal(reg(), 'a', 'b was given the first table, but a is still owed one');
seat('R2', 2, 'a');
assert.equal(reg(), 'c', 'now c is the only one without');
seat('R3', 2, 'c');
assert.equal(reg(), 'a', 'all level at one: back to the first registered');

// Big tables are counted on their own.
assert.equal(big(), 'a', 'no big tables yet');
seat('R4', 8, 'c');
assert.equal(big(), 'a', 'a and b are still level at zero big tables');
assert.equal(reg(), 'a', 'and the big table did not touch the regular count');
seat('R5', 7, 'a');
assert.equal(big(), 'b', 'b is the only one without a big table');

// Moving a table re-aims the recommendation at once.
seat('R6', 2, 'a');                       // a: 2 regular, b: 1, c: 1
assert.equal(reg(), 'b', 'b registered before c, both on one');
S.tables.find(t => t.label === 'R6').server = 'c';   // dragged from a to c
assert.equal(reg(), 'a', 'a gave one away and is now lightest');

// Removing one does too.
S.tables = S.tables.filter(t => t.label !== 'R1');   // b loses its only regular table
assert.equal(reg(), 'b', 'b has none again');

// A party size edit across 6 moves a table between the two counts.
const t = S.tables.find(x => x.label === 'R2');      // a's regular table
t.people = 6; t.big = true;
assert.equal(reg(), 'a', 'a is down to zero regular tables too, and registered before b');
assert.equal(big(), 'b', 'b is the only one with no big table');

console.log('ok');
