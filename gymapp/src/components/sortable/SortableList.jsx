import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";

export default function SortableList({
  items,
  setItems,
  getId,
  children
}) {

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex(i => getId(i) === active.id);
    const newIndex = items.findIndex(i => getId(i) === over.id);

    setItems(arrayMove(items, oldIndex, newIndex));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // 👈 evita clicks accidentales
      }
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,   // 👈 tiempo de presión
        tolerance: 5  // 👈 margen de movimiento
      }
    })
  );

  return (
    <DndContext
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(getId)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}