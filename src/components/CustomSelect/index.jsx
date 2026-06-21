"use client";
// Drop-in replacement for native <select>.
// Preserves the exact <select> API (value, onChange with e.target.value /
// e.target.selectedOptions, required, multiple, disabled, size, className, id)
// so existing logic never breaks, while adding:
//   - custom hover / active / selected states
//   - open-close animations (framer-motion)
//   - keyboard navigation
//   - <optgroup> rendering (group headers) with sorting support
//   - search box when there are more than 10 options (respects optgroup)
//   - backdrop overlay while open (prevents "overlap" with neighbouring fields)
import React, {
  useState,
  useRef,
  useEffect,
  useId,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Search, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Accent color map (literal class strings so Tailwind keeps them).
// Auto-detected from the focus:border-{color}-{shade} token already on each
// select, so each form keeps its semantic colour.
// ---------------------------------------------------------------------------
const ACCENTS = {
  "blue-500": {
    hover: "hover:bg-blue-50",
    selBg: "bg-blue-50",
    selText: "text-blue-700",
    check: "text-blue-600",
    dot: "bg-blue-500",
    groupText: "text-blue-600",
  },
  "blue-400": {
    hover: "hover:bg-blue-50",
    selBg: "bg-blue-50",
    selText: "text-blue-700",
    check: "text-blue-500",
    dot: "bg-blue-400",
    groupText: "text-blue-500",
  },
  "purple-500": {
    hover: "hover:bg-purple-50",
    selBg: "bg-purple-50",
    selText: "text-purple-700",
    check: "text-purple-600",
    dot: "bg-purple-500",
    groupText: "text-purple-600",
  },
  "green-500": {
    hover: "hover:bg-green-50",
    selBg: "bg-green-50",
    selText: "text-green-700",
    check: "text-green-600",
    dot: "bg-green-500",
    groupText: "text-green-600",
  },
  "red-500": {
    hover: "hover:bg-red-50",
    selBg: "bg-red-50",
    selText: "text-red-700",
    check: "text-red-600",
    dot: "bg-red-500",
    groupText: "text-red-600",
  },
  "amber-400": {
    hover: "hover:bg-amber-50",
    selBg: "bg-amber-50",
    selText: "text-amber-700",
    check: "text-amber-600",
    dot: "bg-amber-400",
    groupText: "text-amber-600",
  },
  "indigo-500": {
    hover: "hover:bg-indigo-50",
    selBg: "bg-indigo-50",
    selText: "text-indigo-700",
    check: "text-indigo-600",
    dot: "bg-indigo-500",
    groupText: "text-indigo-600",
  },
};
const DEFAULT_ACCENT = ACCENTS["blue-500"];

function getAccent(className = "") {
  const m = className.match(/focus:border-([a-z]+)-(\d+)/);
  if (m) {
    const key = `${m[1]}-${m[2]}`;
    if (ACCENTS[key]) return ACCENTS[key];
  }
  if (/focus:ring-amber-200/.test(className)) return ACCENTS["amber-400"];
  return DEFAULT_ACCENT;
}

// ---------------------------------------------------------------------------
// Parse <option> / <optgroup> children into a normalised structure.
//   groups: [
//     { type: "group", label, options: [{value,label,disabled}] },
//     { type: "group", label, options: [...] },
//     ...
//   ]
//   Loose options (not inside an optgroup) are collected into a synthetic
//   group with an empty label so they render without a header.
//   A leading empty-value placeholder option is kept in its own (header-less)
//   group so it always shows at the very top.
// ---------------------------------------------------------------------------
function parseGroups(children) {
  const groups = [];
  let loose = [];

  const pushOption = (node) => {
    if (!React.isValidElement(node) || node.type !== "option") return;
    const raw = node.props.value;
    let label = node.props.children;
    if (Array.isArray(label)) label = label.join("");
    loose.push({
      value: raw === undefined ? "" : String(raw),
      label: label === undefined || label === null ? "" : String(label),
      disabled: !!node.props.disabled,
    });
  };

  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "option") {
      pushOption(child);
    } else if (child.type === "optgroup") {
      // flush any pending loose options as a header-less group first
      if (loose.length) {
        groups.push({ type: "group", label: "", options: loose });
        loose = [];
      }
      const opts = [];
      React.Children.toArray(child.props.children).forEach((opt) => {
        if (!React.isValidElement(opt) || opt.type !== "option") return;
        const raw = opt.props.value;
        let label = opt.props.children;
        if (Array.isArray(label)) label = label.join("");
        opts.push({
          value: raw === undefined ? "" : String(raw),
          label: label === undefined || label === null ? "" : String(label),
          disabled: !!opt.props.disabled,
        });
      });
      groups.push({
        type: "group",
        label: String(child.props.label ?? ""),
        options: opts,
      });
    }
  });
  if (loose.length) {
    groups.push({ type: "group", label: "", options: loose });
  }
  return groups;
}

// Flat list (for search / keyboard nav) preserving group label.
function flatten(groups) {
  const out = [];
  groups.forEach((g) => {
    g.options.forEach((o) => out.push({ ...o, groupLabel: g.label }));
  });
  return out;
}

function toPersianDigits(input) {
  if (input == null) return "";
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

const SEARCH_THRESHOLD = 10;

export default function CustomSelect({
  value,
  defaultValue,
  onChange,
  children,
  className = "",
  required,
  multiple,
  disabled,
  size,
  id,
  name,
  ...rest
}) {
  const groups = useMemo(() => parseGroups(children), [children]);
  const flatOptions = useMemo(() => flatten(groups), [groups]);
  const accent = useMemo(() => getAccent(className), [className]);
  const showSearch = flatOptions.length > SEARCH_THRESHOLD;

  const reactId = useId();
  const panelId = `cs-panel-${reactId}`;
  const searchId = `cs-search-${reactId}`;

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const hiddenRef = useRef(null);
  const searchRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    width: 0,
    openUp: false,
  });
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (multiple) return [];
    return flatOptions[0]?.value ?? "";
  });
  const currentValue = isControlled ? value : internalValue;

  // Sync the hidden native <select> used for required validation.
  useEffect(() => {
    if (!hiddenRef.current) return;
    hiddenRef.current.value = Array.isArray(currentValue)
      ? currentValue[0] ?? ""
      : currentValue ?? "";
  }, [currentValue]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // focus search box when it appears
  useEffect(() => {
    if (open && showSearch) {
      // wait a tick for the input to mount
      const t = setTimeout(() => searchRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open, showSearch]);

  // ---- positioning ----
  const computePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estHeight = Math.min(flatOptions.length * 40 + 12, 256) + (showSearch ? 48 : 0);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < estHeight + 16 && spaceAbove > spaceBelow;
    const top = openUp ? rect.top - 8 : rect.bottom + 4;
    let left = rect.left;
    const width = rect.width;
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    if (left < 8) left = 8;
    setCoords({ top, left, width, openUp });
  }, [flatOptions.length, showSearch]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setQuery("");
    computePosition();
    const selectedIdx = flatOptions.findIndex((o) =>
      Array.isArray(currentValue)
        ? currentValue.includes(o.value)
        : o.value === String(currentValue ?? "")
    );
    setHighlight(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  }, [disabled, computePosition, flatOptions, currentValue]);

  // recompute on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const handler = () => computePosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, computePosition]);

  // close on outside click (backdrop handles the rest)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      const panel = document.getElementById(panelId);
      if (panel && panel.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, panelId]);

  // keep highlighted option scrolled into view
  useEffect(() => {
    if (!open || highlight < 0) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;
    const item = panel.querySelector(`[data-idx="${highlight}"]`);
    if (item) item.scrollIntoView({ block: "nearest" });
  }, [highlight, open, panelId]);

  // ---- emit a native-like change event so existing handlers keep working ----
  const emit = useCallback(
    (next) => {
      if (!isControlled) setInternalValue(next);
      if (!onChange) return;
      const arr = Array.isArray(next) ? next : [];
      const targetValue = Array.isArray(next) ? arr[0] ?? "" : next;
      const fake = {
        target: {
          value: targetValue,
          selectedOptions: arr.map((v) => ({ value: v })),
        },
        currentTarget: {
          value: targetValue,
          selectedOptions: arr.map((v) => ({ value: v })),
        },
        preventDefault() {},
        stopPropagation() {},
      };
      onChange(fake);
    },
    [isControlled, onChange]
  );

  const selectSingle = (val) => {
    emit(val);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const toggleMulti = (val) => {
    const arr = Array.isArray(currentValue) ? currentValue : [];
    const next = arr.includes(val)
      ? arr.filter((v) => v !== val)
      : [...arr, val];
    emit(next);
  };

  // ---- filtered (for search) ----
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    const out = [];
    groups.forEach((g) => {
      const matched = g.options.filter((o) =>
        o.label.toLowerCase().includes(q)
      );
      if (matched.length) {
        out.push({ type: "group", label: g.label, options: matched });
      }
    });
    return out;
  }, [groups, query]);

  const filteredFlat = useMemo(() => flatten(filteredGroups), [filteredGroups]);

  // ---- keyboard interaction ----
  const onKeyDown = (e) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, filteredFlat.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        {
          const o = filteredFlat[highlight];
          if (o && !o.disabled) {
            if (multiple) toggleMulti(o.value);
            else selectSingle(o.value);
          }
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      case " ":
        if (multiple) {
          e.preventDefault();
          const o = filteredFlat[highlight];
          if (o && !o.disabled) toggleMulti(o.value);
        }
        break;
      default:
        break;
    }
  };

  // ---- derived display values ----
  const placeholder = useMemo(
    () => flatOptions.find((o) => o.value === "")?.label || "انتخاب کنید",
    [flatOptions]
  );

  const isEmpty = Array.isArray(currentValue)
    ? currentValue.length === 0
    : String(currentValue ?? "") === "";

  const displayLabel = useMemo(() => {
    if (multiple) {
      const arr = Array.isArray(currentValue) ? currentValue : [];
      if (arr.length === 0) return placeholder;
      return `${toPersianDigits(arr.length)} مورد انتخاب شده`;
    }
    const found = flatOptions.find(
      (o) => o.value === String(currentValue ?? "")
    );
    return found ? found.label : placeholder;
  }, [currentValue, flatOptions, multiple, placeholder]);

  const hasWFull = className.includes("w-full");
  const needsMinWidth =
    !hasWFull &&
    !className.includes("min-w") &&
    !className.includes("max-w");
  const maxLabelLen = flatOptions.reduce(
    (m, o) => Math.max(m, o.label?.length || 0),
    0
  );
  const computedMinWidth = Math.min(Math.max(maxLabelLen * 9 + 52, 96), 340);

  // =======================================================================
  // MULTI + size  ->  inline listbox
  // =======================================================================
  if (multiple && size) {
    const selectedArr = Array.isArray(currentValue) ? currentValue : [];
    const listHeight = Math.max(size, 1) * 40 + 12;
    return (
      <div ref={wrapperRef} className="relative w-full">
        {required && (
          <select
            ref={hiddenRef}
            required
            tabIndex={-1}
            aria-hidden="true"
            name={name}
            defaultValue=""
            className="sr-only"
            onChange={() => {}}
          >
            <option value="" disabled>
              -
            </option>
            {flatOptions.map((o) => (
              <option key={o.value} value={o.value}>
                x
              </option>
            ))}
          </select>
        )}
        {showSearch && (
          <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5">
            <Search className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو..."
              className="cs-scroll min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600"
                aria-label="پاک کردن جستجو"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-required={required || undefined}
          id={id}
          className="cs-scroll w-full overflow-y-auto rounded-xl border-2 border-gray-200 bg-white p-1.5 transition-colors"
          style={{ maxHeight: `${listHeight}px` }}
        >
          {filteredGroups.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-gray-400">
              موردی یافت نشد
            </li>
          )}
          {filteredGroups.map((g, gi) => (
            <li key={`g-${gi}`}>
              {g.label && (
                <div
                  className={`px-3 pb-1 pt-2.5 text-xs font-extrabold tracking-wide ${accent.groupText}`}
                >
                  {g.label}
                </div>
              )}
              <ul>
                {g.options.map((o) => {
                  const isSel = selectedArr.includes(o.value);
                  return (
                    <li
                      key={o.value}
                      role="option"
                      aria-selected={isSel}
                    >
                      <button
                        type="button"
                        disabled={o.disabled}
                        onClick={() => !o.disabled && toggleMulti(o.value)}
                        className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors duration-150 ${
                          o.disabled
                            ? "cursor-not-allowed opacity-40"
                            : `cursor-pointer ${accent.hover}`
                        } ${
                          isSel
                            ? `${accent.selBg} ${accent.selText} font-bold`
                            : "text-gray-700"
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                            isSel
                              ? `${accent.dot} border-transparent`
                              : "border-gray-300 bg-white group-hover:border-gray-400"
                          }`}
                        >
                          {isSel && (
                            <Check
                              className="h-3.5 w-3.5 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        <span className="flex-1 truncate">{o.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // =======================================================================
  // SINGLE  /  MULTI (dropdown)  ->  trigger button + portaled animated panel
  // =======================================================================
  return (
    <div
      ref={wrapperRef}
      className={`relative ${hasWFull ? "w-full" : "inline-block"}`}
    >
      {required && (
        <select
          ref={hiddenRef}
          required
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          defaultValue={Array.isArray(currentValue) ? "" : currentValue ?? ""}
          className="sr-only"
          onChange={() => {}}
        >
          {children}
        </select>
      )}

      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-required={required || undefined}
        className={`${className} flex cursor-pointer items-center justify-between gap-2 text-start ${
          disabled ? "cursor-not-allowed opacity-50" : ""
        }`}
        style={{
          fontFamily: "inherit",
          ...(needsMinWidth ? { minWidth: computedMinWidth } : {}),
        }}
        {...rest}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            isEmpty ? "text-gray-400" : "text-gray-800"
          }`}
        >
          {displayLabel}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-shrink-0 items-center"
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-150 ${
              open ? accent.check : "text-gray-400"
            }`}
          />
        </motion.span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                {/* backdrop: captures outside clicks so the open dropdown can
                    never "overlap" with neighbouring fields. Transparent so the
                    page is still visible, but clicks land here, not on the
                    fields below. */}
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                  onMouseDown={() => setOpen(false)}
                  aria-hidden="true"
                />
                <motion.div
                  id={panelId}
                  role="listbox"
                  aria-multiselectable={multiple || undefined}
                  initial={{
                    opacity: 0,
                    y: coords.openUp ? 10 : -10,
                    scale: 0.97,
                  }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{
                    opacity: 0,
                    y: coords.openUp ? 10 : -10,
                    scale: 0.97,
                  }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  style={{
                    position: "fixed",
                    top: `${coords.top}px`,
                    left: `${coords.left}px`,
                    width: `${coords.width}px`,
                    zIndex: 9999,
                  }}
                  className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xl shadow-black/10 ring-1 ring-black/5"
                >
                  {showSearch && (
                    <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                      <Search className="h-4 w-4 flex-shrink-0 text-gray-400" />
                      <input
                        ref={searchRef}
                        id={searchId}
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setHighlight(0);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setHighlight((h) =>
                              Math.min(h + 1, filteredFlat.length - 1)
                            );
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setHighlight((h) => Math.max(h - 1, 0));
                          } else if (e.key === "Enter") {
                            e.preventDefault();
                            const o = filteredFlat[highlight];
                            if (o && !o.disabled) {
                              if (multiple) toggleMulti(o.value);
                              else selectSingle(o.value);
                            }
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setOpen(false);
                            triggerRef.current?.focus();
                          }
                        }}
                        placeholder="جستجو..."
                        className="cs-scroll min-w-0 flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                      />
                      {query && (
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            searchRef.current?.focus();
                          }}
                          className="flex-shrink-0 rounded-md p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="پاک کردن جستجو"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  <ul className="cs-scroll max-h-60 overflow-y-auto p-1.5">
                    {filteredFlat.length === 0 && (
                      <li className="px-3 py-2.5 text-sm text-gray-400">
                        موردی یافت نشد
                      </li>
                    )}
                    {filteredGroups.map((g, gi) => {
                      // compute the starting flat index for this group so that
                      // data-idx stays consistent with filteredFlat (keyboard)
                      let runningIdx = 0;
                      for (let k = 0; k < gi; k++) {
                        runningIdx += filteredGroups[k].options.length;
                      }
                      return (
                        <li key={`g-${gi}`}>
                          {g.label && (
                            <div
                              className={`flex items-center gap-2 px-3 pb-1 pt-2.5 text-xs font-extrabold tracking-wide ${accent.groupText}`}
                            >
                              <span
                                className={`h-1 w-1 flex-shrink-0 rounded-full ${accent.dot}`}
                              />
                              {g.label}
                            </div>
                          )}
                          <ul>
                            {g.options.map((o, oi) => {
                              const idx = runningIdx + oi;
                              const isSel = Array.isArray(currentValue)
                                ? currentValue.includes(o.value)
                                : o.value === String(currentValue ?? "");
                              const isHover = highlight === idx;
                              return (
                                <li
                                  key={o.value}
                                  data-idx={idx}
                                  role="option"
                                  aria-selected={isSel}
                                >
                                  <button
                                    type="button"
                                    disabled={o.disabled}
                                    onClick={() => {
                                      if (o.disabled) return;
                                      if (multiple) toggleMulti(o.value);
                                      else selectSingle(o.value);
                                    }}
                                    onMouseEnter={() => setHighlight(idx)}
                                    className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors duration-150 ${
                                      o.disabled
                                        ? "cursor-not-allowed opacity-40"
                                        : `cursor-pointer ${accent.hover}`
                                    } ${
                                      isSel
                                        ? `${accent.selBg} ${accent.selText} font-bold`
                                        : isHover
                                          ? "bg-gray-100 text-gray-800"
                                          : "text-gray-700"
                                    }`}
                                  >
                                    {multiple ? (
                                      <span
                                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                                          isSel
                                            ? `${accent.dot} border-transparent`
                                            : "border-gray-300 bg-white group-hover:border-gray-400"
                                        }`}
                                      >
                                        {isSel && (
                                          <Check
                                            className="h-3.5 w-3.5 text-white"
                                            strokeWidth={3}
                                          />
                                        )}
                                      </span>
                                    ) : (
                                      <span
                                        className={`flex h-4 w-4 flex-shrink-0 items-center justify-center transition-opacity duration-150 ${
                                          isSel ? "opacity-100" : "opacity-0"
                                        }`}
                                      >
                                        <Check
                                          className={`h-4 w-4 ${accent.check}`}
                                          strokeWidth={3}
                                        />
                                      </span>
                                    )}
                                    <span className="flex-1 truncate text-start">
                                      {o.label}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
