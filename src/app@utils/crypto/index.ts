export function getNonce(size = 11) {
	return Array.from(Array(size), () => Math.floor(Math.random() * 36).toString(36)).join('');
}