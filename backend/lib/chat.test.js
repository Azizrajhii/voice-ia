import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateChatBody, toGeminiContents, extractReplyText } from './chat.js';

test('validateChatBody accepts a minimal valid body', () => {
  const { error, value } = validateChatBody({ transcript: 'hello' });
  assert.equal(error, undefined);
  assert.deepEqual(value, { transcript: 'hello', language: 'derja', history: [] });
});

test('validateChatBody rejects an empty transcript', () => {
  const { error } = validateChatBody({ transcript: '   ' });
  assert.match(error, /transcript is required/);
});

test('validateChatBody rejects a transcript over 4000 chars', () => {
  const { error } = validateChatBody({ transcript: 'a'.repeat(4001) });
  assert.match(error, /transcript is required/);
});

test('validateChatBody rejects an unknown language', () => {
  const { error } = validateChatBody({ transcript: 'hi', language: 'klingon' });
  assert.match(error, /language must be/);
});

test('validateChatBody rejects history longer than 10 turns', () => {
  const history = Array.from({ length: 11 }, () => ({ role: 'user', content: 'hi' }));
  const { error } = validateChatBody({ transcript: 'hi', history });
  assert.match(error, /at most 10 turns/);
});

test('toGeminiContents maps assistant to model and appends the new turn', () => {
  const history = [
    { role: 'user', content: 'salut' },
    { role: 'assistant', content: 'ahla' },
  ];
  const contents = toGeminiContents(history, 'chnowa ahwelek');

  assert.deepEqual(contents, [
    { role: 'user', parts: [{ text: 'salut' }] },
    { role: 'model', parts: [{ text: 'ahla' }] },
    { role: 'user', parts: [{ text: 'chnowa ahwelek' }] },
  ]);
});

test('toGeminiContents drops malformed history turns', () => {
  const history = [{ role: 'system', content: 'nope' }, null, { role: 'user' }];
  const contents = toGeminiContents(history, 'hi');
  assert.deepEqual(contents, [{ role: 'user', parts: [{ text: 'hi' }] }]);
});

test('extractReplyText joins and trims text parts', () => {
  const payload = {
    candidates: [{ content: { parts: [{ text: 'Hello ' }, { text: 'world!  ' }] } }],
  };
  assert.equal(extractReplyText(payload), 'Hello world!');
});

test('extractReplyText returns empty string for a missing payload shape', () => {
  assert.equal(extractReplyText({}), '');
  assert.equal(extractReplyText({ candidates: [] }), '');
});
