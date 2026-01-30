/**
 * Interactive Graph Component using JSXGraph
 *
 * Displays visualizations via dynamic tabs:
 * - "Original" tab: function with shaded integral area + draggable bounds
 * - One tab per enabled quadrature method: [-1,1] transformed view with nodes/rectangles
 * - "Convergence" tab: error vs n chart for all methods
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import JXG from 'jsxgraph';
import { QUADRATURE_METHODS } from '../utils/quadrature/index.js';
import { evaluateLegendre } from '../utils/quadrature/gaussLegendre.js';
import { ConvergenceChart } from './ConvergenceChart.jsx';

// Hook to detect dark mode
function useDarkMode() {
  const getInitialDarkMode = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('darkMode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  };

  const [isDark, setIsDark] = useState(getInitialDarkMode);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

export function Graph({
  fn,
  intervalA,
  intervalB,
  allResults,
  enabledMethods,
  onIntervalChange,
  isValid,
  degree,
  convergenceData,
  randomSeed,
  onRandomSeedChange,
  onReshuffle,
  functionValidation
}) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [activeTab, setActiveTab] = useState('original');
  const isDarkMode = useDarkMode();

  const onIntervalChangeRef = useRef(onIntervalChange);
  onIntervalChangeRef.current = onIntervalChange;

  const dragTimeoutRef = useRef(null);

  // Build tab list dynamically
  const tabs = useMemo(() => {
    const list = [{ id: 'original', label: 'Original Function' }];
    for (const methodId of enabledMethods) {
      const method = QUADRATURE_METHODS[methodId];
      list.push({ id: methodId, label: method.shortName });
    }
    list.push({ id: 'convergence', label: 'Convergence' });
    return list;
  }, [enabledMethods]);

  // Reset to 'original' tab if current tab is no longer available
  useEffect(() => {
    if (!tabs.find(t => t.id === activeTab)) {
      setActiveTab('original');
    }
  }, [tabs, activeTab]);

  const functionInvalid = functionValidation && !functionValidation.valid;

  // Bounding box calculations
  const calculateOriginalBounds = useCallback(() => {
    const padding = Math.max(1, (intervalB - intervalA) * 0.2);
    let xMin = intervalA - padding;
    let xMax = intervalB + padding;
    let yMin = -1;
    let yMax = 1;

    if (fn) {
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

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    if (xRange > yRange) {
      const diff = (xRange - yRange) / 2;
      yMin -= diff;
      yMax += diff;
    } else if (yRange > xRange) {
      const diff = (yRange - xRange) / 2;
      xMin -= diff;
      xMax += diff;
    }
    return [xMin, yMax, xMax, yMin];
  }, [fn, intervalA, intervalB]);

  const calculateStandardBounds = useCallback(() => {
    let xMin = -1.5;
    let xMax = 1.5;
    let yMin = -1;
    let yMax = 1;

    if (fn) {
      const jacobian = (intervalB - intervalA) / 2;
      for (let i = 0; i <= 100; i++) {
        const xi = -1 + 2 * i / 100;
        const x = jacobian * xi + (intervalA + intervalB) / 2;
        const y = fn(x) * jacobian; // Scale by Jacobian
        if (isFinite(y)) {
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }
      const yPadding = Math.max(0.5, (yMax - yMin) * 0.2);
      yMin -= yPadding;
      yMax += yPadding;
    }

    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    if (xRange > yRange) {
      const diff = (xRange - yRange) / 2;
      yMin -= diff;
      yMax += diff;
    } else if (yRange > xRange) {
      const diff = (yRange - xRange) / 2;
      xMin -= diff;
      xMax += diff;
    }
    return [xMin, yMax, xMax, yMin];
  }, [fn, intervalA, intervalB]);

  // Render JSXGraph board for non-convergence tabs
  useEffect(() => {
    if (!containerRef.current) return;
    if (activeTab === 'convergence') return; // convergence uses its own component

    // Clean up existing board
    if (boardRef.current) {
      JXG.JSXGraph.freeBoard(boardRef.current);
      boardRef.current = null;
    }

    const bounds = activeTab === 'original'
      ? calculateOriginalBounds()
      : calculateStandardBounds();

    const axisColor = isDarkMode ? '#9ca3af' : '#374151';
    const labelColor = isDarkMode ? '#e5e7eb' : '#374151';

    const board = JXG.JSXGraph.initBoard(containerRef.current, {
      boundingbox: bounds,
      axis: true,
      showNavigation: false,
      showCopyright: false,
      pan: { enabled: true, needTwoFingers: false, needShift: false },
      zoom: { wheel: true, needShift: false, min: 0.1, max: 10 },
      grid: true,
      defaultAxes: {
        x: {
          strokeColor: axisColor,
          ticks: { strokeColor: axisColor, label: { strokeColor: labelColor, fontSize: 14 } }
        },
        y: {
          strokeColor: axisColor,
          ticks: { strokeColor: axisColor, label: { strokeColor: labelColor, fontSize: 14 } }
        }
      }
    });

    boardRef.current = board;

    if (activeTab === 'original') {
      renderOriginalFunction(board);
    } else {
      renderMethodView(board, activeTab);
    }

    return () => {
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
      if (boardRef.current) {
        JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }
    };
  }, [activeTab, fn, isValid, intervalA, intervalB, degree, allResults, isDarkMode, enabledMethods, functionInvalid]);

  // --- Render functions ---

  const renderOriginalFunction = (board) => {
    if (!fn) return;

    board.create('functiongraph', [
      (x) => { const y = fn(x); return isFinite(y) ? y : NaN; }
    ], { strokeColor: '#6366f1', strokeWidth: 2, highlight: false });

    // Shaded area
    const samplePoints = [];
    const numSamples = 200;
    for (let i = 0; i <= numSamples; i++) {
      const x = intervalA + (intervalB - intervalA) * i / numSamples;
      const y = fn(x);
      if (isFinite(y)) samplePoints.push([x, y]);
    }
    samplePoints.push([intervalB, 0]);
    samplePoints.push([intervalA, 0]);

    if (samplePoints.length > 2) {
      board.create('polygon', samplePoints, {
        fillColor: '#6366f1', fillOpacity: 0.2, strokeColor: '#6366f1', strokeWidth: 0,
        highlight: false, fixed: true, vertices: { visible: false, fixed: true }, hasInnerPoints: false
      });
    }

    const labelBgColor = isDarkMode ? 'rgba(75, 85, 99, 0.95)' : 'rgba(255, 255, 255, 0.95)';

    const xAxis = board.defaultAxes.x;
    const sliderA = board.create('glider', [intervalA, 0, xAxis], {
      name: 'a', size: 8, color: '#3b82f6', strokeColor: '#1d4ed8', strokeWidth: 2,
      label: {
        offset: [0, -25], fontSize: 18, color: '#1d4ed8', fontWeight: 'bold',
        cssStyle: `font-weight: bold; background-color: ${labelBgColor}; padding: 2px 6px; border-radius: 4px; border: 1px solid #3b82f6;`
      }
    });
    const sliderB = board.create('glider', [intervalB, 0, xAxis], {
      name: 'b', size: 8, color: '#ef4444', strokeColor: '#dc2626', strokeWidth: 2,
      label: {
        offset: [0, -25], fontSize: 18, color: '#dc2626', fontWeight: 'bold',
        cssStyle: `font-weight: bold; background-color: ${labelBgColor}; padding: 2px 6px; border-radius: 4px; border: 1px solid #ef4444;`
      }
    });

    const scheduleUpdate = () => {
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
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

  const renderMethodView = (board, methodId) => {
    if (!fn || !isValid) return;

    const method = QUADRATURE_METHODS[methodId];
    const result = allResults?.[methodId];
    if (!method || !result) return;

    const methodColor = method.color;

    // Transform function to [-1, 1] with Jacobian scaling
    // When x ∈ [a,b] maps to ξ ∈ [-1,1], the integral becomes:
    // ∫f(x)dx = (b-a)/2 ∫f(x(ξ))dξ, so we scale y by (b-a)/2
    const jacobian = (intervalB - intervalA) / 2;
    const transformedFn = (xi) => {
      const x = jacobian * xi + (intervalA + intervalB) / 2;
      const y = fn(x);
      return isFinite(y) ? y * jacobian : NaN;
    };

    // Interval boundary lines
    board.create('line', [[-1, 0], [-1, 1]], {
      strokeColor: methodColor, strokeWidth: 3, fixed: true, highlight: false
    });
    board.create('line', [[1, 0], [1, 1]], {
      strokeColor: methodColor, strokeWidth: 3, fixed: true, highlight: false
    });

    board.create('text', [-1.05, 0.1, '-1'], {
      fontSize: 14, color: methodColor, fixed: true, anchorX: 'right'
    });
    board.create('text', [1.05, 0.1, '1'], {
      fontSize: 14, color: methodColor, fixed: true, anchorX: 'left'
    });

    // Function curve
    board.create('functiongraph', [transformedFn], {
      strokeColor: methodColor, strokeWidth: 2, highlight: false
    });

    // Quadrature visualization
    const details = result.details;
    if (details && details.length > 0) {
      const baseColor = methodColor;

      if (methodId === 'equallySpaced' && details.length > 1) {
        // Draw trapezoids between consecutive nodes (composite trapezoid rule)
        for (let i = 0; i < details.length - 1; i++) {
          const xi = details[i].originalNode;
          const xi1 = details[i + 1].originalNode;
          const yi = transformedFn(xi);
          const yi1 = transformedFn(xi1);

          if (!isFinite(yi) || !isFinite(yi1)) continue;

          const opacity = i % 2 === 0 ? 0.5 : 0.35;

          board.create('polygon', [
            [xi, 0], [xi1, 0], [xi1, yi1], [xi, yi]
          ], {
            fillColor: baseColor, fillOpacity: opacity,
            strokeColor: baseColor, strokeWidth: 1,
            fixed: true, highlight: false, vertices: { visible: false, fixed: true }, hasInnerPoints: false
          });
        }

        // Draw nodes and function points
        details.forEach((detail, idx) => {
          const xi = detail.originalNode;
          const y = transformedFn(xi);
          if (!isFinite(y)) return;

          board.create('point', [xi, 0], {
            size: 4, color: isDarkMode ? '#e5e7eb' : '#1f2937',
            name: '', fixed: true, highlight: true,
            showInfobox: false
          });
          board.create('point', [xi, y], {
            size: 3, color: baseColor,
            name: '', fixed: true, highlight: true,
            showInfobox: true,
            infoboxDigits: 4,
            label: {
              visible: false,
              offset: [10, 10],
              fontSize: 13,
              strokeColor: isDarkMode ? '#e5e7eb' : '#1f2937',
              useMathJax: false
            }
          });
        });
      } else {
        // Weighted rectangles for other methods
        let currentX = -1;

        details.forEach((detail, i) => {
          const xi = detail.originalNode;
          const wi = detail.originalWeight;
          const y = transformedFn(xi);

          if (!isFinite(y) || !isFinite(wi)) return;

          const leftX = currentX;
          const rightX = currentX + wi;

          const opacity = i % 2 === 0 ? 0.5 : 0.35;

          board.create('polygon', [
            [leftX, 0], [rightX, 0], [rightX, y], [leftX, y]
          ], {
            fillColor: baseColor, fillOpacity: opacity,
            strokeColor: baseColor, strokeWidth: 1,
            fixed: true, highlight: false, vertices: { visible: false, fixed: true }, hasInnerPoints: false
          });

          board.create('point', [xi, 0], {
            size: 4, color: isDarkMode ? '#e5e7eb' : '#1f2937',
            name: '', fixed: true, highlight: true,
            showInfobox: false
          });
          board.create('point', [xi, y], {
            size: 3, color: baseColor,
            name: '', fixed: true, highlight: true,
            showInfobox: true,
            infoboxDigits: 4,
            label: {
              visible: false,
              offset: [10, 10],
              fontSize: 13,
              strokeColor: isDarkMode ? '#e5e7eb' : '#1f2937',
              useMathJax: false
            }
          });

          currentX = rightX;
        });
      }
    }
  };

  // Tab description text
  const getTabDescription = () => {
    if (activeTab === 'original') {
      return (
        <>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>a (drag to adjust)</span>
          </span>
          <span className="inline-flex items-center gap-2 ml-4">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>b (drag to adjust)</span>
          </span>
          <span className="ml-4 text-gray-400 dark:text-gray-500">| Scroll to zoom, drag to pan</span>
        </>
      );
    }
    if (activeTab === 'convergence') {
      return (
        <span>Error vs number of quadrature points (log scale) for all enabled methods</span>
      );
    }
    // Method tab
    const method = QUADRATURE_METHODS[activeTab];
    if (method) {
      return (
        <>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
            <span>{method.name}</span>
          </span>
          <span className="ml-4 text-gray-400 dark:text-gray-500">
            | Transformed to [-1, 1] &mdash; {activeTab === 'equallySpaced'
              ? 'trapezoids show composite trapezoid rule'
              : 'rectangles show weighted contributions (widths = weights)'}
          </span>
        </>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 overflow-x-auto">
        {tabs.map((tab) => {
          const method = QUADRATURE_METHODS[tab.id];
          const isActive = activeTab === tab.id;
          const accentColor = method ? method.color : undefined;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-white dark:bg-gray-800 border-b-2'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              style={isActive ? {
                color: accentColor || (isDarkMode ? '#818cf8' : '#4f46e5'),
                borderBottomColor: accentColor || (isDarkMode ? '#818cf8' : '#4f46e5')
              } : undefined}
            >
              {method && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: method.color }}
                />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Graph container or convergence chart */}
      {activeTab === 'convergence' ? (
        functionInvalid ? (
          <div className="flex items-center justify-center" style={{ aspectRatio: '10/9', minHeight: '400px' }}>
            <div className="text-center px-8 py-6 max-w-md">
              <div className="text-amber-500 dark:text-amber-400 mb-3">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Cannot compute convergence</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{functionValidation?.message}</p>
            </div>
          </div>
        ) : (
          <ConvergenceChart
            convergenceData={convergenceData}
            enabledMethods={enabledMethods}
            isDarkMode={isDarkMode}
            degree={degree}
          />
        )
      ) : (
        <div className="relative">
          <div
            ref={containerRef}
            id="jxgbox"
            className="jxgbox w-full"
            style={{ aspectRatio: '10/9', minHeight: '400px' }}
          />
          {/* Warning overlay for invalid function on interval (method tabs only) */}
          {functionInvalid && activeTab !== 'original' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10">
              <div className="text-center px-8 py-6 max-w-md">
                <div className="text-amber-500 dark:text-amber-400 mb-3">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Cannot compute quadrature</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{functionValidation?.message}</p>
              </div>
            </div>
          )}
          {activeTab === 'random' && !functionInvalid && (
            <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-lg z-10 min-w-[160px]">
              <div className="flex items-center gap-2 mb-2">
                <label className="text-xs text-gray-500 dark:text-gray-400">Seed</label>
                <input
                  type="number"
                  step="1"
                  value={randomSeed}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) onRandomSeedChange(val);
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded text-xs font-mono text-center"
                />
              </div>
              <button
                onClick={onReshuffle}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reshuffle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Description bar */}
      <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
        {getTabDescription()}
      </div>
    </div>
  );
}

export default Graph;
