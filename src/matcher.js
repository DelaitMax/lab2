// Матчер. Идея: ends(node, s, i) возвращает ВСЕ позиции, на которых может
// закончиться совпадение узла node, начавшееся в позиции i.
// Так не нужен бэктрекинг: перебираются сразу все варианты.

function unique(arr) {
	return [...new Set(arr)];
}

// Позиции после 0 или более повторов node, начиная с любой позиции из starts
function repeatClosure(node, s, starts) {
	const result = unique(starts);
	let frontier = result.slice();
	while (frontier.length > 0) {
		const next = [];
		for (const p of frontier) {
			for (const q of ends(node, s, p)) {
				// q > p защищает от бесконечного цикла на пустых повторах
				if (q > p && !result.includes(q)) {
					result.push(q);
					next.push(q);
				}
			}
		}
		frontier = next;
	}
	return result;
}

function ends(node, s, i) {
	switch (node.type) {
		case 'char':
			return s[i] === node.value ? [i + 1] : [];

		case 'any':
			return i < s.length ? [i + 1] : [];

		case 'set': {
			if (i >= s.length) return [];
			const c = s[i];
			const inSet = node.ranges.some(([from, to]) => c >= from && c <= to);
			return inSet !== node.negate ? [i + 1] : [];
		}

		case 'alt':
			return unique(node.items.flatMap((n) => ends(n, s, i)));

		case 'concat': {
			let cur = [i];
			for (const n of node.items) {
				cur = unique(cur.flatMap((p) => ends(n, s, p)));
				if (cur.length === 0) break;
			}
			return cur;
		}

		case 'opt':
			return unique([i, ...ends(node.node, s, i)]);

		case 'star':
			return repeatClosure(node.node, s, [i]);

		case 'plus':
			return repeatClosure(node.node, s, ends(node.node, s, i));
	}
	return [];
}

// Все непересекающиеся непустые совпадения: самое левое и самое длинное.
// Возвращает [{ start, end }, ...]
function findMatches(ast, s) {
	const matches = [];
	let i = 0;
	while (i < s.length) {
		const e = ends(ast, s, i);
		const end = e.length > 0 ? Math.max(...e) : i;
		if (end > i) {
			matches.push({ start: i, end });
			i = end;
		} else {
			i++;
		}
	}
	return matches;
}

if (typeof module !== 'undefined') module.exports = { findMatches };
