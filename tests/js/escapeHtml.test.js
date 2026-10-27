/**
 * Tests for escapeHtml function
 * 
 * Tests XSS protection and HTML entity encoding.
 */

// Extract escapeHtml function logic for testing
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

describe('escapeHtml', () => {
  test('should return input if no special characters', () => {
    expect(escapeHtml('hello world')).toBe('hello world');
    expect(escapeHtml('12345')).toBe('12345');
    expect(escapeHtml('')).toBe('');
  });

  test('should escape ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  test('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  test('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  test('should escape double quotes', () => {
    expect(escapeHtml('say "hello"')).toBe('say &quot;hello&quot;');
  });

  test('should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });

  test('should prevent XSS injection', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escapeHtml('<img onerror=alert(1)>')).toBe('&lt;img onerror=alert(1)&gt;');
    expect(escapeHtml('<iframe src="evil.com"></iframe>')).toBe('&lt;iframe src=&quot;evil.com&quot;&gt;&lt;/iframe&gt;');
  });

  test('should handle mixed special characters', () => {
    const input = '<div class="test">a & b</div>';
    const expected = '&lt;div class=&quot;test&quot;&gt;a &amp; b&lt;/div&gt;';
    expect(escapeHtml(input)).toBe(expected);
  });

  test('should handle unicode characters', () => {
    expect(escapeHtml('Привет мир')).toBe('Привет мир');
    expect(escapeHtml('こんにちは')).toBe('こんにちは');
  });

  test('should handle null and undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});
