/*
 * The coLAB project
 * Copyright (C) 2021-2023 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { css } from '@emotion/css';
import { Card, CardContent } from 'colab-rest-client';
import * as React from 'react';
import { useAndLoadSubCards } from '../../../store/selectors/cardSelector';
import InlineLoading from '../../common/element/InlineLoading';
import CardView from './CardView';

interface ListViewProps {
  content: CardContent;
}

export default function ListViewWrapper({ content }: ListViewProps): JSX.Element {
  const subCards = useAndLoadSubCards(content.id);

  if (subCards !== undefined && subCards !== null) {
    subCards.sort((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    return (
      <>
        <ListView cards={subCards} />
      </>
    );
  }

  return <InlineLoading />;
}

function ListView({ cards }: { cards: Card[] }): JSX.Element {
  const [cardIds, setCardIds] = React.useState(cards.map(card => card.id!));

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const sensors = useSensors(mouseSensor);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over != null && active.id !== over.id) {
      setCardIds(items => {
        const oldIndex = items.indexOf(Number(active.id));
        const newIndex = items.indexOf(Number(over.id));
        arrayMove(cards, oldIndex, newIndex);
        return arrayMove(cardIds, oldIndex, newIndex);
      });
    }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cardIds.map(id => (
            <>
              <div className={css({ width: '100%' })}>
                <CardView card={cards.find(c => c.id === id)!} key={id} id={id} />
              </div>
            </>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
}

// export default function ListView({ content }: ListViewProps): JSX.Element {
//   const subCards = useAndLoadSubCards(content.id);
//   const sensors = useSensors(useSensor(PointerSensor));
//   const [cards, setCards] = React.useState(subCards?.map(card => card.id!));

//   function handleDragEnd(event: DragEndEvent) {
//     const { active, over } = event;

//     if (active.id !== over!.id) {
//       setCards(cards => {
//         const oldIndex = cards!.indexOf(Number(active.id));
//         const newIndex = cards!.indexOf(Number(over!.id));

//         return arrayMove(cards!, oldIndex, newIndex);
//       });
//     }
//   }

//   if (subCards !== undefined && subCards !== null) {
//     subCards.sort((a, b) => {
//       if (a.y === b.y) {
//         return a.x - b.x;
//       }
//       return a.y - b.y;
//     });
//   }

//   if (subCards && subCards.length > 0) {
//     return (
//       <>
//         <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//           <SortableContext items={cards!} strategy={verticalListSortingStrategy}>
//             {subCards.map(card => (
//               <div key={card.id} className={css({ width: '100%' })}>
//                 <CardView card={card} />
//               </div>
//             ))}
//           </SortableContext>
//         </DndContext>
//       </>
//     );
//   }

//   return <></>;
// }
