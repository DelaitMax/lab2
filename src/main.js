const exprInput = document.getElementById('expr');
const textInput = document.getElementById('text');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

function showStatus(kind, message) {
	statusEl.className = 'status ' + kind;
	statusEl.textContent = message;
}

function render(s, ranges, markClass) {
	resultEl.textContent = '';
	let last = 0;
	for (const r of ranges) {
		if (r.start > last) resultEl.append(s.slice(last, r.start));
		const mark = document.createElement('mark');
		mark.className = markClass;
		mark.textContent = s.slice(r.start, r.end);
		resultEl.append(mark);
		last = r.end;
	}
	if (last < s.length) resultEl.append(s.slice(last));
}

function check() {
	const expr = exprInput.value;
	const text = textInput.value;
	resultEl.textContent = '';

	if (expr.length === 0) {
		showStatus('warn', 'Введите выражение.');
		return;
	}
	if (text.length === 0) {
		showStatus('warn', 'Введите строку для поиска.');
		return;
	}

	let ast;
	try {
		ast = parse(expr);
	} catch (e) {
		if (e.pos === undefined) throw e;
		showStatus(
			'error',
			'Это не регулярное выражение: ' + e.message + ' (позиция ' + (e.pos + 1) + ').',
		);
		if (e.pos < expr.length) render(expr, [{ start: e.pos, end: e.pos + 1 }], 'bad');
		return;
	}

	const matches = findMatches(ast, text);
	if (matches.length === 0) {
		showStatus('none', 'Регулярное выражение в строке не найдено.');
		render(text, [], 'hit');
		return;
	}
	showStatus('ok', 'Выражение регулярное. Найдено совпадений: ' + matches.length + '.');
	render(text, matches, 'hit');
}

document.getElementById('check').addEventListener('click', check);
