/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */
import * as React from 'react';
import {css} from "@emotion/css";
import GridOrganizer, {Cell, fixGrid} from "../common/GridOrganizer";
import {getLogger} from '../../logger';
import {GridPosition} from 'colab-rest-client';

const logger = getLogger("PlayWithGridOrganizer");

type PlayCell = Cell<{ id: number; title: string }>;

const playCellStyle = css({
  border: '1px solid lightgrey',
  padding: '15px',
  textAlign: 'center',
  boxShadow: '0 0 5px 0 lightgray',
  boxSizing: 'border-box',
  height: '100%',
  background: 'white',
});

export default function PlayWithGridOrganizer(): JSX.Element {
  const [cells, setCells] = React.useState<PlayCell[]>([
    { id: 1, x: 1, y: 1, width: 1, height: 1, payload: { id: 1, title: 'top cell' } },
    { id: 2, x: 2, y: 1, width: 1, height: 1, payload: { id: 2, title: 'left cell' } },
    { id: 3, x: 3, y: 1, width: 1, height: 1, payload: { id: 3, title: 'right cell' } },
    { id: 4, x: 1, y: 2, width: 1, height: 1, payload: { id: 4, title: 'bottom cell' } },
    { id: 5, x: 1, y: 1, width: 3, height: 1, payload: { id: 5, title: 'support cell' } },
    { id: 6, x: 1, y: 1, width: 1, height: 3, payload: { id: 6, title: 'side cell' } },
    { id: 7, x: 1, y: 1, width: 4, height: 1, payload: { id: 7, title: 'subsupport cell' } },
    { id: 8, x: 1, y: 1, width: 1, height: 4, payload: { id: 8, title: 'uberside cell' } },
  ]);

  const fixed = fixGrid(cells);
  logger.info('Fixed: ', fixed);

  const updateCellCb = React.useCallback(
    (cell: PlayCell, newPosition: GridPosition) => {
      const cellIndex = cells.findIndex(c => cell.id === c.id);
      if (cellIndex >= 0) {
        const newCells = [...cells];
        newCells.splice(cellIndex, 1, {
          ...cell,
          ...newPosition,
          payload: {
            id: cell.id,
            title: cell.payload.title.startsWith('[x]')
              ? cell.payload.title
              : `[x] ${cell.payload.title}`,
          },
        });
        setCells(newCells);
      }
    },
    [cells],
  );

  return (
    <GridOrganizer
      cells={fixed.cells}
      onResize={updateCellCb}
      background={cell => (
        <div className={playCellStyle}>
          <div>{cell.payload.title}</div>
          <div>
            Pos({cell.x};{cell.y})
          </div>
          <div>
            {'⬄'}
            {cell.width}
          </div>
          <div>
            {'⇳'}
            {cell.height}
          </div>
        </div>
      )}
    />
  );
}
