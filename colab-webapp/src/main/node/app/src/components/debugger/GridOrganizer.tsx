/*
 * The coLAB project
 * Copyright (C) 2021 AlbaSim, MEI, HEIG-VD, HES-SO
 *
 * Licensed under the MIT License
 */

import {ClassNamesArg, css, cx} from '@emotion/css';
import {faBan} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {isEqual} from 'lodash';
import * as React from 'react';
import logger from '../../logger';

const handles = ['N', 'S', 'E', 'W', 'NE', 'SE', 'NW', 'SW', 'M'] as const;

type Handle = typeof handles[number];

export interface Cell {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Idle {
  status: 'idle';
  tmpCell: undefined;
}

interface Move<T extends Cell> {
  status: 'move';
  mode: 'M';
  cellColumn: number;
  cellRow: number;
  cell: T;
  inCellDelta: {
    x: number;
    y: number;
  };
  tmpCell: Cell | undefined;
}

interface Resize<T extends Cell> {
  status: 'resize';
  mode: Omit<Handle, 'M'>;
  anchorColumn: number;
  anchorRow: number;
  cell: T;
  tmpCell: Cell | undefined;
}

type DndRef<T extends Cell> = Idle | Move<T> | Resize<T>;

const findCell = <T extends Cell>(
  e: EventTarget,
  cells: T[],
): {x: number; y: number; cell: T | undefined} | undefined => {
  if (e instanceof Element) {
    const cell = e.closest('.Cell');
    if (cell) {
      const cellId = Number(cell.getAttribute('data-cell-id'));
      const realCell = cells.find(cell => cell.id === cellId);
      return {
        x: Number(cell.getAttribute('data-column')),
        y: Number(cell.getAttribute('data-row')),
        cell: realCell,
      };
    }
    return undefined;
  }
};

const findCoordinate = (e: EventTarget): {x: number; y: number} | undefined => {
  if (e instanceof Element) {
    const cell = e.closest('.InvisibleCell');
    if (cell) {
      return {
        x: Number(cell.getAttribute('data-column')),
        y: Number(cell.getAttribute('data-row')),
      };
    }
    return undefined;
  }
};

const findHandle = (e: EventTarget): Handle | undefined => {
  if (e instanceof Element) {
    const handleAttr = e.getAttribute('data-handle');
    if (handleAttr && handles.includes(handleAttr as Handle)) {
      return handleAttr as Handle;
    }
  }
  return undefined;
};

const tmpCellStyle = css({
  userSelect: 'none',
  pointerEvents: 'none',
});

const invalidTmpCellStyle = css({
  opacity: '0.5',
});

const invalidIconStyle = css({
  height: '100%',
  width: '100%',
  maxHeight: '66px',
  maxWidth: '66px',
});

function computeCellStyle(cell: Cell, shiftX: number, shiftY: number) {
  const x = cell.x + shiftX;
  const y = cell.y + shiftY;

  return cx(
    'Cell',
    css({
      minWidth: '100px',
      minHeight: '66px',
      gridColumnStart: x,
      gridColumnEnd: x + cell.width,
      gridRowStart: y,
      gridRowEnd: y + cell.height,
      position: 'relative',
    }),
  );
}

const backgroundStyle = css({
  pointerEvents: 'none',
  userSelect: 'none',
  height: '100%',
});

const overlayStyle = css({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

const tmpOverlayStyle = cx(
  overlayStyle,
  css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px',
  }),
);

const handlesStyle = (size: string = '24px') =>
  css({
    display: 'grid',
    width: '100%',
    height: '100%',
    gridTemplateColumns: `${size} auto ${size}`,
    gridTemplateRows: `${size} auto ${size}`,
  });

// grab
// grabbing

const handleStyle = cx(
  'handle',
  css({
    ':hover': {},
  }),
);

const cursors: Record<Handle, ClassNamesArg> = {
  NW: css({cursor: 'nw-resize'}),
  N: css({cursor: 'n-resize'}),
  NE: css({cursor: 'ne-resize'}),

  W: css({cursor: 'w-resize'}),
  M: css({cursor: 'grab'}),
  E: css({cursor: 'e-resize'}),

  SW: css({cursor: 'sw-resize'}),
  S: css({cursor: 's-resize'}),
  SE: css({cursor: 'se-resize'}),
};

const topLeftStyle = cx(handleStyle, cursors.NW);
const topStyle = cx(handleStyle, cursors.N);
const topRightStyle = cx(handleStyle, cursors.NE);

const middleLeftStyle = cx(handleStyle, cursors.W);
const middleStyle = cx(handleStyle, cursors.M);
const middleRightStyle = cx(handleStyle, cursors.E);

const bottomLeftStyle = cx(handleStyle, cursors.SW);
const bottomStyle = cx(handleStyle, cursors.S);
const bottomRightStyle = cx(handleStyle, cursors.SE);

function computeVoidStyle(x: number, y: number) {
  return cx(
    'Cell',
    css({
      minWidth: '33px',
      minHeight: '33px',
      border: '1px dashed lightgrey',
      padding: '15px',
      gridColumnStart: x,
      gridRowStart: y,
    }),
  );
}

function computeInvisibleCellStyle(x: number, y: number) {
  return cx(
    'InvisibleCell',
    css({
      minWidth: '33px',
      minHeight: '33px',
      gridColumnStart: x,
      gridRowStart: y,
    }),
  );
}

function printMatrix(matrix: (number | undefined)[][]) {
  let output = '\n';
  const nbCol = matrix.length;
  const nbRow = matrix[0]!.length;

  for (let y = 0; y < nbRow; y++) {
    for (let x = 0; x < nbCol; x++) {
      output += matrix[x]![y] || 0;
    }
    output += '\n';
  }
  logger.debug('Matrix', output);
}

function stopPropagation(e: React.MouseEvent) {
  e.stopPropagation();
}

interface CellDisplayProps<T extends Cell> {
  cell: T;
  shiftX: number;
  shiftY: number;
  handleSize?: string;
  background: (cell: T) => React.ReactNode;
}

function CellDisplay<T extends Cell>({
  cell,
  shiftX,
  shiftY,
  background,
  handleSize,
}: CellDisplayProps<T>) {
  return (
    <div
      className={computeCellStyle(cell, shiftX, shiftY)}
      data-cell-id={cell.id}
      data-column={cell.x + shiftX}
      data-row={cell.y + shiftY}
    >
      <div className={backgroundStyle}>{background(cell)}</div>
      <div className={overlayStyle}>
        <div className={handlesStyle(handleSize)}>
          <div data-handle="NW" className={topLeftStyle}></div>
          <div data-handle="N" className={topStyle}></div>
          <div data-handle="NE" className={topRightStyle}></div>
          <div data-handle="W" className={middleLeftStyle}></div>
          <div data-handle="M" className={middleStyle}></div>
          <div data-handle="E" className={middleRightStyle}></div>
          <div data-handle="SW" className={bottomLeftStyle}></div>
          <div data-handle="S" className={bottomStyle}></div>
          <div data-handle="SE" className={bottomRightStyle}></div>
        </div>
      </div>
    </div>
  );
}

interface VoidDisplayProps {
  x: number;
  y: number;
}

function VoidDisplay({x, y}: VoidDisplayProps) {
  return <div className={computeVoidStyle(x, y)} data-column={x} data-row={y}></div>;
}

function InvisibleGridDisplay({x, y}: VoidDisplayProps) {
  return <div className={computeInvisibleCellStyle(x, y)} data-column={x} data-row={y}></div>;
}

interface TmpCellDisplayProps<T extends Cell> {
  cell: Cell;
  cells: T[];
  shiftX: number;
  shiftY: number;
  background: (cell: T) => React.ReactNode;
  invalid: boolean;
}

function TmpCellDisplay<T extends Cell>({
  cell,
  cells,
  shiftX,
  shiftY,
  background,
  invalid,
}: TmpCellDisplayProps<T>) {
  const realCell = cells.find(c => c.id === cell.id);
  return (
    <div
      className={cx({
        [invalidTmpCellStyle]: invalid,
        [tmpCellStyle]: true,
        [computeCellStyle(cell, shiftX, shiftY)]: true,
      })}
      data-column={cell.x}
      data-row={cell.y}
    >
      {realCell && <div className={backgroundStyle}>{background(realCell)}</div>}
      <div className={tmpOverlayStyle}>
        {invalid && (
          <FontAwesomeIcon
            className={invalidIconStyle}
            size="2x"
            icon={faBan}
            color={'var(--errorColor)'}
          />
        )}
      </div>
    </div>
  );
}

interface GridOrganizerProps<T extends Cell> {
  cells: T[];
  background: (cell: T) => React.ReactNode;
  onResize: (cell: T, newPosition: Cell) => void;
  handleSize?: string;
  gap?: string;
}

interface Extent {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export default function GridOrganizer<T extends Cell>({
  cells,
  background,
  onResize,
  handleSize,
  gap = '20px',
}: GridOrganizerProps<T>): JSX.Element {
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const dndRef = React.useRef<DndRef<T>>({status: 'idle', tmpCell: undefined});

  const [tmpCell, setTmpCell] = React.useState<Cell>();
  dndRef.current.tmpCell = tmpCell;

  // 1) get "bounding box"
  const extent = cells.reduce<Extent>(
    (extent, cell) => {
      extent.minX = Math.min(extent.minX, cell.x);
      extent.minY = Math.min(extent.minY, cell.y);

      extent.maxX = Math.max(extent.maxX, cell.x + cell.width - 1);
      extent.maxY = Math.max(extent.maxY, cell.y + cell.height - 1);
      return extent;
    },
    {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  );

  if (tmpCell) {
    // // once, when moving tmpCell to farwest or farnorth, default extent behaviour is scary
    // // it will expand the grid to -Infinity
    // // hack: only show 5 extra rows/columns
    //    logger.info('Extent Before', extent);
    //    if (tmpCell.x < extent.minX) {
    //      //extent.minX = tmpCell.x;
    //      extent.minX -= 5;
    //    }
    //
    //    if (tmpCell.y < extent.minY) {
    //      extent.minY -= 5;
    //    }
    extent.minX = Math.min(extent.minX, tmpCell.x);
    extent.minY = Math.min(extent.minY, tmpCell.y);

    // when moving tmpCell to fareast or farsouth, defautl extent computation is fine
    extent.maxX = Math.max(extent.maxX, tmpCell.x + tmpCell.width - 1);
    extent.maxY = Math.max(extent.maxY, tmpCell.y + tmpCell.height - 1);

    logger.debug('Extent After', extent);
  }

  // 2) add contour
  const extentWithContour: Extent = {
    minX: extent.minX - 1,
    minY: extent.minY - 1,
    maxX: extent.maxX + 1,
    maxY: extent.maxY + 1,
  };

  // 3) compute shiftX, shiftY to have contour starting at one
  const shiftX = 1 - extentWithContour.minX;
  const shiftY = 1 - extentWithContour.minY;
  const nbColumn = Math.max(3, extentWithContour.maxX - extentWithContour.minX + 1);
  const nbRow = Math.max(3, extentWithContour.maxY - extentWithContour.minY + 1);

  logger.debug('Extent: ', extent);
  logger.debug('ExtentWithContour: ', extentWithContour);
  logger.debug('Shift: ', shiftX, shiftY);
  logger.debug('NbColumn: ', nbColumn);
  logger.debug('NbRow: ', nbRow);

  // use a numeric grid to store cells location
  // will be used to
  //  1) detect empty spaces
  //  2) avoid collision when resizing
  //  3) detect cell when moving (move within)
  const matrix = Array.from<(number | undefined)[]>({length: nbColumn});
  matrix.forEach((_, i) => {
    matrix[i] = Array.from<number | undefined>({length: nbRow}).fill(undefined);
  });

  cells.forEach(cell => {
    const x = cell.x + shiftX - 1; // -1 because matrix starts at 0
    const y = cell.y + shiftY - 1; // -1 because matrix starts at 0
    for (let i = 0; i < cell.width; i++) {
      for (let j = 0; j < cell.height; j++) {
        logger.debug('Fill: ', x, y, i, j);
        matrix[x + i]![y + j] = cell.id;
      }
    }
  });
  logger.getLevel() > 3 && printMatrix(matrix);

  const voidSpaces: {x: number; y: number}[] = [];
  // 1) extract empty cells
  for (let x = 0; x < nbColumn; x++) {
    for (let y = 0; y < nbRow; y++) {
      if (matrix[x]![y] == null) {
        // empty space detected
        voidSpaces.push({
          x: x + 1,
          y: y + 1,
        });
      }
    }
  }

  const matrixRef = React.useRef(matrix);
  matrixRef.current = matrix;

  const checkMatrix = React.useCallback((cell: Cell, shiftX: number, shiftY: number) => {
    // printMatrix(matrixRef.current);

    const matrix = matrixRef.current;
    const xMin = cell.x + shiftX;
    const xMax = xMin + cell.width - 1;

    const yMin = cell.y + shiftY;
    const yMax = yMin + cell.height - 1;

    for (let x = xMin - 1 /* grid start at 1, matrix at 0 */; x < xMax; x++) {
      const line = matrix[x];
      if (line) {
        for (let y = yMin - 1; y < yMax; y++) {
          if (line[y] != null && line[y] !== cell.id) {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  const cellsRef = React.useRef(cells);
  cellsRef.current = cells;

  const [cursor, setCursor] = React.useState<Handle>();

  const mouseHandler = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.type === 'mousedown') {
        const handle = findHandle(e.target);
        if (handle) {
          const cell = findCell(e.target, cellsRef.current);
          if (cell?.cell) {
            setCursor(handle);
            if (handle === 'M') {
              logger.debug('MouseDown: Init move', cell);
              const delta = {x: 0, y: 0};
              if (e.target instanceof Element) {
                const cellBbox = e.target.getBoundingClientRect();
                const inBoxPointerPos = {
                  x: (e.clientX - cellBbox.left) / cellBbox.width,
                  y: (e.clientY - cellBbox.top) / cellBbox.height,
                };
                delta.x = Math.floor(inBoxPointerPos.x * cell.cell.width);
                delta.y = Math.floor(inBoxPointerPos.y * cell.cell.height);
              }
              dndRef.current = {
                status: 'move',
                mode: 'M',
                cellColumn: 0,
                cellRow: 0,
                cell: cell.cell,
                tmpCell: undefined,
                inCellDelta: delta,
              };
            } else {
              logger.debug('MouseDown: Init Resize', handle, cell);
              dndRef.current = {
                status: 'resize',
                mode: handle,
                anchorColumn: cell.x,
                anchorRow: cell.y,
                cell: cell.cell,
                tmpCell: undefined,
              };
            }
          }
        }
      } else if (e.type === 'mousemove') {
        if (dndRef.current.status === 'move') {
          const coord = findCoordinate(e.target);
          const realCell = dndRef.current.cell;
          const delta = dndRef.current.inCellDelta;
          logger.debug('MouseMove', e.target, coord, realCell);
          if (coord && realCell) {
            setTmpCell(tmpCell => {
              const newCell = {
                x: coord.x - delta.x - shiftX,
                y: coord.y - delta.y - shiftY,
                width: realCell.width,
                height: realCell.height,
                id: realCell.id,
                title: '',
              };

              if (isEqual(tmpCell, newCell)) {
                return tmpCell;
              } else {
                return newCell;
              }
            });
          }
          //logger.info("MouseMove::Move", cell);
        } else if (dndRef.current.status === 'resize') {
          const mode = dndRef.current.mode;

          const coord = findCoordinate(e.target);
          const realCell = dndRef.current.cell;
          //logger.info("Resize", e.target, cell, realCell);
          if (coord && realCell) {
            setTmpCell(tmpCell => {
              const rcX = realCell.x + shiftX;
              const rcY = realCell.y + shiftY;

              let xMin = Math.min(coord.x, rcX);
              let yMin = Math.min(coord.y, rcY);

              let xMax = Math.max(coord.x, rcX);
              let yMax = Math.max(coord.y, rcY);

              if (mode === 'N' || mode === 'NE' || mode === 'NW') {
                // resizing towards north, south is fixed
                yMax = rcY + realCell.height - 1;
                yMin = Math.min(coord.y, yMax);
              }

              if (mode === 'S' || mode === 'SE' || mode === 'SW') {
                // resizing towards south, north is fixed
                yMin = rcY;
              }

              if (mode === 'W' || mode === 'NW' || mode === 'SW') {
                // resizing towards west, east is fixed
                xMax = rcX + realCell.width - 1;
                xMin = Math.min(coord.x, xMax);
              }

              if (mode === 'E' || mode === 'NE' || mode === 'SE') {
                // resizing towards east, west is fixed
                xMin = rcX;
              }

              if (mode === 'N' || mode === 'S') {
                // north-south direction only
                xMin = rcX;
                xMax = rcX + realCell.width - 1;
              }

              if (mode === 'E' || mode === 'W') {
                // west-east direction only
                yMin = rcY;
                yMax = rcY + realCell.height - 1;
              }

              const x = xMin;
              const y = yMin;

              const width = xMax - xMin + 1;
              const height = yMax - yMin + 1;

              //              if (mode === 'N' || mode === 'S') {
              //                x = realCell.x + shiftX;
              //                width = realCell.width;
              //              } else if (mode === 'E' || mode === 'W') {
              //                y = realCell.y + shiftY;
              //                height = realCell.height;
              //              }

              logger.debug('Resize', coord, realCell, {shiftX, shiftY});
              logger.debug('=>', {xMin, yMin, width, height});

              const newCell = {
                x: x - shiftX,
                y: y - shiftY,
                width,
                height,
                id: realCell.id,
                title: '',
              };

              if (isEqual(tmpCell, newCell)) {
                return tmpCell;
              } else {
                return newCell;
              }
            });
          }
        }
      } else if (e.type === 'mouseup') {
        if (dndRef.current.tmpCell) {
          if (checkMatrix(dndRef.current.tmpCell, shiftX, shiftY)) {
            const theCell: T = dndRef.current.cell;
            const cleanCell: Cell = {
              id: dndRef.current.tmpCell.id,
              x: dndRef.current.tmpCell.x,
              y: dndRef.current.tmpCell.y,
              width: dndRef.current.tmpCell.width,
              height: dndRef.current.tmpCell.height,
            };
            onResize(theCell, cleanCell);
          }
        }
        dndRef.current = {status: 'idle', tmpCell: undefined};
        setCursor(undefined);
        setTmpCell(undefined);
        // if current tempCell is valid, invoke onChange(cell: T, newPosition: Cell);
      } else {
        // for all other events (eg mouseLeave) => cancel the operation
        dndRef.current = {status: 'idle', tmpCell: undefined};
        setCursor(undefined);
        setTmpCell(undefined);
      }
      e.preventDefault();
    },
    [shiftX, shiftY, onResize, checkMatrix],
  );

  const enableDragAndDrop = true;

  const cursorStyle = cursor ? cursors[cursor] : undefined;
  const modeClass = cursor ? 'dragging' : 'not-dragging';
  const tmpValid = tmpCell && checkMatrix(tmpCell, shiftX, shiftY);
  const tmpCellSelector = `& .Cell[data-cell-id="${tmpCell?.id || -1}"]`;

  logger.debug('CellSelector: ', tmpCellSelector);

  return (
    <>
      <div
        onClick={/*make sure not to trigger click event on mouseUp*/ stopPropagation}
        className={cx(
          cursorStyle,
          modeClass,
          css({
            display: 'grid',
            gridTemplateColumns: `repeat(${nbColumn}, minmax(min-content, 1fr))`,
            justifyContent: 'strech',
            alignContent: 'stretch',
            justifyItems: 'stretch',
            alignItems: 'stretch',
            gridGap: gap,
            '&.not-dragging .Cell:hover .handle': {
              backgroundColor: 'lightgrey',
              border: '1px solid grey',
              opacity: 0.2,
            },
            '&.not-dragging .Cell .handle:hover': {
              //backgroundColor: 'lightgrey',
              opacity: '0.5',
            },
            '&.dragging .Cell .handle': {
              cursor: 'unset',
            },
            [tmpCellSelector]: {
              opacity: '0.25',
            },
            '&.dragging .Cell': {
              pointerEvents: 'none',
            },
          }),
        )}
        onMouseUp={enableDragAndDrop ? mouseHandler : undefined}
        onMouseDownCapture={enableDragAndDrop ? mouseHandler : undefined}
        onMouseMove={enableDragAndDrop ? mouseHandler : undefined}
        onMouseLeave={enableDragAndDrop ? mouseHandler : undefined}
      >
        {(() => {
          // invisible underlying grid position pointer
          return Array.from({length: nbRow}).flatMap((_, y) => {
            return Array.from({length: nbColumn}).map((_, x) => {
              return <InvisibleGridDisplay key={`${x + 1};${y + 1}`} x={x + 1} y={y + 1} />;
            });
          });
        })()}
        {cells.map(cell => (
          // effective cell to display
          <CellDisplay
            key={cell.id}
            cell={cell}
            shiftX={shiftX}
            shiftY={shiftY}
            background={background}
            handleSize={handleSize}
          />
        ))}
        {voidSpaces.map(({x, y}) => (
          // highlight empty cell with dashed border to visually identify drop-zones
          <VoidDisplay key={`${x};${y}`} x={x} y={y} />
        ))}
        {tmpCell && (
          // the cell being moved or resized
          <TmpCellDisplay
            cell={tmpCell}
            cells={cells}
            shiftX={shiftX}
            shiftY={shiftY}
            background={background}
            invalid={!tmpValid}
          />
        )}
      </div>
      <div ref={overlayRef}></div>
    </>
  );
}

interface PlayCell extends Cell {
  title: string;
}

const playCellStyle = css({
  border: '1px solid lightgrey',
  padding: '15px',
  textAlign: 'center',
  boxShadow: '0 0 5px 0 lightgray',
  boxSizing: 'border-box',
  height: '100%',
  background: 'white',
});

export function PlayGridOrganizer(): JSX.Element {
  const [cells, setCells] = React.useState<PlayCell[]>([
    {id: 1, x: 2, y: 1, width: 1, height: 1, title: 'top cell'},
    {id: 2, x: 1, y: 2, width: 1, height: 1, title: 'left cell'},
    {id: 3, x: 3, y: 2, width: 1, height: 1, title: 'right cell'},
    {id: 4, x: 2, y: 3, width: 1, height: 1, title: 'bottom cell'},
    {id: 5, x: 1, y: 4, width: 3, height: 1, title: 'support cell'},
    {id: 6, x: 5, y: 1, width: 1, height: 3, title: 'side cell'},
  ]);

  const updateCellCb = React.useCallback(
    (cell: PlayCell, newPosition: Cell) => {
      const cellIndex = cells.findIndex(c => cell.id === c.id);
      if (cellIndex >= 0) {
        const newCells = [...cells];
        newCells.splice(cellIndex, 1, {...cell, ...newPosition});
        setCells(newCells);
      }
    },
    [cells],
  );

  return (
    <GridOrganizer
      cells={cells}
      onResize={updateCellCb}
      background={cell => (
        <div className={playCellStyle}>
          <div>{cell.title}</div>
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
