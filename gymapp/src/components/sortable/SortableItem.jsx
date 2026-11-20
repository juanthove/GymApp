import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, children, dragHandle = false }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  const dragHandleProps = {
    ref: setActivatorNodeRef,
    ...attributes,
    ...listeners,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        cursor: dragHandle ? "default" : "grab",
      }}
      {...(!dragHandle ? attributes : {})}
      {...(!dragHandle ? listeners : {})}
    >
      {dragHandle && typeof children === "function" ? children({ dragHandleProps }) : children}
    </div>
  );
}
