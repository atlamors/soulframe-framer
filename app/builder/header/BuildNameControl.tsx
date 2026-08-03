"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import Image from "next/image";
import {
  BUILD_NAME_CONTROL_CLASS_NAMES,
  BUILD_NAME_DISPLAY_CLASS_NAMES,
  BUILD_NAME_EDIT_CLASS_NAMES,
  BUILD_NAME_EDIT_FRAME_CLASS_NAMES,
  BUILD_NAME_EDIT_FRAME_SOURCES,
  BUILD_NAME_EDIT_IMAGE_CLASS_NAMES,
  BUILD_NAME_FRAME_ART_CLASS_NAMES,
  BUILD_NAME_FRAME_CLASS_NAMES,
  BUILD_NAME_INPUT_CLASS_NAMES,
  BUILD_NAME_ORNAMENT_CLASS_NAMES,
  BUILD_NAME_ORNAMENT_SOURCES,
  type BuildNameControlAppearance,
  type BuildNameEditingState,
} from "../components/headerClassNames";

export function BuildNameControl({
  appearance,
  buildName,
  controlId,
  isActive = true,
  onNameChange,
}: {
  appearance: BuildNameControlAppearance;
  buildName: string;
  controlId: string;
  isActive?: boolean;
  onNameChange: (name: string) => void;
}) {
  const [buildNameDraft, setBuildNameDraft] = useState(buildName);
  const [isEditingBuildName, setIsEditingBuildName] = useState(false);
  const buildNameInputRef = useRef<HTMLInputElement>(null);
  const buildNameEditRef = useRef<HTMLButtonElement>(null);
  const editingState: BuildNameEditingState = isEditingBuildName
    ? "editing"
    : "default";

  const restoreEditButtonFocus = () => {
    window.requestAnimationFrame(() => {
      if (appearance === "drawer") {
        buildNameEditRef.current?.focus({ preventScroll: true });
      } else {
        buildNameEditRef.current?.focus();
      }
    });
  };

  const cancelBuildName = (restoreFocus: boolean) => {
    setBuildNameDraft(buildName);
    setIsEditingBuildName(false);
    if (restoreFocus) restoreEditButtonFocus();
  };

  const commitBuildName = (restoreFocus: boolean) => {
    onNameChange(buildNameDraft);
    setIsEditingBuildName(false);
    if (restoreFocus) restoreEditButtonFocus();
  };

  useEffect(() => {
    if (!isEditingBuildName) return;
    if (appearance === "drawer") {
      buildNameInputRef.current?.focus({ preventScroll: true });
    } else {
      buildNameInputRef.current?.focus();
    }
    buildNameInputRef.current?.select();
  }, [appearance, isEditingBuildName]);

  useEffect(() => {
    if (isActive) return;
    const frame = window.requestAnimationFrame(() => {
      setBuildNameDraft(buildName);
      setIsEditingBuildName(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [buildName, isActive]);

  const handleBuildNameBlur = () => {
    if (appearance === "header") commitBuildName(false);
  };

  const handleBuildNameKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitBuildName(appearance === "drawer");
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (appearance === "drawer") event.stopPropagation();
      cancelBuildName(true);
    }
  };

  return (
    <div
      className={BUILD_NAME_CONTROL_CLASS_NAMES[appearance][editingState]}
      data-build-name-state={editingState}
    >
      <div
        className={BUILD_NAME_FRAME_CLASS_NAMES[appearance][editingState]}
      >
        <span
          className={BUILD_NAME_FRAME_ART_CLASS_NAMES[editingState]}
          aria-hidden="true"
        />
        <Image
          className={BUILD_NAME_ORNAMENT_CLASS_NAMES[appearance].left}
          src={BUILD_NAME_ORNAMENT_SOURCES[editingState].left}
          alt=""
          aria-hidden="true"
          width={25}
          height={20}
          unoptimized
        />
        <Image
          className={BUILD_NAME_ORNAMENT_CLASS_NAMES[appearance].right}
          src={BUILD_NAME_ORNAMENT_SOURCES[editingState].right}
          alt=""
          aria-hidden="true"
          width={25}
          height={20}
          unoptimized
        />
        {isEditingBuildName ? (
          <input
            ref={buildNameInputRef}
            id={controlId}
            className={BUILD_NAME_INPUT_CLASS_NAMES[appearance]}
            value={buildNameDraft}
            maxLength={80}
            aria-label="Build name"
            onBlur={handleBuildNameBlur}
            onChange={(event) => setBuildNameDraft(event.target.value)}
            onKeyDown={handleBuildNameKeyDown}
          />
        ) : (
          <span
            id={controlId}
            className={BUILD_NAME_DISPLAY_CLASS_NAMES[appearance]}
            title={buildName}
          >
            {buildName}
          </span>
        )}
      </div>
      <button
        ref={buildNameEditRef}
        type="button"
        className={BUILD_NAME_EDIT_CLASS_NAMES[appearance][editingState]}
        data-state={editingState}
        aria-controls={controlId}
        aria-label={
          isEditingBuildName
            ? "Finish editing build name"
            : "Edit build name"
        }
        aria-pressed={isEditingBuildName}
        onMouseDown={(event) => {
          if (isEditingBuildName) event.preventDefault();
        }}
        onClick={() => {
          if (isEditingBuildName) {
            commitBuildName(false);
          } else {
            setBuildNameDraft(buildName);
            setIsEditingBuildName(true);
          }
        }}
      >
        <Image
          className={BUILD_NAME_EDIT_FRAME_CLASS_NAMES[appearance]}
          src={BUILD_NAME_EDIT_FRAME_SOURCES[editingState]}
          alt=""
          aria-hidden="true"
          width={68}
          height={56}
          unoptimized
        />
        <Image
          className={BUILD_NAME_EDIT_IMAGE_CLASS_NAMES[appearance]}
          src="/icons/edit-feather.svg"
          alt=""
          aria-hidden="true"
          width={40}
          height={48}
          unoptimized
        />
      </button>
    </div>
  );
}
