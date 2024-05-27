class AgentBrain {
  constructor(gameEngine) {
    this.size = 4;
    this.previousState = gameEngine.grid.serialize();
    this.reset();
    this.score = 0;
  }

  reset() {
    this.score = 0;
    this.grid = new Grid(this.previousState.size, this.previousState.cells);
  }

  // Adds a tile at a specific position
  addTileAt(x, y, value) {
    if (
      this.grid.withinBounds({ x: x, y: y }) &&
      this.grid.cellAvailable({ x: x, y: y })
    ) {
      var tile = new Tile({ x: x, y: y }, value);
      this.grid.insertTile(tile);
    }
  }

  // Move tiles on the grid in the specified direction
  move(direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;

    var cell, tile;

    var vector = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved = false;

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
      traversals.y.forEach(function (y) {
        cell = { x: x, y: y };
        tile = self.grid.cellContent(cell);

        if (tile) {
          var positions = self.findFarthestPosition(cell, vector);
          var next = self.grid.cellContent(positions.next);

          // Only one merger per row traversal?
          if (next && next.value === tile.value && !next.mergedFrom) {
            var merged = new Tile(positions.next, tile.value * 2);
            merged.mergedFrom = [tile, next];

            self.grid.insertTile(merged);
            self.grid.removeTile(tile);

            // Converge the two tiles' positions
            tile.updatePosition(positions.next);

            // Update the score
            self.score += merged.value;
          } else {
            self.moveTile(tile, positions.farthest);
          }

          if (!self.positionsEqual(cell, tile)) {
            moved = true; // The tile moved from its original cell!
          }
        }
      });
    });

    if (moved) {
      this.addRandomTile();
    }
    return moved;
  }

  // Get the vector representing the chosen direction
  getVector(direction) {
    // Vectors representing tile movement
    var map = {
      0: { x: 0, y: -1 }, // Up
      1: { x: 1, y: 0 }, // Right
      2: { x: 0, y: 1 }, // Down
      3: { x: -1, y: 0 }, // Left
    };

    return map[direction];
  }

  // Build a list of positions to traverse in the right order
  buildTraversals(vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
      traversals.x.push(pos);
      traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
  }

  findFarthestPosition(cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
      previous = cell;
      cell = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

    return {
      farthest: previous,
      next: cell, // Used to check if a merge is required
    };
  }

  positionsEqual(first, second) {
    return first.x === second.x && first.y === second.y;
  }

  // Helper to execute a move and return the resulting grid score
  executeMove(direction) {
    if (this.move(direction)) {
      return this.grid.score;
    }
    return -1;
  }

  // Select the best move based on simple heuristics
  selectBestMove() {
    const directions = [0, 1, 2, 3];
    let bestMove = -1;
    let bestScore = -1;

    for (let direction of directions) {
      let score = this.executeMove(direction);
      if (score > bestScore) {
        bestScore = score;
        bestMove = direction;
      }
    }

    return bestMove;
  }

  // Main method to find the best move
  findBestMove() {
    let bestMove = this.selectBestMove();

    // Perform the best move
    if (bestMove !== -1) {
      this.move(bestMove);
    }
  }
}
