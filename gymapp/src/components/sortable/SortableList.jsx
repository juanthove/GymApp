import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function SortableList({ items, setItems, getId, children, selectedIds = [], onClearSelection }) {
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = items.findIndex((item) => getId(item) === active.id);

    const overIndex = items.findIndex((item) => getId(item) === over.id);

    if (activeIndex === -1 || overIndex === -1) return;

    const movingItems = selectedIds.includes(active.id)
      ? items.filter((item) => selectedIds.includes(getId(item)))
      : [items[activeIndex]];

    const movingIds = movingItems.map(getId);

    if (movingIds.includes(over.id)) return;

    const remainingItems = items.filter((item) => !movingIds.includes(getId(item)));

    const targetIndex = remainingItems.findIndex((item) => getId(item) === over.id);

    if (targetIndex === -1) return;

    // Si subimos, insertamos antes del destino.
    // Si bajamos, insertamos después del destino.
    const insertIndex = activeIndex > overIndex ? targetIndex : targetIndex + 1;

    const newItems = [...remainingItems];

    newItems.splice(insertIndex, 0, ...movingItems);

    setItems(newItems);
    onClearSelection?.();
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(getId)} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}
