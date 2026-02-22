import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import { theme } from '../../../utils/theme';

// ─── Constants ─────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function parseDT(value) {
  if (!value) return { dateStr: '', timeStr: '' };
  const sep = value.indexOf('T');
  if (sep === -1) return { dateStr: value, timeStr: '' };
  return { dateStr: value.slice(0, sep), timeStr: value.slice(sep + 1, sep + 6) };
}

// 0-indexed month → 'YYYY-MM-DD'
function toDateStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function todayDateStr() {
  const t = new Date();
  return toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

function buildCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  // Trailing days from previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({ day: prevMonthDays - i, curr: false, str: toDateStr(py, pm, prevMonthDays - i) });
  }
  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, curr: true, str: toDateStr(year, month, d) });
  }
  // Leading days from next month
  while (cells.length < 42) {
    const nd = cells.length - firstDay - daysInMonth + 1;
    const nm = month === 11 ? 0 : month + 1;
    const ny = month === 11 ? year + 1 : year;
    cells.push({ day: nd, curr: false, str: toDateStr(ny, nm, nd) });
  }
  return cells;
}

// ─── Calendar Panel ────────────────────────────────────────────────────────────

function CalendarPanel({ dateStr, onSelect }) {
  const initView = () => {
    if (dateStr) {
      const [y, m] = dateStr.split('-').map(Number);
      return { year: y, month: m - 1 };
    }
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  };

  const [view, setView] = useState(initView);
  const [yearRaw, setYearRaw] = useState(() => String(initView().year));
  const [yearError, setYearError] = useState('');
  const [showMonths, setShowMonths] = useState(false);
  const today = todayDateStr();
  const cells = buildCalendarGrid(view.year, view.month);

  const navigate = (newView) => {
    setView(newView);
    setYearRaw(String(newView.year));
    setYearError('');
  };

  const prevMonth = () => navigate(
    view.month === 0 ? { year: view.year - 1, month: 11 } : { ...view, month: view.month - 1 }
  );
  const nextMonth = () => navigate(
    view.month === 11 ? { year: view.year + 1, month: 0 } : { ...view, month: view.month + 1 }
  );

  const handleYearChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setYearRaw(raw);
    if (!raw)           { setYearError('Required');      return; }
    if (raw.length < 4) { setYearError('4-digit year');  return; }
    const y = parseInt(raw, 10);
    if (y < 1000 || y > 2200) { setYearError('1000 – 2200'); return; }
    setYearError('');
    setView(v => ({ ...v, year: y }));
  };

  const selectMonth = (i) => {
    setView(v => ({ ...v, month: i }));
    setShowMonths(false);
  };

  const selectedMonth = dateStr ? parseInt(dateStr.split('-')[1], 10) - 1 : null;
  const selectedYear  = dateStr ? parseInt(dateStr.split('-')[0], 10)     : null;

  return (
    <div className="p-3 w-[272px]">

      {/* ── Header ── */}
      <div className="flex items-center gap-1.5 mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted transition-colors shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Month toggle button */}
        <button
          type="button"
          onClick={() => setShowMonths(v => !v)}
          className={[
            'flex-1 font-display font-semibold text-sm px-2 py-1 rounded-lg transition-colors',
            showMonths
              ? 'bg-brand-500 text-white'
              : 'text-ink-primary hover:bg-surface-hover',
          ].join(' ')}
        >
          {MONTHS[view.month].slice(0, 3)} ▾
        </button>

        {/* Year input */}
        <div className="flex flex-col items-center shrink-0">
          <input
            type="text"
            inputMode="numeric"
            value={yearRaw}
            onChange={handleYearChange}
            onClick={e => e.target.select()}
            maxLength={4}
            className={[
              'w-[3.8rem] text-sm font-semibold text-center rounded-lg px-1 py-1 border focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white transition-colors',
              yearError
                ? 'border-red-400 text-red-500 focus:border-red-400'
                : 'border-surface-border text-ink-primary focus:border-brand-500',
            ].join(' ')}
          />
          {yearError && (
            <span className="text-xxs text-red-500 mt-0.5 whitespace-nowrap leading-none">
              {yearError}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-ink-muted transition-colors shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {showMonths ? (
        /* ── Month picker grid ── */
        <div className="grid grid-cols-3 gap-1 py-1">
          {MONTHS.map((month, i) => {
            const isSelected = i === selectedMonth && view.year === selectedYear;
            const isCurrent  = i === view.month;
            return (
              <button
                key={month}
                type="button"
                onClick={() => selectMonth(i)}
                className={[
                  'py-2.5 rounded-lg text-xs font-medium transition-colors',
                  isSelected
                    ? 'bg-brand-500 text-white'
                    : isCurrent
                    ? 'bg-brand-50 text-brand-600 font-semibold'
                    : 'text-ink-primary hover:bg-surface-hover',
                ].join(' ')}
              >
                {month.slice(0, 3)}
              </button>
            );
          })}
        </div>
      ) : (
        /* ── Day grid ── */
        <>
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xxs font-semibold text-ink-disabled py-1">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((cell, i) => {
              const isSelected = cell.str === dateStr;
              const isToday    = cell.str === today;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelect(cell.str)}
                  className={[
                    'h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    isSelected
                      ? 'bg-brand-500 text-white'
                      : isToday
                      ? 'bg-brand-50 text-brand-600 font-semibold'
                      : cell.curr
                      ? 'text-ink-primary hover:bg-surface-hover'
                      : 'text-ink-disabled hover:bg-surface-hover',
                  ].join(' ')}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Time Panel ────────────────────────────────────────────────────────────────

function TimePanel({ timeStr, onSelect }) {
  const [selH, selM] = timeStr ? timeStr.split(':') : ['', ''];
  const hourRef = useRef(null);
  const minRef = useRef(null);

  useEffect(() => {
    if (hourRef.current && selH) {
      const el = hourRef.current.querySelector(`[data-h="${selH}"]`);
      if (el) hourRef.current.scrollTop = el.offsetTop - hourRef.current.offsetHeight / 2 + el.offsetHeight / 2;
    }
    if (minRef.current && selM) {
      const el = minRef.current.querySelector(`[data-m="${selM}"]`);
      if (el) minRef.current.scrollTop = el.offsetTop - minRef.current.offsetHeight / 2 + el.offsetHeight / 2;
    }
  }, []);

  return (
    <div className="flex w-44 overflow-hidden">
      {/* Hours column */}
      <div className="flex flex-col flex-1 border-r border-surface-border">
        <div className="text-xxs font-semibold text-ink-disabled text-center py-1.5 border-b border-surface-border bg-surface-page sticky top-0">
          Hour
        </div>
        <div ref={hourRef} className="overflow-y-auto" style={{ height: 192 }}>
          {HOURS.map(h => (
            <button
              key={h}
              data-h={h}
              type="button"
              onClick={() => onSelect(`${h}:${selM || '00'}`)}
              className={[
                'w-full py-1.5 text-xs text-center transition-colors',
                h === selH
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-ink-primary hover:bg-surface-hover',
              ].join(' ')}
            >
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Minutes column */}
      <div className="flex flex-col flex-1">
        <div className="text-xxs font-semibold text-ink-disabled text-center py-1.5 border-b border-surface-border bg-surface-page sticky top-0">
          Min
        </div>
        <div ref={minRef} className="overflow-y-auto" style={{ height: 192 }}>
          {MINUTES.map(m => (
            <button
              key={m}
              data-m={m}
              type="button"
              onClick={() => onSelect(`${selH || '00'}:${m}`)}
              className={[
                'w-full py-1.5 text-xs text-center transition-colors',
                m === selM
                  ? 'bg-brand-500 text-white font-semibold'
                  : 'text-ink-primary hover:bg-surface-hover',
              ].join(' ')}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DateTimePicker ────────────────────────────────────────────────────────────

export default function DateTimePicker({ label, name, value, onChange, error, required }) {
  const { dateStr, timeStr } = parseDT(value);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const wrapRef = useRef(null);

  // Close both pickers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDate(false);
        setShowTime(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const onDateSelect = (ds) => {
    onChange({ target: { name, value: `${ds}T${timeStr || '00:00'}` } });
    setShowDate(false);
  };

  const onTimeSelect = (ts) => {
    onChange({ target: { name, value: `${dateStr || todayDateStr()}T${ts}` } });
  };

  const boxCls = (open) => [
    'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all cursor-pointer bg-white w-full text-left',
    open
      ? 'border-brand-500 ring-2 ring-brand-100'
      : error
      ? 'border-red-400'
      : 'border-surface-border hover:border-brand-300',
  ].join(' ');

  return (
    <div ref={wrapRef}>
      {label && (
        <label className={`${theme.text.label} inline-block mb-2`}>
          {label}
          {required && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
      )}

      <div className="flex gap-2">
        {/* ── Date box ── */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => { setShowDate(v => !v); setShowTime(false); }}
            className={[boxCls(showDate), dateStr ? 'text-ink-primary' : 'text-ink-disabled'].join(' ')}
          >
            <Calendar className="w-4 h-4 shrink-0 text-ink-muted" />
            <span className="truncate">{dateStr ? formatDisplayDate(dateStr) : 'Select date'}</span>
          </button>

          {showDate && (
            <div className="absolute z-50 top-full mt-1.5 left-0 bg-white rounded-xl border border-surface-border shadow-dropdown">
              <CalendarPanel dateStr={dateStr} onSelect={onDateSelect} />
            </div>
          )}
        </div>

        {/* ── Time box ── */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { setShowTime(v => !v); setShowDate(false); }}
            className={[boxCls(showTime), timeStr ? 'text-ink-primary' : 'text-ink-disabled'].join(' ')}
          >
            <Clock className="w-4 h-4 shrink-0 text-ink-muted" />
            <span className="whitespace-nowrap">{timeStr ? formatDisplayTime(timeStr) : 'Time'}</span>
          </button>

          {showTime && (
            <div className="absolute z-50 top-full mt-1.5 right-0 bg-white rounded-xl border border-surface-border shadow-dropdown overflow-hidden">
              <TimePanel timeStr={timeStr} onSelect={onTimeSelect} />
            </div>
          )}
        </div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
