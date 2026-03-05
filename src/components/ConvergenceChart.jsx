/**
 * Convergence Chart Component
 *
 * Renders a log-scale error vs n chart using JSXGraph,
 * with one line per enabled quadrature method.
 */

import { useEffect, useRef } from 'react';
import JXG from 'jsxgraph';
import { QUADRATURE_METHODS } from '../utils/quadrature/index.js';

export function ConvergenceChart({ convergenceData, enabledMethods, isDarkMode, degree }) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !convergenceData) return;

    // Clean up existing board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const bgText = isDarkMode ? '#d1d5db' : '#4b5563';

    // Fixed y-axis range: 10^-17 to 10^2
    const minLog = -17;
    const maxLog = 2;

    // Calculate square bounding box for true 1:1 aspect ratio
    // Y range: (maxLog + 1.2) to (minLog - 2.5) = 3.2 to -19.5 = 22.7 units
    const yTop = maxLog + 1.2;
    const yBottom = minLog - 2.5;
    const yRange = yTop - yBottom; // 22.7

    // Center x around 5.5 (middle of data) and make range equal to yRange
    const xCenter = 5.5;
    const xLeft = xCenter - yRange / 2;
    const xRight = xCenter + yRange / 2;

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: [xLeft, yTop, xRight, yBottom],
      axis: false,
      showNavigation: false,
      showCopyright: false,
      pan: { enabled: false },
      zoom: { enabled: false },
      grid: false
    });

    boardRef.current = board;

    // ============================================
    // LAYER 0: Background elements (grid, axes)
    // ============================================

    // Draw custom grid
    for (let n = 1; n <= 10; n++) {
      board.create('segment', [[n, minLog], [n, maxLog]], {
        strokeColor: isDarkMode ? '#374151' : '#e5e7eb',
        strokeWidth: 1,
        fixed: true,
        highlight: false,
        layer: 0
      });
      board.create('text', [n, minLog - 0.5, `${n}`], {
        fontSize: 14,
        color: axisColor,
        fixed: true,
        anchorX: 'middle',
        layer: 0
      });
    }

    for (let y = Math.ceil(minLog); y <= Math.floor(maxLog); y++) {
      const isZeroLine = y === 0;
      board.create('segment', [[0.5, y], [10.5, y]], {
        strokeColor: isZeroLine
          ? (isDarkMode ? '#9ca3af' : '#6b7280')
          : (isDarkMode ? '#374151' : '#e5e7eb'),
        strokeWidth: isZeroLine ? 2.5 : 1,
        fixed: true,
        highlight: false,
        layer: 0
      });
      board.create('text', [0.2, y, `10<sup>${y}</sup>`], {
        fontSize: 12,
        color: axisColor,
        fixed: true,
        anchorX: 'right',
        display: 'html',
        layer: 0
      });
    }

    // Prominent y-axis line
    board.create('segment', [[0.5, minLog], [0.5, maxLog]], {
      strokeColor: isDarkMode ? '#9ca3af' : '#374151',
      strokeWidth: 2,
      fixed: true,
      highlight: false,
      layer: 0
    });

    // Prominent x-axis line (bottom border)
    board.create('segment', [[0.5, minLog], [10.5, minLog]], {
      strokeColor: isDarkMode ? '#9ca3af' : '#374151',
      strokeWidth: 2,
      fixed: true,
      highlight: false,
      layer: 0
    });

    // Y-axis label (rotated)
    board.create('text', [-0.9, (minLog + maxLog) / 2, 'Error'], {
      fontSize: 15,
      color: bgText,
      fixed: true,
      anchorX: 'middle',
      rotate: 90,
      layer: 0
    });

    // X-axis label
    board.create('text', [5.5, minLog - 1.3, 'Number of points (n)'], {
      fontSize: 15,
      color: bgText,
      fixed: true,
      anchorX: 'middle',
      layer: 0
    });

    // ============================================
    // LAYER 1: Highlight column (below everything else)
    // ============================================

    if (degree >= 1 && degree <= 10) {
      board.create('polygon', [
        [degree - 0.4, minLog], [degree + 0.4, minLog],
        [degree + 0.4, maxLog], [degree - 0.4, maxLog]
      ], {
        fillColor: isDarkMode ? '#6366f1' : '#6366f1',
        fillOpacity: isDarkMode ? 0.12 : 0.08,
        strokeWidth: 0,
        fixed: true,
        highlight: false,
        vertices: { visible: false, fixed: true },
        hasInnerPoints: false,
        layer: 1
      });
      board.create('text', [degree, maxLog + 0.5, `n=${degree}`], {
        fontSize: 12,
        color: isDarkMode ? '#a5b4fc' : '#6366f1',
        fixed: true,
        anchorX: 'middle',
        fontWeight: 'bold',
        layer: 1
      });
    }

    // ============================================
    // LAYER 2: Data lines and points
    // ============================================

    for (const methodId of enabledMethods) {
      const method = QUADRATURE_METHODS[methodId];
      const points = convergenceData.data[methodId];
      if (!points) continue;

      const validPoints = points
        .filter(p => p.error > 0)
        .map(p => [p.n, Math.log10(p.error)]);

      if (validPoints.length === 0) continue;

      // Draw line through points
      if (validPoints.length >= 2) {
        const xCoords = validPoints.map(p => p[0]);
        const yCoords = validPoints.map(p => p[1]);

        board.create('curve', [xCoords, yCoords], {
          strokeColor: method.color,
          strokeWidth: 2.5,
          highlight: false,
          layer: 2
        });
      }

      // Draw points
      for (const [x, y] of validPoints) {
        board.create('point', [x, y], {
          size: 3,
          color: method.color,
          name: '',
          fixed: true,
          highlight: false,
          layer: 2
        });
      }

      // Points where error is 0 (exact) - draw at bottom with special marker
      const exactPoints = points.filter(p => p.error === 0);
      for (const p of exactPoints) {
        board.create('point', [p.n, minLog + 0.3], {
          size: 4,
          color: method.color,
          name: '',
          fixed: true,
          highlight: false,
          face: 'diamond',
          layer: 2
        });
      }
    }

    // ============================================
    // LAYER 3: Labels (drawn last, on top of everything)
    // ============================================

    if (degree >= 1 && degree <= 10) {
      const labels = [];

      for (const methodId of enabledMethods) {
        const method = QUADRATURE_METHODS[methodId];
        const points = convergenceData.data[methodId];
        if (!points) continue;
        const pt = points.find(p => p.n === degree);
        if (!pt) continue;

        if (pt.error > 0) {
          const logErr = Math.log10(pt.error);
          labels.push({
            methodId,
            method,
            logErr,
            error: pt.error,
            isExact: false
          });
        } else {
          // Exact — highlight diamond (layer 3)
          board.create('point', [degree, minLog + 0.3], {
            size: 6,
            color: method.color,
            name: '',
            fixed: true,
            highlight: false,
            face: 'diamond',
            strokeColor: isDarkMode ? '#e5e7eb' : '#ffffff',
            strokeWidth: 2,
            layer: 3
          });
        }
      }

      // Sort labels by error (highest error = highest on chart = first)
      labels.sort((a, b) => b.logErr - a.logErr);

      // Calculate label positions avoiding overlap
      const labelHeight = 1.0;
      const labelSpacing = 0.2;
      const graphTopEdge = maxLog - 0.5;
      const graphBottomEdge = minLog + 1;

      const placedLabels = [];

      for (const label of labels) {
        // Calculate base position - prefer to the right of the point
        let labelX = degree + 0.35;
        let labelY = label.logErr;

        // Check if label would go off the right edge
        if (degree >= 9) {
          labelX = degree - 0.35;
        }

        // Adjust Y to avoid overlap with previously placed labels
        for (const placed of placedLabels) {
          const yOverlap = Math.abs(labelY - placed.y) < (labelHeight + labelSpacing);
          const xOverlap = Math.abs(labelX - placed.x) < 1.2;
          if (yOverlap && xOverlap) {
            labelY = placed.y - labelHeight - labelSpacing;
          }
        }

        // Clamp to graph bounds
        labelY = Math.max(graphBottomEdge, Math.min(graphTopEdge, labelY));

        placedLabels.push({ x: labelX, y: labelY });

        // Draw larger highlighted point (layer 3)
        board.create('point', [degree, label.logErr], {
          size: 5,
          color: label.method.color,
          name: '',
          fixed: true,
          highlight: false,
          strokeColor: isDarkMode ? '#e5e7eb' : '#ffffff',
          strokeWidth: 2,
          layer: 3
        });

        // Format the error label text
        const errorText = label.error.toExponential(1);

        // Calculate box dimensions dynamically based on text length
        // Each character is approximately 0.13 units wide, plus padding
        const charWidth = 0.13;
        const basePadding = 0.2;
        const boxWidth = (errorText.length * charWidth) + basePadding;
        const boxHeight = 0.7;
        const boxPadX = 0.08;
        const anchorX = degree >= 9 ? 'right' : 'left';

        let boxLeft, boxRight;
        if (degree >= 9) {
          boxRight = labelX + boxPadX;
          boxLeft = boxRight - boxWidth;
        } else {
          boxLeft = labelX - boxPadX;
          boxRight = boxLeft + boxWidth;
        }

        // Draw solid background box (layer 8 - above everything)
        board.create('polygon', [
          [boxLeft, labelY + boxHeight/2],
          [boxRight, labelY + boxHeight/2],
          [boxRight, labelY - boxHeight/2],
          [boxLeft, labelY - boxHeight/2]
        ], {
          fillColor: label.method.color,
          fillOpacity: 1,
          strokeColor: isDarkMode ? '#e5e7eb' : '#ffffff',
          strokeWidth: 1.5,
          fixed: true,
          highlight: false,
          vertices: { visible: false, fixed: true },
          hasInnerPoints: false,
          layer: 8
        });

        // Draw error label with white text (layer 9 - topmost)
        board.create('text', [labelX, labelY, errorText], {
          fontSize: 11,
          color: '#ffffff',
          fixed: true,
          anchorX: anchorX,
          fontWeight: 'bold',
          cssStyle: 'font-weight: 700; text-shadow: 0 0 2px rgba(0,0,0,0.3);',
          layer: 9
        });
      }
    }

    return () => {
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [convergenceData, enabledMethods, isDarkMode, degree]);

  if (!convergenceData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        Enter a valid function to see convergence data
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="jxgbox w-full"
      style={{ aspectRatio: '1/1', minHeight: '360px' }}
    />
  );
}

export default ConvergenceChart;
