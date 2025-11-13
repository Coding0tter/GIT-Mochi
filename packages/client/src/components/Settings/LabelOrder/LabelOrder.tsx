import { settingsService } from "@client/services/settingsService";
import { createResource, createSignal, For, Suspense } from "solid-js";
import {
  DragDropProvider,
  DragDropSensors,
  DragOverlay,
  SortableProvider,
  createSortable,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import styles from "./LabelOrder.module.css";

interface Label {
  id: string;
  name: string;
  order: number;
}

const SortableLabel = (props: {
  label: Label;
  onRemove: (id: string) => void;
}) => {
  const sortable = createSortable(props.label.id);
  return (
    <div
      use:sortable
      class={styles.labelRow}
      classList={{ [styles.dragging]: sortable.isActiveDraggable }}
    >
      <div class={styles.dragHandle}>⋮⋮</div>
      <span class={styles.labelName}>{props.label.name}</span>
      <button
        class={styles.removeBtn}
        onClick={() => props.onRemove(props.label.id)}
      >
        ×
      </button>
    </div>
  );
};

const LabelOrderSettings = () => {
  const [input, setInput] = createSignal("");
  const [labels, { refetch }] = createResource(
    async (): Promise<Label[]> =>
      (await settingsService.getSettingByKey<Label[]>("labelOrder")) || [],
  );

  const [activeItem, setActiveItem] = createSignal<string | null>(null);

  const addLabel = async () => {
    const labelName = input().trim();
    if (!labelName) return;

    const currentLabels = labels() || [];
    if (currentLabels.some((label) => label.name === labelName)) {
      setInput("");
      return;
    }

    const newLabel: Label = {
      id: crypto.randomUUID(),
      name: labelName,
      order: currentLabels.length,
    };

    await settingsService.updateSetting("labelOrder", [
      ...currentLabels,
      newLabel,
    ]);
    refetch();
    setInput("");
  };

  const removeLabel = async (id: string) => {
    const currentLabels = labels() || [];
    const updatedLabels = currentLabels
      .filter((label) => label.id !== id)
      .map((label, index) => ({ ...label, order: index }));

    await settingsService.updateSetting("labelOrder", updatedLabels);
    refetch();
  };

  const onDragStart = ({ draggable }: any) => {
    setActiveItem(draggable.id);
  };

  const onDragEnd = async ({ draggable, droppable }: any) => {
    if (draggable && droppable) {
      const currentLabels = labels() || [];
      const fromIndex = currentLabels.findIndex(
        (label) => label.id === draggable.id,
      );
      const toIndex = currentLabels.findIndex(
        (label) => label.id === droppable.id,
      );

      if (fromIndex !== toIndex) {
        const updatedLabels = [...currentLabels];
        const [movedLabel] = updatedLabels.splice(fromIndex, 1);
        updatedLabels.splice(toIndex, 0, movedLabel);

        const reorderedLabels = updatedLabels.map((label, index) => ({
          ...label,
          order: index,
        }));

        await settingsService.updateSetting("labelOrder", reorderedLabels);
        refetch();
      }
    }
    setActiveItem(null);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      addLabel();
    }
  };

  const labelIds = () => (labels() || []).map((label) => label.id);

  const activeLabel = () => {
    const currentLabels = labels() || [];
    const id = activeItem();
    return id ? currentLabels.find((label) => label.id === id) : null;
  };

  return (
    <div class={styles.container}>
      <label class={styles.label}>Label Order</label>
      <div class={styles.inputGroup}>
        <input
          class={styles.input}
          type="text"
          placeholder="Add new label..."
          value={input()}
          onInput={(e) => setInput(e.currentTarget.value)}
          onKeyPress={handleKeyPress}
        />
        <button class={styles.addBtn} onClick={addLabel}>
          Add
        </button>
      </div>
      <Suspense
        fallback={<div class={styles.loading}>Loading labels...</div>}
      >
        <DragDropProvider
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          collisionDetector={closestCenter}
        >
          <DragDropSensors />
          <div class={styles.labelList}>
            <SortableProvider ids={labelIds()}>
              <For
                each={labels()}
                fallback={
                  <div class={styles.empty}>
                    No labels added yet. Add one above!
                  </div>
                }
              >
                {(label) => (
                  <SortableLabel label={label} onRemove={removeLabel} />
                )}
              </For>
            </SortableProvider>
          </div>
          <DragOverlay>
            {activeLabel() && (
              <div class={styles.labelRow}>
                <div class={styles.dragHandle}>⋮⋮</div>
                <span class={styles.labelName}>{activeLabel()!.name}</span>
              </div>
            )}
          </DragOverlay>
        </DragDropProvider>
      </Suspense>
    </div>
  );
};

export default LabelOrderSettings;
