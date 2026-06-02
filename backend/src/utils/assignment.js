/**
 * Bipartite Matching - Hungarian Algorithm (Kuhn-Munkres)
 * Solves the Assignment Problem (Minimizes global cost matching rows to columns).
 * Supported: Non-square cost matrices (automatically padded with high costs).
 */
export function runHungarian(costMatrix) {
  const originalRows = costMatrix.length;
  const originalCols = costMatrix[0]?.length || 0;
  if (originalRows === 0 || originalCols === 0) return [];

  // Make the matrix square by padding with large numbers if necessary
  const n = Math.max(originalRows, originalCols);
  const matrix = Array.from({ length: n }, () => Array(n).fill(Infinity));
  
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (r < originalRows && c < originalCols) {
        matrix[r][c] = costMatrix[r][c];
      } else {
        // Pad with a high value so dummy nodes are assigned last
        matrix[r][c] = 999999;
      }
    }
  }

  // Row reductions
  for (let r = 0; r < n; r++) {
    const minVal = Math.min(...matrix[r]);
    for (let c = 0; c < n; c++) {
      matrix[r][c] -= minVal;
    }
  }

  // Column reductions
  for (let c = 0; c < n; c++) {
    let minVal = Infinity;
    for (let r = 0; r < n; r++) {
      minVal = Math.min(minVal, matrix[r][c]);
    }
    for (let r = 0; r < n; r++) {
      matrix[r][c] -= minVal;
    }
  }

  // Matching algorithm: Kuhn's max bipartite matching or simple Hungarian steps
  // For small n (typical emergency dispatch n <= 10), we can run a Hungarian path step solver
  const labelByRow = Array(n).fill(0);
  const labelByCol = Array(n).fill(0);
  const matchByCol = Array(n).fill(-1);
  const matchByRow = Array(n).fill(-1);

  // Initialize labeling
  for (let r = 0; r < n; r++) {
    labelByRow[r] = Math.min(...matrix[r]);
  }

  // Helper BFS/DFS for augmenting path
  for (let r = 0; r < n; r++) {
    const links = Array(n).fill(-1);
    const mins = Array(n).fill(Infinity);
    const visitedRow = Array(n).fill(false);
    const visitedCol = Array(n).fill(false);

    let markedRow = r;
    let markedCol = -1;
    let col = -1;

    // Search for augmenting path
    while (true) {
      visitedRow[markedRow] = true;
      let delta = Infinity;
      let nextCol = -1;

      for (let c = 0; c < n; c++) {
        if (!visitedCol[c]) {
          const val = matrix[markedRow][c] - labelByRow[markedRow] - labelByCol[c];
          if (val < mins[c]) {
            mins[c] = val;
            links[c] = col;
          }
          if (mins[c] < delta) {
            delta = mins[c];
            nextCol = c;
          }
        }
      }

      if (delta > 0) {
        for (let j = 0; j < n; j++) {
          if (visitedRow[j]) labelByRow[j] += delta;
          if (visitedCol[j]) labelByCol[j] -= delta;
          else mins[j] -= delta;
        }
      }

      col = nextCol;
      visitedCol[col] = true;

      const matchedRow = matchByCol[col];
      if (matchedRow === -1) {
        // Path found!
        markedCol = col;
        break;
      }
      markedRow = matchedRow;
    }

    // Augment matching
    while (markedCol !== -1) {
      const prevCol = links[markedCol];
      const row = prevCol === -1 ? r : matchByCol[prevCol];
      matchByCol[markedCol] = row;
      matchByRow[row] = markedCol;
      markedCol = prevCol;
    }
  }

  // Filter out assignments that are within the original limits (ignoring dummy nodes)
  const assignments = [];
  for (let r = 0; r < originalRows; r++) {
    const assignedCol = matchByRow[r];
    if (assignedCol < originalCols) {
      assignments.push({
        row: r,
        col: assignedCol,
        cost: costMatrix[r][assignedCol]
      });
    }
  }

  return assignments;
}
