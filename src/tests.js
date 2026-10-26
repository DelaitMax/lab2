const { parse } = require('./parser.js');
const { findMatches } = require('./matcher.js');

const cases = [
	['a(b|c)*d', 'xabcbdy', 'abcbd'],
	['[a-c]+x', 'zzabcx', 'abcx'],
	['colou?r', 'color colour', 'color,colour'],
	['a.c', 'abc a-c', 'abc,a-c'],
	['a|b', 'xaby', 'a,b'],
	['[^0-9]+', '12ab34', 'ab'],
	['\\*', '2*3', '*'],
	['(a|ab)(c|bcd)', 'abcd', 'abcd'],
	['(a*)*b', 'aaab', 'aaab'],
	['abc', 'xyz', ''],
	['(ab', 'x', 'ERROR'],
	['ab)', 'x', 'ERROR'],
	['*a', 'x', 'ERROR'],
	['a|*', 'x', 'ERROR'],
	['a**', 'x', 'ERROR'],
	['a\\', 'x', 'ERROR'],
	['[abc', 'x', 'ERROR'],
	['[z-a]', 'x', 'ERROR'],
	['()', 'x', 'ERROR'],
	['a||b', 'x', 'ERROR'],
];

let failed = 0;
for (const [expr, text, expected] of cases) {
	let actual;
	try {
		const found = findMatches(parse(expr), text);
		actual = found.map((m) => text.slice(m.start, m.end)).join(',');
	} catch (e) {
		if (e.pos === undefined) throw e;
		actual = 'ERROR';
	}
	const ok = actual === expected;
	if (!ok) failed++;
	console.log(
		(ok ? 'ok ' : 'FAIL ') +
			JSON.stringify(expr) +
			' on ' +
			JSON.stringify(text) +
			(ok ? '' : '  expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual)),
	);
}
console.log(failed === 0 ? '\nAll tests passed' : '\nFailed: ' + failed);
process.exit(failed === 0 ? 0 : 1);
