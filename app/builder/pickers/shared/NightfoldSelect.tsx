"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

export type NightfoldSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type MenuPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
};

const MENU_CLASS_NAME =
  "fixed z-70 overflow-x-hidden overflow-y-auto border border-gold/70 bg-surface bg-picker-popover py-1 shadow-popover animate-popover-in motion-reduce:animate-none";
const OPTION_CLASS_NAME =
  "flex min-h-9 w-full cursor-pointer items-center px-2.5 py-1.5 font-sans text-xs font-semibold text-ink-soft outline-none transition-colors duration-100 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 aria-selected:bg-picker-row-selected aria-selected:text-gold-bright data-[active=true]:bg-control-hover data-[active=true]:text-ink max-tablet:min-h-11 max-tablet:text-base motion-reduce:transition-none";

function firstEnabledIndex(options: readonly NightfoldSelectOption[]) {
  return options.findIndex((option) => !option.disabled);
}

export function NightfoldSelect({
  value,
  options,
  ariaLabel,
  className,
  onChange,
}: {
  value: string;
  options: readonly NightfoldSelectOption[];
  ariaLabel: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition>();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex] ?? options[firstEnabledIndex(options)];

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    setPosition(undefined);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const openMenu = (initialIndex = selectedIndex) => {
    const fallback = firstEnabledIndex(options);
    const nextIndex =
      initialIndex >= 0 && !options[initialIndex]?.disabled
        ? initialIndex
        : fallback;
    setActiveIndex(nextIndex);
    setOpen(true);
  };

  const moveActive = (direction: 1 | -1) => {
    if (!options.length) return;
    let nextIndex = activeIndex;
    for (let count = 0; count < options.length; count += 1) {
      nextIndex = (nextIndex + direction + options.length) % options.length;
      if (!options[nextIndex]?.disabled) {
        setActiveIndex(nextIndex);
        return;
      }
    }
  };

  const selectIndex = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close(true);
  };

  useEffect(() => {
    if (!open) return;
    const focusFrame = window.requestAnimationFrame(() => menuRef.current?.focus());
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      close(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("pointerdown", closeOnOutsidePointer, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const margin = 8;
      const gap = 4;
      const triggerRect = trigger.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight;
      const width = Math.min(triggerRect.width, viewportWidth - margin * 2);
      const left = Math.min(
        Math.max(triggerRect.left, margin),
        Math.max(margin, viewportWidth - width - margin),
      );
      const spaceBelow = viewportHeight - triggerRect.bottom - gap - margin;
      const spaceAbove = triggerRect.top - gap - margin;
      const desiredHeight = menu.scrollHeight;
      const placeBelow = spaceBelow >= Math.min(desiredHeight, 144) || spaceBelow >= spaceAbove;
      const maxHeight = Math.max(72, placeBelow ? spaceBelow : spaceAbove);
      const renderedHeight = Math.min(desiredHeight, maxHeight);
      const top = placeBelow
        ? triggerRect.bottom + gap
        : triggerRect.top - gap - renderedHeight;

      setPosition({ left, top: Math.max(margin, top), width, maxHeight });
    };

    updatePosition();
    const resizeObserver = new ResizeObserver(updatePosition);
    if (triggerRef.current) resizeObserver.observe(triggerRef.current);
    if (menuRef.current) resizeObserver.observe(menuRef.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const initialIndex = selectedIndex >= 0 ? selectedIndex + direction : -1;
      openMenu(
        initialIndex >= 0 && initialIndex < options.length
          ? initialIndex
          : direction === 1
            ? firstEnabledIndex(options)
            : options.length - 1,
      );
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        moveActive(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveActive(-1);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(firstEnabledIndex(options));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(
          options.findLastIndex((option) => !option.disabled),
        );
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        selectIndex(activeIndex);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case "Tab":
        close(false);
        break;
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`relative inline-flex items-center justify-between gap-2 text-left ${className ?? ""}`}
        aria-label={`${ariaLabel}, ${selectedOption?.label ?? "None"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {selectedOption?.label ?? "None"}
        </span>
        <Image
          className={`size-3 flex-none transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          src="/icons/picker-select-arrow.svg"
          alt=""
          width={12}
          height={6}
          unoptimized
          aria-hidden="true"
        />
      </button>
      {open && typeof document !== "undefined"
        ? createPortal(
            <ul
              ref={menuRef}
              className={MENU_CLASS_NAME}
              id={`${id}-listbox`}
              role="listbox"
              tabIndex={-1}
              aria-label={ariaLabel}
              aria-activedescendant={
                activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
              }
              onKeyDown={onMenuKeyDown}
              style={
                position
                  ? ({
                      left: position.left,
                      top: position.top,
                      width: position.width,
                      maxHeight: position.maxHeight,
                    } satisfies CSSProperties)
                  : { left: 0, top: 0, visibility: "hidden" }
              }
            >
              {options.map((option, index) => (
                <li
                  className={OPTION_CLASS_NAME}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={option.value === value}
                  aria-disabled={option.disabled || undefined}
                  data-active={activeIndex === index}
                  onPointerMove={() => {
                    if (!option.disabled) setActiveIndex(index);
                  }}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => selectIndex(index)}
                  key={option.value}
                >
                  {option.label}
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </>
  );
}
