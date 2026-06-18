"use client";
// Developed as a drop-in replacement for native <select>.
// Preserves the exact <select> API (value, onChange with e.target.value / e.target.selectedOptions,
// required, multiple, disabled, size, className, id) so existing logic never breaks,
// while adding custom hover / active / selected states and open-close animations.
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
import { ChevronDown, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Accent color map. We use literal class strings so Tailwind keeps them in the
// build (dynamic class names like `bg-${color}-50` would be purged). The accent
// is auto-detected from the `focus:border-{color}-{shade}` token that already
// exists on every select in the project, so each form keeps its semantic color.
// ---------------------------------------------------------------------------
const ACCENTS = {
  "blue-500": {
    hover: "hover:bg-blue-50",
    selBg: "bg-blue-50",
    selText: "text-blue-700",
    check: "text-blue-600",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
    softBorder: "border-blue-200",
  },
  "blue-400": {
    hover: "hover:bg-blue-50",
    selBg: "bg-blue-50",
    selText: "text-blue-700",
    check: "text-blue-500",
    dot: "bg-blue-400",
    ring: "ring-blue-200",
    softBorder: "border-blue-200",
  },
  "purple-500": {
    hover: "hover:bg-purple-50",
    selBg: "bg-purple-50",
    selText: "text-purple-700",
    check: "text-purple-600",
    dot: "bg-purple-500",
    ring: "ring-purple-200",
    softBorder: "border-purple-200",
  },
  "green-500": {
    hover: "hover:bg-green-50",
    selBg: "bg-green-50",
    selText: "text-green-700",
    check: "text-green-600",
    dot: "bg-green-500",
    ring: "ring-green-200",
    softBorder: "border-green-200",
  },
  "red-500": {
    hover: "hover:bg-red-50",
    selBg: "bg-red-50",
    selText: "text-red-700",
    check: "text-red-600",
    dot: "bg-red-500",
    ring: "ring-red-200",
    softBorder: "border-red-200",
  },
  "amber-400": {
    hover: "hover:bg-amber-50",
    selBg: "bg-amber-50",
    selText: "text-amber-700",
    check: "text-amber-600",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
    softBorder: "border-amber-200",
  },
};
const DEFAULT_ACCENT = ACCENTS["blue-500"];

function getAccent(className = "") {
  const m = className.match(/focus:border-([a-z]+)-(\d+)/);
  if (m) {
    const key = `${m[1]}-${m[2]}`;
    if (ACCENTS[key]) return ACCENTS[key];
  }
  // fall back to amber when only an amber ring is present
  if (/focus:ring-amber-200/.test(className)) return ACCENTS["amber-400"];
  return DEFAULT_ACCENT;
}

// Convert <option> children into a flat, normalized list.
function parseOptions(children) {
  const out = [];
  const push = (node) => {
    if (!React.isValidElement(node) || node.type !== "option") return;
    const raw = node.props.value;
    let label = node.props.children;
    if (Array.isArray(label)) label = label.join("");
    out.push({
      value: raw === undefined ? "" : String(raw),
      label: label === undefined || label === null ? "" : String(label),
      disabled: !!node.props.disabled,
    });
  };
  React.Children.toArray(children).forEach((child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === "option") {
      push(child);
    } else if (child.type === "optgroup") {
      React.Children.toArray(child.props.children).forEach(push);
    }
  });
  return out;
}

function toPersianDigits(input) {
  if (input == null) return "";
  return String(input).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
}

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
  const options = useMemo(() => parseOptions(children), [children]);
  const accent = useMemo(() => getAccent(className), [className]);
  const reactId = useId();
  const panelId = `cs-panel-${reactId}`;

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const hiddenRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const [mounted, setMounted] = useState(false);

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (multiple) return [];
    return options[0]?.value ?? "";
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

  // ---- positioning (viewport-relative because panel is portaled to <body>) ----
  const computePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estHeight = Math.min(options.length * 40 + 12, 256);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < estHeight + 16 && spaceAbove > spaceBelow;
    const top = openUp ? rect.top - 8 : rect.bottom + 4;
    let left = rect.left;
    const width = rect.width;
    // keep inside horizontal viewport
    if (left + width > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - width - 8);
    }
    if (left < 8) left = 8;
    setCoords({ top, left, width, openUp });
  }, [options.length]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    computePosition();
    const selectedIdx = options.findIndex((o) =>
      Array.isArray(currentValue)
        ? currentValue.includes(o.value)
        : o.value === String(currentValue ?? "")
    );
    setHighlight(selectedIdx >= 0 ? selectedIdx : 0);
    setOpen(true);
  }, [disabled, computePosition, options, currentValue]);

  // recompute on scroll / resize while open (capture so modal scroll containers are caught)
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

  // close on outside click
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
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        {
          const o = options[highlight];
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
          const o = options[highlight];
          if (o && !o.disabled) toggleMulti(o.value);
        }
        break;
      default:
        break;
    }
  };

  // ---- derived display values ----
  const placeholder = useMemo(
    () => options.find((o) => o.value === "")?.label || "انتخاب کنید",
    [options]
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
    const found = options.find(
      (o) => o.value === String(currentValue ?? "")
    );
    return found ? found.label : placeholder;
  }, [currentValue, options, multiple, placeholder]);

  const hasWFull = className.includes("w-full");
  const needsMinWidth =
    !hasWFull &&
    !className.includes("min-w") &&
    !className.includes("max-w");
  const maxLabelLen = options.reduce(
    (m, o) => Math.max(m, o.label?.length || 0),
    0
  );
  const computedMinWidth = Math.min(Math.max(maxLabelLen * 9 + 52, 96), 340);

  // =======================================================================
  // MULTI + size  ->  inline listbox (preserves the native listbox footprint)
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
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                x
              </option>
            ))}
          </select>
        )}
        <ul
          role="listbox"
          aria-multiselectable="true"
          aria-required={required || undefined}
          id={id}
          className="cs-scroll w-full overflow-y-auto rounded-xl border-2 border-gray-200 bg-white p-1.5 transition-colors"
          style={{ maxHeight: `${listHeight}px` }}
        >
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-sm text-gray-400">
              موردی وجود ندارد
            </li>
          )}
          {options.map((o, idx) => {
            const isSel = selectedArr.includes(o.value);
            return (
              <li key={`${o.value}-${idx}`} role="option" aria-selected={isSel}>
                <button
                  type="button"
                  disabled={o.disabled}
                  onClick={() => !o.disabled && toggleMulti(o.value)}
                  className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors duration-150 ${
                    o.disabled
                      ? "cursor-not-allowed opacity-40"
                      : `cursor-pointer ${accent.hover}`
                  } ${isSel ? `${accent.selBg} ${accent.selText} font-bold` : "text-gray-700"}`}
                >
                  <span
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                      isSel
                        ? `${accent.dot} border-transparent`
                        : "border-gray-300 bg-white group-hover:border-gray-400"
                    }`}
                  >
                    {isSel && (
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    )}
                  </span>
                  <span className="flex-1 truncate">{o.label}</span>
                </button>
              </li>
            );
          })}
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
          className={`min-w-0 flex-1 truncate ${isEmpty ? "text-gray-400" : "text-gray-800"}`}
        >
          {displayLabel}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-shrink-0 items-center"
        >
          <ChevronDown
            className={`h-4 w-4 transition-colors duration-150 ${open ? accent.check : "text-gray-400"}`}
          />
        </motion.span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                id={panelId}
                role="listbox"
                aria-multiselectable={multiple || undefined}
                initial={{ opacity: 0, y: coords.openUp ? 10 : -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: coords.openUp ? 10 : -10, scale: 0.97 }}
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
                <ul className="cs-scroll max-h-60 overflow-y-auto p-1.5">
                  {options.length === 0 && (
                    <li className="px-3 py-2.5 text-sm text-gray-400">
                      موردی وجود ندارد
                    </li>
                  )}
                  {options.map((o, idx) => {
                    const isSel = Array.isArray(currentValue)
                      ? currentValue.includes(o.value)
                      : o.value === String(currentValue ?? "");
                    const isHover = highlight === idx;
                    return (
                      <li
                        key={`${o.value}-${idx}`}
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
                              className={`flex h-4 w-4 flex-shrink-0 items-center justify-center transition-opacity duration-150 ${isSel ? "opacity-100" : "opacity-0"}`}
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
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
