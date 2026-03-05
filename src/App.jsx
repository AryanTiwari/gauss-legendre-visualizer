/**
 * Quadrature Method Comparison Visualization
 *
 * Interactive tool for comparing numerical integration methods:
 * Gauss-Legendre, Equally Spaced, Chebyshev, and Random.
 */

import { useCallback } from "react";
import { useMultiQuadrature } from "./hooks/useMultiQuadrature";
import { Graph } from "./components/Graph";
import { FunctionInput } from "./components/FunctionInput";
import { DegreeSelector } from "./components/DegreeSelector";
import { IntervalSliders } from "./components/IntervalSliders";
import { ResultsPanel } from "./components/ResultsPanel";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { AboutSection } from "./components/AboutSection";

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
    reshuffleRandom,
  } = useMultiQuadrature("sin(x)", 4, 0, Math.PI);

  const handleIntervalChange = useCallback(
    (newA, newB) => {
      setIntervalA(newA);
      setIntervalB(newB);
    },
    [setIntervalA, setIntervalB],
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb] dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/80 dark:border-gray-700 bg-white/80 dark:bg-gray-900 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Quadrature Visualizer
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Interactive numerical integration visualization
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,2.3fr)_4fr_2.8fr] xl:grid-cols-[minmax(240px,2.3fr)_4.5fr_3fr] gap-4 lg:gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-4">
            <FunctionInput
              value={expression}
              onChange={setExpression}
              isValid={parsedFunction.success}
              error={parsedFunction.error}
            />

            <DegreeSelector value={degree} onChange={setDegree} />

            <IntervalSliders
              valueA={intervalA}
              valueB={intervalB}
              onChangeA={setIntervalA}
              onChangeB={setIntervalB}
            />
          </div>

          {/* Middle - Graph */}
          <div>
            <div className="flex flex-col">
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

            {/* About Section - Below main grid, aligned with graph column */}
            <div className="mt-3 grid grid-cols-1 gap-4 lg:gap-6">
              <div className="hidden lg:block" /> {/* Spacer for left column */}
              <div>
                <AboutSection />
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div>
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
    </div>
  );
}

export default App;
