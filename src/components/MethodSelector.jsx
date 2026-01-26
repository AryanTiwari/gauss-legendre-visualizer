/**
 * Method Selector Component
 *
 * Checkbox list for toggling quadrature methods on/off.
 * Each method is shown with its color indicator and name.
 */

import { QUADRATURE_METHODS, METHOD_IDS } from '../utils/quadrature/index.js';

export function MethodSelector({ enabledMethods, onToggle }) {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Quadrature Methods
      </h2>

      <div className="space-y-2">
        {METHOD_IDS.map((id) => {
          const method = QUADRATURE_METHODS[id];
          const isEnabled = enabledMethods.includes(id);

          return (
            <label
              key={id}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                isEnabled
                  ? 'bg-gray-50 dark:bg-gray-700/50'
                  : 'opacity-50 hover:opacity-75'
              }`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => onToggle(id)}
                className="sr-only"
              />
              {/* Color dot */}
              <span
                className="w-3 h-3 rounded-full flex-shrink-0 border-2 transition-colors"
                style={{
                  backgroundColor: isEnabled ? method.color : 'transparent',
                  borderColor: method.color
                }}
              />
              {/* Method name */}
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {method.name}
              </span>
              {/* Checkmark */}
              {isEnabled && (
                <span className="ml-auto text-xs" style={{ color: method.color }}>
                  On
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default MethodSelector;
