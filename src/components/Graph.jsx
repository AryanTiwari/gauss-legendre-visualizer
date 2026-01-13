/**
 * Interactive Graph Component using JSXGraph
 *
 * Displays three different visualizations via tabs:
 * 1. Original function with shaded integral area
 * 2. Transformed function on [-1, 1] with quadrature rectangles
 * 3. Legendre polynomial with marked roots
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import JXG from 'jsxgraph';
import { getNodesAndWeights, evaluateLegendre } from '../utils/gaussLegendre';

const TAB_LABELS = [
  'Original Function',
  'Standard Interval [-1, 1]',
  'Legendre Polynomial'
];

export function Graph({
  fn,
  intervalA,
  intervalB,
  quadratureDetails,
  onIntervalChange,
  isValid,
  degree
}) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  // Store callback in ref so event handlers always have access to current version
  const onIntervalChangeRef = useRef(onIntervalChange);
  onIntervalChangeRef.current = onIntervalChange;

  // Debounce timer for drag updates
  const dragTimeoutRef = useRef(null);

  // Calculate bounding box for original function view
  const calculateOriginalBounds = useCallback(() => {
    const padding = Math.max(1, (intervalB - intervalA) * 0.2);
    const xMin = intervalA - padding;
    const xMax = intervalB + padding;

    let yMin = -1;
    let yMax = 1;

    if (fn && isValid) {
      const samples = 100;
      const step = (intervalB - intervalA) / samples;

      for (let i = 0; i <= samples; i++) {
        const x = intervalA + i * step;
        const y = fn(x);
        if (isFinite(y)) {
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }

      const yPadding = Math.max(0.5, (yMax - yMin) * 0.2);
      yMin -= yPadding;
      yMax += yPadding;
    }

    return [xMin, yMax, xMax, yMin];
  }, [fn, intervalA, intervalB, isValid]);

  // Calculate bounding box for standard interval [-1, 1]
  const calculateStandardBounds = useCallback(() => {
    const xMin = -1.3;
    const xMax = 1.3;

    let yMin = -1;
    let yMax = 1;

    if (fn && isValid) {
      // Sample transformed function on [-1, 1]
      for (let i = 0; i <= 100; i++) {
        const xi = -1 + 2 * i / 100;
        const x = ((intervalB - intervalA) / 2) * xi + (intervalA + intervalB) / 2;
        const y = fn(x);
        if (isFinite(y)) {
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }

      const yPadding = Math.max(0.5, (yMax - yMin) * 0.2);
      yMin -= yPadding;
      yMax += yPadding;
    }

    return [xMin, yMax, xMax, yMin];
  }, [fn, intervalA, intervalB, isValid]);

  // Calculate bounding box for Legendre polynomial
  const calculateLegendreBounds = useCallback(() => {
    return [-1.3, 1.5, 1.3, -1.5];
  }, []);

  // Initialize and update the board
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    // Calculate bounds based on active tab
    let bounds;
    if (activeTab === 0) {
      bounds = calculateOriginalBounds();
    } else if (activeTab === 1) {
      bounds = calculateStandardBounds();
    } else {
      bounds = calculateLegendreBounds();
    }

    // Initialize board with proper settings
    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: bounds,
      axis: true,
      showNavigation: false,
      showCopyright: false,
      pan: {
        enabled: true,
        needTwoFingers: false,
        needShift: false
      },
      zoom: {
        wheel: true,
        needShift: false,
        min: 0.1,
        max: 10
      },
      grid: true
    });

    boardRef.current = board;

    // Render based on active tab
    if (activeTab === 0) {
      renderOriginalFunction(board);
    } else if (activeTab === 1) {
      renderTransformedFunction(board);
    } else {
      renderLegendrePolynomial(board);
    }

    return () => {
      // Clear any pending drag timeout
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [activeTab, fn, isValid, intervalA, intervalB, degree, quadratureDetails]);

  // Render the original function view (Tab 1)
  const renderOriginalFunction = (board) => {
    if (!fn || !isValid) return;

    // Plot the function curve (extending beyond the interval for context)
    board.create('functiongraph', [
      (x) => {
        const y = fn(x);
        return isFinite(y) ? y : NaN;
      }
    ], {
      strokeColor: '#6366f1',
      strokeWidth: 2,
      highlight: false
    });

    // Create shaded area under the curve between a and b
    const samplePoints = [];
    const numSamples = 200;
    for (let i = 0; i <= numSamples; i++) {
      const x = intervalA + (intervalB - intervalA) * i / numSamples;
      const y = fn(x);
      if (isFinite(y)) {
        samplePoints.push([x, y]);
      }
    }
    // Close the polygon along the x-axis
    samplePoints.push([intervalB, 0]);
    samplePoints.push([intervalA, 0]);

    if (samplePoints.length > 2) {
      board.create('polygon', samplePoints, {
        fillColor: '#6366f1',
        fillOpacity: 0.2,
        strokeColor: '#6366f1',
        strokeWidth: 0,
        highlight: false,
        fixed: true,
        vertices: { visible: false, fixed: true },
        hasInnerPoints: false
      });
    }

    // Create draggable endpoint for 'a' - glider constrained to x-axis
    const xAxis = board.defaultAxes.x;
    const sliderA = board.create('glider', [intervalA, 0, xAxis], {
      name: 'a',
      size: 8,
      color: '#3b82f6',
      strokeColor: '#1d4ed8',
      strokeWidth: 2,
      label: {
        offset: [0, -25],
        fontSize: 18,
        color: '#1d4ed8',
        fontWeight: 'bold',
        cssStyle: 'font-weight: bold; text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;'
      }
    });

    // Create draggable endpoint for 'b' - glider constrained to x-axis
    const sliderB = board.create('glider', [intervalB, 0, xAxis], {
      name: 'b',
      size: 8,
      color: '#ef4444',
      strokeColor: '#dc2626',
      strokeWidth: 2,
      label: {
        offset: [0, -25],
        fontSize: 18,
        color: '#dc2626',
        fontWeight: 'bold',
        cssStyle: 'font-weight: bold; text-shadow: 1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white;'
      }
    });

    // Debounced update - triggers 150ms after last drag movement
    const scheduleUpdate = () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
      dragTimeoutRef.current = setTimeout(() => {
        const newA = sliderA.X();
        const newB = sliderB.X();
        if (newA < newB - 0.05 && onIntervalChangeRef.current) {
          onIntervalChangeRef.current(newA, newB);
        }
      }, 150);
    };

    sliderA.on('drag', scheduleUpdate);
    sliderB.on('drag', scheduleUpdate);
  };

  // Render the transformed function view (Tab 2)
  const renderTransformedFunction = (board) => {
    if (!fn || !isValid) return;

    // Transform function to [-1, 1]
    const transformedFn = (xi) => {
      const x = ((intervalB - intervalA) / 2) * xi + (intervalA + intervalB) / 2;
      const y = fn(x);
      return isFinite(y) ? y : NaN;
    };

    // Plot the transformed function curve
    board.create('functiongraph', [transformedFn], {
      strokeColor: '#6366f1',
      strokeWidth: 2,
      highlight: false
    });

    // Draw quadrature rectangles - adjacent, spanning exactly [-1, 1]
    if (quadratureDetails && quadratureDetails.length > 0) {
      const colors = [
        'rgba(59, 130, 246, 0.5)',   // blue
        'rgba(16, 185, 129, 0.5)',   // green
        'rgba(245, 158, 11, 0.5)',   // amber
        'rgba(239, 68, 68, 0.5)',    // red
        'rgba(139, 92, 246, 0.5)',   // purple
        'rgba(236, 72, 153, 0.5)',   // pink
        'rgba(6, 182, 212, 0.5)',    // cyan
        'rgba(132, 204, 22, 0.5)',   // lime
        'rgba(249, 115, 22, 0.5)',   // orange
        'rgba(99, 102, 241, 0.5)'    // indigo
      ];

      // Position rectangles adjacently starting from -1
      let currentX = -1;

      quadratureDetails.forEach((detail, i) => {
        const xi = detail.originalNode;        // Node on [-1, 1]
        const wi = detail.originalWeight;      // Original weight
        const y = transformedFn(xi);           // Function value at this node

        if (!isFinite(y) || !isFinite(wi)) return;

        // Rectangle from currentX to currentX + wi, height = y
        const leftX = currentX;
        const rightX = currentX + wi;

        const rect = board.create('polygon', [
          [leftX, 0],
          [rightX, 0],
          [rightX, y],
          [leftX, y]
        ], {
          fillColor: colors[i % colors.length],
          fillOpacity: 0.6,
          strokeColor: colors[i % colors.length].replace('0.5', '0.9'),
          strokeWidth: 1,
          highlight: false,
          vertices: { visible: false },
          hasInnerPoints: false
        });

        // Mark node on x-axis (at actual node position, not rectangle center)
        board.create('point', [xi, 0], {
          size: 4,
          color: '#1f2937',
          name: '',
          fixed: true,
          highlight: false
        });

        // Mark point on function at the node
        board.create('point', [xi, y], {
          size: 3,
          color: '#6366f1',
          name: '',
          fixed: true,
          highlight: false
        });

        currentX = rightX;
      });
    }

    // Draw vertical lines at -1 and 1 to mark the interval
    board.create('line', [[-1, -100], [-1, 100]], {
      strokeColor: '#9ca3af',
      strokeWidth: 1,
      dash: 2,
      fixed: true,
      highlight: false,
      straightFirst: false,
      straightLast: false
    });
    board.create('line', [[1, -100], [1, 100]], {
      strokeColor: '#9ca3af',
      strokeWidth: 1,
      dash: 2,
      fixed: true,
      highlight: false,
      straightFirst: false,
      straightLast: false
    });
  };

  // Render the Legendre polynomial view (Tab 3)
  const renderLegendrePolynomial = (board) => {
    if (!degree) return;

    // Draw shaded bounding box for [-1, 1] x [-1, 1] region
    board.create('polygon', [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1]
    ], {
      fillColor: '#e0e7ff',
      fillOpacity: 0.3,
      strokeColor: '#6366f1',
      strokeWidth: 2,
      fixed: true,
      highlight: false,
      vertices: { visible: false, fixed: true },
      hasInnerPoints: false
    });

    // Draw horizontal lines at y = -1, 0, 1
    board.create('segment', [[-1, 0], [1, 0]], {
      strokeColor: '#9ca3af',
      strokeWidth: 1,
      dash: 2,
      fixed: true,
      highlight: false
    });
    board.create('segment', [[-1, 1], [1, 1]], {
      strokeColor: '#6366f1',
      strokeWidth: 1,
      fixed: true,
      highlight: false
    });
    board.create('segment', [[-1, -1], [1, -1]], {
      strokeColor: '#6366f1',
      strokeWidth: 1,
      fixed: true,
      highlight: false
    });

    // Draw vertical lines at x = -1 and 1
    board.create('segment', [[-1, -1], [-1, 1]], {
      strokeColor: '#6366f1',
      strokeWidth: 1,
      fixed: true,
      highlight: false
    });
    board.create('segment', [[1, -1], [1, 1]], {
      strokeColor: '#6366f1',
      strokeWidth: 1,
      fixed: true,
      highlight: false
    });

    // Add corner labels for the bounding box
    board.create('text', [-1.08, -1, '-1'], { fontSize: 12, color: '#6366f1', fixed: true });
    board.create('text', [1.02, -1, '1'], { fontSize: 12, color: '#6366f1', fixed: true });
    board.create('text', [-1.15, 1, '1'], { fontSize: 12, color: '#6366f1', fixed: true });
    board.create('text', [-1.18, -1, '-1'], { fontSize: 12, color: '#6366f1', fixed: true });

    // Plot Legendre polynomial P_n(x)
    board.create('functiongraph', [
      (x) => evaluateLegendre(degree, x)
    ], {
      strokeColor: '#10b981',
      strokeWidth: 2.5,
      highlight: false
    });

    // Mark the roots (nodes) on x-axis
    const { nodes } = getNodesAndWeights(degree);
    nodes.forEach((xi, i) => {
      board.create('point', [xi, 0], {
        size: 5,
        color: '#ef4444',
        name: `ξ${i + 1}`,
        fixed: true,
        highlight: false,
        label: {
          offset: [0, -15],
          fontSize: 11,
          color: '#ef4444'
        }
      });
    });
  };

  // Get description text for current tab
  const getTabDescription = () => {
    if (activeTab === 0) {
      return (
        <>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>a (drag to adjust)</span>
          </span>
          <span className="inline-flex items-center gap-2 ml-4">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>b (drag to adjust)</span>
          </span>
          <span className="ml-4 text-gray-400">| Scroll to zoom, drag to pan</span>
        </>
      );
    } else if (activeTab === 1) {
      return (
        <>
          <span>Transformed to standard interval [-1, 1]</span>
          <span className="ml-4 text-gray-400">| Rectangles show weighted contributions (widths = weights)</span>
        </>
      );
    } else {
      return (
        <>
          <span>Legendre polynomial P<sub>{degree}</sub>(x)</span>
          <span className="ml-4 text-gray-400">| Red points mark the {degree} root{degree !== 1 ? 's' : ''} (quadrature nodes)</span>
        </>
      );
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b">
        {TAB_LABELS.map((label, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === index
                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Graph container */}
      <div
        ref={containerRef}
        id="jxgbox"
        className="jxgbox w-full"
        style={{ aspectRatio: '4/3', minHeight: '400px' }}
      />

      {/* Description bar */}
      <div className="px-4 py-2 bg-gray-50 border-t text-sm text-gray-600">
        {getTabDescription()}
      </div>
    </div>
  );
}

export default Graph;
