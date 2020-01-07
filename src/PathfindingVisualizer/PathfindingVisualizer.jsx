import React, { Component } from "react";
import Node from "./Node/Node";

import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      mouseIsPressed: false,
      mouseIsPressedStart: false,
      mouseIsPressedFinish: false,
      startRow: START_NODE_ROW,
      startCol: START_NODE_COL,
      endRow: FINISH_NODE_ROW,
      endCol: FINISH_NODE_COL
    };
  }
  componentDidMount() {
    const grid = getInitialGrid();

    this.setState({ grid });
  }
  handleMouseDown(row, col) {
    if (this.state.grid[row][col].isStart) {
      const ret = getNewGridWithNewStart(
        this.state.grid,
        row,
        col,
        this.state.startRow,
        this.state.startCol
      );

      const newGrid = ret[0];
      const newStartRow = ret[1];
      const newStartCol = ret[2];
      this.setState({
        grid: newGrid,
        mouseIsPressedStart: true,
        startRow: newStartRow,
        startCol: newStartCol
      });
    } else if (this.state.grid[row][col].isFinish) {
      const ret = getNewGridWithNewFinish(
        this.state.grid,
        row,
        col,
        this.state.endRow,
        this.state.endCol
      );
      const newGrid = ret[0];
      const newEndRow = ret[1];
      const newStartCol = ret[2];
      this.setState({
        grid: newGrid,
        mouseIsPressedFinish: true,
        endRow: newEndRow,
        endCol: newStartCol
      });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  handleMouseEnter(row, col) {
    if (
      !this.state.mouseIsPressed &&
      !this.state.mouseIsPressedStart &&
      !this.state.mouseIsPressedFinish
    ) {
      return;
    }
    if (this.state.mouseIsPressedStart) {
      const ret = getNewGridWithNewStart(
        this.state.grid,
        row,
        col,
        this.state.startRow,
        this.state.startCol
      );
      const newGrid = ret[0];
      const newStartRow = ret[1];
      const newStartCol = ret[2];
      this.setState({
        grid: newGrid,
        mouseIsPressedStart: true,
        startRow: newStartRow,
        startCol: newStartCol
      });
    }
    if (this.state.mouseIsPressedFinish) {
      const ret = getNewGridWithNewFinish(
        this.state.grid,
        row,
        col,
        this.state.endRow,
        this.state.endCol
      );
      const newGrid = ret[0];
      const newEndRow = ret[1];
      const newStartCol = ret[2];
      this.setState({
        grid: newGrid,
        mouseIsPressedFinish: true,
        endRow: newEndRow,
        endCol: newStartCol
      });
    }
    if (this.state.mouseIsPressed) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }

  handleMouseUp() {
    this.setState({
      mouseIsPressed: false,
      mouseIsPressedStart: false,
      mouseIsPressedFinish: false
    });
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }

  clear() {
    const newGrid = clearWalls(this.state.grid);
    this.setState({ grid: newGrid });
  }
  reset() {
    const newGrid = getInitialGrid();
    this.setState({
      grid: newGrid,
      startRow: START_NODE_ROW,
      startCol: START_NODE_COL,
      endRow: FINISH_NODE_ROW,
      endCol: FINISH_NODE_COL
    });
  }
  //DIJKSTRAS ALGORITHM
  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      //animates final path
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }

      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        console.log(node.row);
        console.log(node.col);
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = grid[this.state.startRow][this.state.startCol];
    const finishNode = grid[this.state.endRow][this.state.endCol];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  render() {
    const { grid, mouseIsPressed, mouseIsPressedStart } = this.state;
    return (
      <>
        <button onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button onClick={() => this.clear()}>Clear Walls</button>
        <button onClick={() => this.reset()}>Reset</button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const { row, col, isStart, isFinish, isWall } = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isWall={isWall}
                      //mouseIsPressed={mouseIsPressed}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithNewStart = (grid, row, col, startRow, startCol) => {
  const newGrid = grid.slice();
  //remove old start
  console.log(row, col);
  console.log(startRow, startCol);
  const node = newGrid[startRow][startCol];
  const newNode = {
    ...node,
    isStart: !node.isStart
  };
  newGrid[startRow][startCol] = newNode;

  //set new start
  const start = newGrid[row][col];
  const newStart = {
    ...start,
    isStart: !start.isStart
  };
  newGrid[row][col] = newStart;
  return [newGrid, row, col];
};

const getNewGridWithNewFinish = (grid, row, col, endRow, endCol) => {
  const newGrid = grid.slice();
  //remove old finish
  const node = newGrid[endRow][endCol];
  const newNode = {
    ...node,
    isFinish: !node.isFinish
  };
  newGrid[endRow][endCol] = newNode;

  //set new finish
  const end = newGrid[row][col];
  const newEnd = {
    ...end,
    isFinish: !end.isFinish
  };
  newGrid[row][col] = newEnd;
  return [newGrid, row, col];
};

const clearWalls = grid => {
  const newGrid = grid.slice();
  for (const row of newGrid) {
    for (const node of row) {
      node.isWall = false;
    }
  }
  return newGrid;
};
