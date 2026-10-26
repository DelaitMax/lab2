const QUANTS = { '*': 'star', '+': 'plus', '?': 'opt' };

function parse(src) {
	let pos = 0;

	function fail(message, at = pos) {
		throw { message, pos: at };
	}

	function parseAlt() {
		const items = [parseConcat()];
		while (src[pos] === '|') {
			pos++;
			items.push(parseConcat());
		}
		return items.length === 1 ? items[0] : { type: 'alt', items };
	}

	function parseConcat() {
		const start = pos;
		const items = [];
		while (pos < src.length && src[pos] !== '|' && src[pos] !== ')') {
			items.push(parseRepeat());
		}
		if (items.length === 0) fail('Пустая альтернатива или пустая группа', start);
		return items.length === 1 ? items[0] : { type: 'concat', items };
	}

	function parseRepeat() {
		const node = parseAtom();
		const q = src[pos];
		if (!QUANTS[q]) return node;
		pos++;
		if (QUANTS[src[pos]]) fail('Двойной квантификатор');
		return { type: QUANTS[q], node };
	}

	function parseAtom() {
		const c = src[pos];
		if (QUANTS[c]) fail('Квантификатор «' + c + '» без операнда');
		if (c === ']') fail('Лишняя закрывающая скобка «]»');
		if (c === '[') return parseSet();
		if (c === '(') {
			const open = pos;
			pos++;
			const node = parseAlt();
			if (src[pos] !== ')') fail('Не закрыта скобка «(»', open);
			pos++;
			return node;
		}
		if (c === '.') {
			pos++;
			return { type: 'any' };
		}
		if (c === '\\') return { type: 'char', value: readEscaped() };
		pos++;
		return { type: 'char', value: c };
	}

	function readEscaped() {
		if (pos + 1 >= src.length) fail('Символ «\\» в конце выражения');
		pos += 2;
		return src[pos - 1];
	}

	function readSetChar() {
		return src[pos] === '\\' ? readEscaped() : src[pos++];
	}

	function parseSet() {
		const open = pos;
		pos++;
		let negate = false;
		if (src[pos] === '^') {
			negate = true;
			pos++;
		}
		const ranges = [];
		while (pos < src.length && src[pos] !== ']') {
			const from = readSetChar();
			if (src[pos] === '-' && pos + 1 < src.length && src[pos + 1] !== ']') {
				const dashPos = pos;
				pos++;
				const to = readSetChar();
				if (to < from) fail('Неверный диапазон «' + from + '-' + to + '»', dashPos);
				ranges.push([from, to]);
			} else {
				ranges.push([from, from]);
			}
		}
		if (pos >= src.length) fail('Не закрыт класс символов «[»', open);
		if (ranges.length === 0) fail('Пустой класс символов', open);
		pos++;
		return { type: 'set', ranges, negate };
	}

	const ast = parseAlt();
	if (pos < src.length) fail('Лишняя закрывающая скобка «)»');
	return ast;
}

if (typeof module !== 'undefined') module.exports = { parse };
