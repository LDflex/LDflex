export function deindent(string) {
  return string.trim().replace(/^ {6}?/mg, '');
}
