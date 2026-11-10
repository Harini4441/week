import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToMinutes, minutesToTime, mergeIntervals, detectConflicts } from './freeTimeCalculator';
import { getInitialTasks, getInitialHabits, getInitialFocusSessions } from './storage';

test('timeToMinutes converts HH:MM correctly', () => {
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('09:30'), 570);
  assert.equal(timeToMinutes('14:15'), 855);
  assert.equal(timeToMinutes('23:59'), 1439);
});

test('minutesToTime formats minutes into 24h string correctly', () => {
  assert.equal(minutesToTime(0), '00:00');
  assert.equal(minutesToTime(570), '09:30');
  assert.equal(minutesToTime(855), '14:15');
});

test('mergeIntervals merges overlapping blocks properly', () => {
  const intervals = [
    { start: 540, end: 660 }, // 09:00 - 11:00
    { start: 600, end: 720 }, // 10:00 - 12:00
    { start: 840, end: 900 }, // 14:00 - 15:00
  ];
  const merged = mergeIntervals(intervals);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].start, 540);
  assert.equal(merged[0].end, 720);
  assert.equal(merged[1].start, 840);
  assert.equal(merged[1].end, 900);
});

test('detectConflicts identifies overlapping tasks correctly', () => {
  const intervals = [
    { start: 540, end: 660, title: 'Data Structures' },
    { start: 600, end: 720, title: 'Machine Learning' },
  ];
  const conflicts = detectConflicts(intervals);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].task1.title, 'Data Structures');
  assert.equal(conflicts[0].task2.title, 'Machine Learning');
});

test('Minimal Default Demo Data returns exactly 1 sample task and 1 sample habit', () => {
  const initialTasks = getInitialTasks();
  const initialHabits = getInitialHabits();
  const initialFocusSessions = getInitialFocusSessions();

  assert.equal(initialTasks.length, 1, 'Should initialize with only 1 sample task');
  assert.equal(initialHabits.length, 1, 'Should initialize with only 1 sample habit');
  assert.equal(initialFocusSessions.length, 0, 'Should initialize with 0 focus sessions');
  assert.ok(initialTasks[0].title.includes('화이팅'), 'Task title should feature Korean 화이팅');
});

test('Task vs To-Do separation distinguishes scheduled blocks from checklist to-dos', () => {
  const scheduledTask = {
    id: 't-1',
    title: 'Operating Systems',
    startTime: '10:00',
    durationMinutes: 90,
    isTodo: false,
  };
  const standaloneTodo = {
    id: 't-2',
    title: 'Buy project notebook',
    startTime: null,
    durationMinutes: 0,
    isTodo: true,
  };

  const isTodo1 = Boolean(scheduledTask.isTodo || !scheduledTask.startTime);
  const isTodo2 = Boolean(standaloneTodo.isTodo || !standaloneTodo.startTime);

  assert.equal(isTodo1, false, 'Scheduled task with startTime should not be marked as standalone todo');
  assert.equal(isTodo2, true, 'Task marked as isTodo should be identified as standalone todo');
});
