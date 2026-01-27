/**
 * Quadrature Method Comparison Visualization
 *
 * Interactive tool for comparing numerical integration methods:
 * Gauss-Legendre, Equally Spaced, Chebyshev, and Random.
 */

import { useCallback } from 'react';
import { useMultiQuadrature } from './hooks/useMultiQuadrature';
import { Graph } from './components/Graph';
import { FunctionInput } from './components/FunctionInput';
import { DegreeSelector } from './components/DegreeSelector';
import { IntervalSliders } from './components/IntervalSliders';
import { ResultsPanel } from './components/ResultsPanel';
import { DarkModeToggle } from './components/DarkModeToggle';
import { AboutSection } from './components/AboutSection';

function App() {
  const {
    expression,
    degree,
    intervalA,
    intervalB,
    parsedFunction,
    enabledMethods,
    randomSeed,
    allResults,
    referenceValue,
    convergenceData,
    functionValidation,
    isValid,
    setExpression,
    setDegree,
    setIntervalA,
    setIntervalB,
    toggleMethod,
    setRandomSeed,
    reshuffleRandom
  } = useMultiQuadrature('sin(x)', 4, 0, Math.PI);

  const handleIntervalChange = useCallback((newA, newB) => {
    setIntervalA(newA);
    setIntervalB(newB);
  }, [setIntervalA, setIntervalB]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Quadrature Method Comparison
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Interactive numerical integration comparison
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-4">
            <FunctionInput
              value={expression}
              onChange={setExpression}
              isValid={parsedFunction.success}
              error={parsedFunction.error}
            />

            <DegreeSelector
              value={degree}
              onChange={setDegree}
            />

            <IntervalSliders
              valueA={intervalA}
              valueB={intervalB}
              onChangeA={setIntervalA}
              onChangeB={setIntervalB}
            />

            <AboutSection />
          </div>

          {/* Middle - Graph */}
          <div className="lg:col-span-3 flex flex-col">
            <Graph
              fn={parsedFunction.fn}
              intervalA={intervalA}
              intervalB={intervalB}
              allResults={allResults}
              enabledMethods={enabledMethods}
              onIntervalChange={handleIntervalChange}
              isValid={isValid}
              degree={degree}
              convergenceData={convergenceData}
              randomSeed={randomSeed}
              onRandomSeedChange={setRandomSeed}
              onReshuffle={reshuffleRandom}
              functionValidation={functionValidation}
            />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <ResultsPanel
              allResults={allResults}
              enabledMethods={enabledMethods}
              expression={expression}
              intervalA={intervalA}
              intervalB={intervalB}
              degree={degree}
              referenceValue={referenceValue}
              onToggle={toggleMethod}
              functionValidation={functionValidation}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 px-6 mt-8">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with React, JSXGraph, and KaTeX
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
