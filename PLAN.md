# Gauss-Legendre Quadrature Visualization - Implementation Plan

## Overview
An interactive React website that visualizes Gauss-Legendre quadrature with adjustable parameters, function input with LaTeX support, and real-time graph interaction.

## Tech Stack
- **React 18** + **Vite** - Fast development and build
- **Tailwind CSS** - Styling
- **JSXGraph** - Interactive graph visualization
- **math.js** - Mathematical expression parsing and evaluation
- **KaTeX** - LaTeX rendering for mathematical notation
- **react-katex** - React wrapper for KaTeX

## Project Structure
```
gauss-legendre-viz/
├── src/
│   ├── components/
│   │   ├── Graph.jsx           # JSXGraph wrapper component
│   │   ├── FunctionInput.jsx   # LaTeX-enabled function input
│   │   ├── DegreeSelector.jsx  # Quadrature degree selector (1-10)
│   │   ├── IntervalSliders.jsx # Start/end point controls
│   │   └── ResultsPanel.jsx    # Integral value, nodes/weights table
│   ├── utils/
│   │   ├── gaussLegendre.js    # Quadrature nodes/weights computation
│   │   └── mathParser.js       # math.js wrapper for expression eval
│   ├── hooks/
│   │   └── useQuadrature.js    # Custom hook for quadrature computation
│   ├── App.jsx                 # Main application layout
│   ├── main.jsx                # Entry point
│   └── index.css               # Tailwind imports
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Implementation Steps

### Step 1: Project Setup
1. Initialize Vite + React project: `npm create vite@latest gauss-legendre-viz -- --template react`
2. Install dependencies:
   - `npm install tailwindcss postcss autoprefixer`
   - `npm install jsxgraph`
   - `npm install mathjs`
   - `npm install katex react-katex`
3. Configure Tailwind CSS
4. Set up basic App structure with responsive layout

### Step 2: Gauss-Legendre Core Algorithm (`utils/gaussLegendre.js`)
Implement the mathematical core:
- **`getNodesAndWeights(n)`** - Get pre-computed Legendre polynomial roots and weights for n points
- **`transformNode(xi, a, b)`** - Map node from [-1,1] to [a,b]
- **`transformWeight(wi, a, b)`** - Scale weight for interval [a,b]
- **`computeQuadrature(f, a, b, n)`** - Full quadrature computation with detailed breakdown
- **`estimateError(f, a, b, n)`** - Error estimation by comparing n vs n+1 results
- Pre-computed values for n=1-10 for accuracy and performance

### Step 3: Math Expression Parser (`utils/mathParser.js`)
- Wrap math.js for safe expression evaluation
- Support: `x`, `sin`, `cos`, `tan`, `exp`, `log`, `sqrt`, `abs`, `^`, `pi`, `e`
- **`parseFunction(expr)`** - Returns compiled function or error
- **`evaluateAt(compiledFn, x)`** - Evaluate function at point x
- **`toLatex(expr)`** - Convert expression to LaTeX notation
- Handle parsing errors gracefully with user-friendly messages
- Provide example functions for quick testing

### Step 4: Custom Hook (`hooks/useQuadrature.js`)
- Manage all quadrature state (expression, degree, interval)
- Memoized computation of parsed function and results
- Validation of inputs
- Error handling for computation failures

### Step 5: JSXGraph Component (`components/Graph.jsx`)
- Initialize JSXGraph board with responsive sizing
- Plot the user's function as a curve
- Draw interactive glider points for interval endpoints [a, b]
- Visualize quadrature as rectangles:
  - Each rectangle centered at transformed node xi
  - Width proportional to weight wi
  - Height = f(xi)
  - Fill with semi-transparent color to show overlap
- Mark quadrature nodes on x-axis with points
- Update in real-time as parameters change
- Support pan and zoom

### Step 6: Function Input with LaTeX (`components/FunctionInput.jsx`)
- Text input for mathematical expression
- Real-time LaTeX preview using KaTeX
- Show parsing status (valid/invalid)
- Example functions dropdown for quick testing
- Supported functions reference tooltip

### Step 7: Control Components
**DegreeSelector.jsx:**
- Slider for n = 1 to 10
- Show number of quadrature points
- Display polynomial exactness information

**IntervalSliders.jsx:**
- Numeric inputs for [a, b] with validation
- Quick preset buttons ([-1,1], [0,1], [0,π], etc.)
- Sync with interactive graph sliders

### Step 8: Results Panel (`components/ResultsPanel.jsx`)
- Display computed integral value with LaTeX formatting
- Table showing:
  - Node index i
  - Original node ξi (on [-1,1])
  - Transformed node xi (on [a,b])
  - Weight wi
  - f(xi) value
  - Contribution wi × f(xi)
- Total sum (integral approximation)
- Error estimation display
- Formula explanation

### Step 9: Main App Layout (`App.jsx`)
- Responsive grid layout (controls sidebar, main graph area)
- Integration of all components
- Educational information section
- Header and footer

## Key Technical Details

### Gauss-Legendre Nodes/Weights
For degree n, nodes are roots of Legendre polynomial Pn(x). Weights:
```
wi = 2 / [(1 - xi²) × (P'n(xi))²]
```

Pre-computed values for n=1-10 are stored for accuracy and performance.

### Interval Transformation
To integrate over [a, b] instead of [-1, 1]:
```
x = (b-a)/2 * ξ + (a+b)/2    (transform node)
w = (b-a)/2 * w_std          (scale weight)
```

### Rectangle Visualization Approach
Unlike Riemann sums with equal-width rectangles, Gauss-Legendre uses:
- Rectangles centered at each quadrature node
- Width visually represents the weight (scaled for display)
- This shows how different nodes contribute differently to the integral

### JSXGraph Integration
```javascript
// Create board
const board = JXG.JSXGraph.initBoard('graph', {
  boundingbox: [xMin, yMax, xMax, yMin],
  axis: true,
  showNavigation: false
});

// Plot function
board.create('functiongraph', [f]);

// Interactive endpoint gliders on x-axis
const sliderA = board.create('glider', [a, 0, board.defaultAxes.x], {...});
```

## Dependencies
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "jsxgraph": "^1.8.x",
    "mathjs": "^12.x",
    "katex": "^0.16.x",
    "react-katex": "^3.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x"
  }
}
```

## Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features Summary

1. **Function Input**: Enter any mathematical expression with full math support (trig, exp, log, etc.)
2. **LaTeX Preview**: Real-time rendering of the function in proper mathematical notation
3. **Degree Selection**: Choose quadrature degree from 1-10 points
4. **Interactive Graph**:
   - Visualize the function curve
   - See quadrature rectangles showing node contributions
   - Drag endpoints to adjust integration interval
   - Pan and zoom support
5. **Results Display**:
   - Computed integral value
   - Detailed table of nodes, weights, and contributions
   - Error estimation
   - Exactness indication for polynomials
6. **Educational Content**: Explanation of Gauss-Legendre quadrature method
