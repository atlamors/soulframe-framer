"use client";

import { Pencil } from "lucide-react";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  ArmorTalismanEquipmentModule,
  updateArmorTalismanEquipment,
  type ArmorTalismanSlot,
} from "@/app/builder/loadout/ArmorTalismanEquipmentModule";
import { AffinitySourceInputs } from "@/app/builder/affinity/AffinitySourceInputs";
import { VirtuesAffinityModule } from "@/app/builder/affinity/VirtuesAffinityModule";
import { PactArtsModule } from "@/app/builder/loadout/PactArtsModule";
import { WeaponEnhancementsModule, type WeaponPlannerTab } from "@/app/builder/loadout/WeaponEnhancementsModule";
import { CalculatedResultsModule } from "@/app/builder/stats/CalculatedResultsModule";
import { armorCatalogue } from "@/src/data/catalogue";
import { talismanCatalogue } from "@/src/data/talismans";
import { pactById } from "@/src/data/pacts";
import { createDefaultPactArtAllocation } from "@/src/domain/arts";
import { calculateBuild } from "@/src/domain/calculation";
import type {
  BlockNoteCompatibleDocument,
  BuildStageBlock,
} from "@/src/domain/publications/blocks";
import type { SoulframeBuild } from "@/src/domain/types";
import type { ArtAllocation, WeaponHandSlot } from "@/src/domain/types";
import {
  updatePlannerAffinitySources,
  updatePlannerCombatArt,
  updatePlannerPact,
  updatePlannerVirtues,
  updatePlannerWeapon,
  updatePlannerWeaponEnhancements,
} from "@/src/domain/planner-sections";
import { PublicationRichTextEditor } from "./PublicationRichTextEditor";
import { publicationRichTextProfiles } from "./publicationRichTextEditorModel";
import { SectionFrame } from "./SectionFrame";

export function ActiveStageFoundationCard({
  planner,
  onPlannerChange,
}: {
  planner: SoulframeBuild;
  onPlannerChange: (planner: SoulframeBuild) => void;
}) {
  const [isPactPickerOpen, setIsPactPickerOpen] = useState(false);
  const [pactAllocations, setPactAllocations] = useState<Record<string, ArtAllocation>>(
    planner.pact.itemId ? { [planner.pact.itemId]: planner.pact.artAllocation } : {},
  );
  const calculation = useMemo(
    () => calculateBuild(planner, armorCatalogue, talismanCatalogue),
    [planner],
  );

  return (
    <SectionFrame kicker="Build foundation" title="Pact & Affinity" description="Choose a Pact and define its Arts, Virtues, and Affinity sources.">
      <div className="grid min-w-0 grid-cols-1 gap-4 compact-desktop:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <PactArtsModule build={planner} isOpen={isPactPickerOpen} allocations={{ ...pactAllocations, ...(planner.pact.itemId ? { [planner.pact.itemId]: planner.pact.artAllocation } : {}) }}
            onOpen={() => setIsPactPickerOpen(true)} onClose={() => setIsPactPickerOpen(false)}
            onEquip={(id) => { const allocation = pactAllocations[id]; onPlannerChange(updatePlannerPact(planner, id, allocation)); }}
            onAllocationChange={(id, value) => { setPactAllocations((current) => ({ ...current, [id]: value })); if (planner.pact.itemId === id) onPlannerChange(updatePlannerPact(planner, id, value)); }}
            onResetAllocation={(id) => { const pact = pactById.get(id); if (!pact) return; const value = createDefaultPactArtAllocation(pact); setPactAllocations((current) => ({ ...current, [id]: value })); if (planner.pact.itemId === id) onPlannerChange(updatePlannerPact(planner, id, value)); }} />
          <div className="mt-3 min-w-0">
            <AffinitySourceInputs
              sources={planner.affinitySources}
              presentation="foundation"
              showHeader={false}
              onChange={(value) => onPlannerChange(updatePlannerAffinitySources(planner, value))}
            />
          </div>
        </div>
        <div className="min-w-0">
          <VirtuesAffinityModule build={planner} bonuses={calculation.bonusVirtues} presentation="foundation" showSourceControls={false}
            onVirtuesChange={(value) => onPlannerChange(updatePlannerVirtues(planner, value))}
            onSourcesChange={(value) => onPlannerChange(updatePlannerAffinitySources(planner, value))} />
        </div>
      </div>
    </SectionFrame>
  );
}

function ActiveStagePlannerController({
  planner,
  onPlannerChange,
}: {
  planner: SoulframeBuild;
  onPlannerChange: (planner: SoulframeBuild) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<ArmorTalismanSlot>();
  const [activeWeaponSlot, setActiveWeaponSlot] = useState<WeaponHandSlot>();
  const [weaponTab, setWeaponTab] = useState<WeaponPlannerTab>("weapon");
  const [selectedTotemSlot, setSelectedTotemSlot] = useState(0);
  const calculation = useMemo(
    () => calculateBuild(planner, armorCatalogue, talismanCatalogue),
    [planner],
  );

  const openWeapon = (slot: WeaponHandSlot, tab: WeaponPlannerTab, totemSlot?: number) => {
    setActiveWeaponSlot(slot);
    setWeaponTab(tab);
    if (totemSlot !== undefined) setSelectedTotemSlot(totemSlot);
  };

  return (
    <div className="space-y-5"
      onKeyDown={(event) => {
        if (
          event.key !== "Enter" ||
          event.defaultPrevented ||
          event.nativeEvent.isComposing
        ) {
          return;
        }
        const target = event.target;
        if (
          target instanceof HTMLInputElement &&
          target.inputMode === "search"
        ) {
          event.preventDefault();
        }
      }}
    >
      <SectionFrame kicker="Active Frame" title="Equipment" description="Edit armor and Talisman choices for this stage.">
        <div className="grid grid-cols-1 gap-2 mobile-wide:grid-cols-2 [&>button]:!col-auto [&>button]:!row-auto">
          <ArmorTalismanEquipmentModule build={planner} calculation={calculation} activeSlot={activeSlot}
            onActiveSlotChange={setActiveSlot} onClosePicker={() => setActiveSlot(undefined)}
            onEquipmentChange={(slot, itemId) => onPlannerChange(updateArmorTalismanEquipment(planner, slot, itemId))} />
        </div>
      </SectionFrame>
      <SectionFrame kicker="Loadout" title="Weapons" description="Choose weapons and configure Runes and Totems for both hands.">
        <WeaponEnhancementsModule build={planner} activeSlot={activeWeaponSlot} activeTab={weaponTab} selectedTotemSlot={selectedTotemSlot}
          showOverview showArtSummary overviewPresentation="publisher" onOpen={openWeapon} onClose={() => setActiveWeaponSlot(undefined)}
          onWeaponChange={(slot, id) => onPlannerChange(updatePlannerWeapon(planner, slot, id))}
          onEnhancementsChange={(slot, value) => onPlannerChange(updatePlannerWeaponEnhancements(planner, slot, value))}
          onArtAllocationChange={(name, value) => onPlannerChange(updatePlannerCombatArt(planner, name, value))} />
      </SectionFrame>
      <CalculatedResultsModule build={planner} calculation={calculation} />
    </div>
  );
}

export function VariantWorkspace({
  stages,
  activeStage,
  descriptionDocument,
  onSelect,
  onAdd,
  onNameChange,
  onPlannerChange,
  onDescriptionChange,
}: {
  stages: BuildStageBlock[];
  activeStage: BuildStageBlock;
  descriptionDocument: BlockNoteCompatibleDocument;
  onSelect: (stageId: string) => void;
  onAdd: (trigger: HTMLButtonElement) => void;
  onNameChange: (stageId: string, name: string) => void;
  onPlannerChange: (planner: SoulframeBuild) => void;
  onDescriptionChange: (document: BlockNoteCompatibleDocument) => void;
}) {
  const [editingStageId, setEditingStageId] = useState<string>();
  const [nameDraft, setNameDraft] = useState("");
  const cancelBeforeBlurRef = useRef(false);

  const startRename = (stage: BuildStageBlock) => {
    cancelBeforeBlurRef.current = false;
    setNameDraft(stage.data.name);
    setEditingStageId(stage.id);
  };

  const finishRename = (stage: BuildStageBlock) => {
    const nextName = nameDraft.trim().slice(0, 48);
    cancelBeforeBlurRef.current = true;
    setEditingStageId(undefined);
    setNameDraft("");
    if (nextName && nextName !== stage.data.name) {
      onNameChange(stage.id, nextName);
    }
  };

  const cancelRename = (stageId: string, restoreTabFocus: boolean) => {
    cancelBeforeBlurRef.current = true;
    setEditingStageId(undefined);
    setNameDraft("");
    if (restoreTabFocus) {
      document.getElementById(`composer-stage-${stageId}`)?.focus();
    }
  };

  const selectFromKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!direction) return;
    event.preventDefault();
    const nextIndex = (index + direction + stages.length) % stages.length;
    const next = stages[nextIndex];
    onSelect(next.id);
    document.getElementById(`composer-stage-${next.id}`)?.focus();
  };

  return (
    <SectionFrame
      kicker="Planner stages"
      title="Build"
      description="Home defines the baseline. Variants capture deliberate alternatives."
      padded={false}
    >
      <div role="tablist" aria-label="Build variants" className="flex min-w-0 overflow-x-auto border-b border-line/55 bg-control/25 px-2 pt-2">
        {stages.map((stage, index) => {
          const isActive = stage.id === activeStage.id;
          const isEditing = isActive && editingStageId === stage.id;

          return (
            <div key={stage.id} role="presentation" className="group relative flex-none">
              <button
                id={`composer-stage-${stage.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`composer-panel-${stage.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onSelect(stage.id)}
                onKeyDown={(event) => selectFromKeyboard(event, index)}
                className={`min-h-10 rounded-sm border-b-2 border-transparent pl-3 font-sans text-xs font-bold text-ink-muted aria-selected:border-gold aria-selected:text-gold-bright ${
                  isActive ? "pr-11" : "pr-3"
                }`}
              >
                <span className={isEditing ? "opacity-0" : undefined}>
                  {stage.data.name}
                </span>
              </button>

              {isEditing ? (
                <input
                  autoFocus
                  aria-label={`Rename ${stage.data.name}`}
                  value={nameDraft}
                  maxLength={48}
                  onChange={(event) => setNameDraft(event.target.value)}
                  onFocus={(event) => event.currentTarget.select()}
                  onBlur={() => {
                    if (cancelBeforeBlurRef.current) {
                      cancelBeforeBlurRef.current = false;
                      return;
                    }
                    finishRename(stage);
                  }}
                  onKeyDown={(event) => {
                    if (event.nativeEvent.isComposing) return;
                    if (event.key === "Enter") {
                      event.preventDefault();
                      finishRename(stage);
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      cancelRename(stage.id, true);
                    }
                  }}
                  className="absolute inset-y-1 left-1.5 right-10 z-10 min-w-0 rounded-sm border border-line-bright bg-control px-1.5 font-sans text-xs font-bold text-ink focus-visible:outline-none focus-visible:shadow-focus"
                />
              ) : isActive ? (
                <button
                  type="button"
                  aria-label={`Rename ${stage.data.name}`}
                  onClick={() => startRename(stage)}
                  className="absolute inset-y-0 right-0 z-10 flex min-h-10 min-w-10 items-center justify-center rounded-sm text-ink-faint opacity-70 transition-colors hover:text-gold-bright hover:opacity-100 focus-visible:text-gold-bright focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-focus group-hover:opacity-100 motion-reduce:transition-none"
                >
                  <Pencil aria-hidden="true" size={14} strokeWidth={1.8} />
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={(event) => onAdd(event.currentTarget)}
          className="min-h-10 flex-none rounded-sm px-3 font-sans text-xs font-bold text-gold hover:text-gold-bright"
        >
          + Add Variant
        </button>
      </div>

      <div
        id={`composer-panel-${activeStage.id}`}
        role="tabpanel"
        aria-labelledby={`composer-stage-${activeStage.id}`}
        className="space-y-5 p-4"
      >
        <ActiveStagePlannerController key={activeStage.id} planner={activeStage.data.planner} onPlannerChange={onPlannerChange} />

        <div>
          <p className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.1em] text-ink-soft">
            Description
          </p>
          <PublicationRichTextEditor
            key={activeStage.id}
            label={`${activeStage.data.name} description`}
            placeholder="Describe how the build plays, what it solves, and how to progress it…"
            capabilities={publicationRichTextProfiles.buildOverview}
            initialDocument={descriptionDocument}
            onChange={onDescriptionChange}
          />
        </div>
      </div>
    </SectionFrame>
  );
}
