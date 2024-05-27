class Agent {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.maxDepth = 3; // Set the depth limit for expectimax
  }

  selectMove() {
    var brain = new AgentBrain(this.gameManager);
    let bestMove = -1;
    let bestValue = -Infinity;

    // Try all possible moves: 0 (up), 1 (right), 2 (down), 3 (left)
    for (let move = 0; move < 4; move++) {
      brain.reset();
      if (brain.move(move)) {
        let value = this.expectimax(brain, 0, true);
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
      }
    }
    return bestMove;
  }

  expectimax(brain, depth, isMaximizingPlayer) {
    if (depth == this.maxDepth) {
      return this.evaluateGrid(brain);
    }

    if (isMaximizingPlayer) {
      let maxEval = -Infinity;
      for (let move = 0; move < 4; move++) {
        brain.reset();
        if (brain.move(move)) {
          let eval = this.expectimax(brain, depth + 1, false);
          maxEval = Math.max(maxEval, eval);
        }
      }
      return maxEval;
    } else {
      let sumEval = 0;
      let emptyCells = this.getEmptyCells(brain);
      let numEmptyCells = emptyCells.length;

      for (let cell of emptyCells) {
        brain.reset();
        brain.placeTile(cell, 2);
        sumEval += 0.9 * this.expectimax(brain, depth + 1, true);

        brain.reset();
        brain.placeTile(cell, 4);
        sumEval += 0.1 * this.expectimax(brain, depth + 1, true);
      }

      return sumEval / numEmptyCells;
    }
  }

  getEmptyCells(brain) {
    let emptyCells = [];
    for (let x = 0; x < brain.grid.size; x++) {
      for (let y = 0; y < brain.grid.size; y++) {
        if (brain.grid.cells[x][y] == null) {
          emptyCells.push({ x: x, y: y });
        }
      }
    }
    return emptyCells;
  }

  evaluateGrid(brain) {
    let grid = brain.grid;
    let score = 0;

    // Example evaluation: sum of all tiles on the grid
    for (let x = 0; x < grid.size; x++) {
      for (let y = 0; y < grid.size; y++) {
        if (grid.cells[x][y] != null) {
          score += grid.cells[x][y].value;
        }
      }
    }

    // Additional heuristics can be added here

    return score;
  }
}
