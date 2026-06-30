import { GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

interface SpecEntry {
  key: string;
  value: string;
}

interface ProductFormSidebarProps {
  specs: SpecEntry[];
  onAddSpec: () => void;
  onUpdateSpec: (index: number, field: 'key' | 'value', val: string) => void;
  onRemoveSpec: (index: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export function ProductFormSidebar({
  specs,
  onAddSpec,
  onUpdateSpec,
  onRemoveSpec,
  onDragEnd,
}: ProductFormSidebarProps) {
  return (
    <div>
      <label className="block text-sm font-medium dark:text-gray-500 mb-2">
        Caractéristiques
      </label>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="specs">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {specs.map((spec, i) => (
                <Draggable key={`spec-${i}`} draggableId={`spec-${i}`} index={i}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="flex gap-2 items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg"
                    >
                      <div {...provided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={spec.key}
                        onChange={e => onUpdateSpec(i, 'key', e.target.value)}
                        placeholder="Clé"
                        className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={e => onUpdateSpec(i, 'value', e.target.value)}
                        placeholder="Valeur"
                        className="flex-1 px-3 py-2 border dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => onRemoveSpec(i)}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <button
        type="button"
        onClick={onAddSpec}
        className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
      >
        <span className="text-lg">+</span> Ajouter une caractéristique
      </button>
    </div>
  );
}