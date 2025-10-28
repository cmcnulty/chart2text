# chart2text

> Transform Chart.js visualizations into natural language descriptions for screen readers

[![npm version](https://badge.fury.io/js/chart2text.svg)](https://www.npmjs.com/package/chart2text)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**chart2text** is a Chart.js plugin that automatically generates natural language descriptions of chart data, making visualizations accessible to users with screen readers and other assistive technologies.

## ✨ Features

- 🎯 **Intelligent Trend Analysis** - Uses piecewise linear regression to describe trends naturally
- 🔗 **Disconnected Segment Detection** - Identifies and describes gaps in data with appropriate language
- 📊 **Flexible Description Modes** - Trend analysis for sequential data, categorical for independent categories
- 📈 **Multiple Chart Types** - Supports line, bar, and pie charts (scatter coming soon)
- 🥧 **Smart Pie Chart Sorting** - Automatically orders pie slices from largest to smallest
- 🔄 **Smart Auto-Detection** - Automatically chooses the best description strategy per chart type
- 🌍 **Fully Localizable** - All strings tokenized in templates, no hardcoded English in logic
- ♿ **WCAG Compliant** - Proper ARIA attributes and screen reader support
- 🎨 **Customizable** - Full control over description templates and formatting
- 📦 **Lightweight** - Small bundle size with minimal dependencies
- 🔧 **TypeScript** - Full type definitions included

## 📦 Installation

```bash
npm install chart2text
```

or

```bash
yarn add chart2text
```

## 🚀 Quick Start

```javascript
import Chart from 'chart.js/auto';
import { chart2text } from 'chart2text';

// Register the plugin
Chart.register(chart2text);

// Create your chart as usual
const ctx = document.getElementById('myChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['2020', '2021', '2022', '2023'],
    datasets: [{
      label: 'Revenue',
      data: [50000, 65000, 72000, 85000]
    }]
  },
  options: {
    plugins: {
      chart2text: {
        enabled: true,
        xUnit: 'year',
        yUnit: 'dollars',
        yAxisCurrency: 'USD'
      }
    }
  }
});
```

This automatically generates a description like:

> "This chart shows Revenue based on year. Starting at $50,000 when year is 2020, it rises at a rate of approximately $11,667 per year, reaching $85,000 by year 2023."

**Note on Accuracy**: The plugin prioritizes honesty for accessibility:
- **All y-values**: Always use actual data points from your chart - never fitted or interpolated values
- **X-axis labels**: Always use your original labels (like "2020", "2021") rather than numeric indices
- **Trend analysis**: While piecewise regression identifies segments, all reported values match real data points

This ensures screen reader users are never told incorrect values, while still providing meaningful trend descriptions.

## 📖 Usage Examples

### Line Chart with Custom Labels

```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: [55, 60, 65, 70],
    datasets: [{
      label: 'Retirement Income',
      data: [2500, 3200, 4000, 4500]
    }]
  },
  options: {
    plugins: {
      chart2text: {
        datasetLabel: 'Monthly Retirement Income',
        xUnit: 'age',
        yUnit: 'dollars',
        yAxisCurrency: 'USD',
        useRounding: true
      }
    }
  }
});
```

### Bar Chart (Categorical)

```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Sales by Quarter',
      data: [45000, 52000, 48000, 61000]
    }]
  },
  options: {
    plugins: {
      chart2text: {
        datasetLabel: 'Quarterly Sales',
        yAxisCurrency: 'USD'
      }
    }
  }
});
```

Generates:

> "This bar chart shows Quarterly Sales. There are 4 categories. Values range from $45,000 to $61,000. The highest value is Q4 at $61,000. The lowest value is Q1 at $45,000."

### Bar Chart with Trend Analysis

For bar charts with sequential data (time series, ages, etc.), use `descriptor: 'trend'`:

```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [55, 60, 65, 70, 75],
    datasets: [{
      label: 'Retirement Balance',
      data: [150000, 225000, 320000, 385000, 420000]
    }]
  },
  options: {
    plugins: {
      chart2text: {
        descriptor: 'trend',  // Use trend analysis instead of categorical
        datasetLabel: 'Retirement Balance',
        xUnit: 'age',
        yUnit: 'dollars',
        yAxisCurrency: 'USD'
      }
    }
  }
});
```

Generates:

> "This chart shows Retirement Balance based on age. At age 55, it starts at $150,000 and increases by about $67,500 per age, until reaching $420,000 at age 75."

### Custom Templates

```javascript
new Chart(ctx, {
  type: 'line',
  data: { /* ... */ },
  options: {
    plugins: {
      chart2text: {
        templates: {
          introduction: 'The data shows {datasetLabel} over {xUnit}.',
          firstSegment: {
            increasing: 'Beginning at {startY}, it increases to {endY}.',
            decreasing: 'Beginning at {startY}, it decreases to {endY}.',
            flat: 'It stays constant at {startY}.'
          }
        }
      }
    }
  }
});
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the plugin |
| `descriptor` | `'auto'` \| `'trend'` \| `'categorical'` | `'auto'` | How to describe data (see below) |
| `multiDatasetIntroduction` | `boolean` | `true` | List all datasets before describing each one |
| `sortPieSlices` | `boolean` | `true` | Sort pie slices largest to smallest |
| `locale` | `string` | `'en'` | Locale for number formatting |
| `datasetLabel` | `string` | `'data'` | Label for the dataset |
| `xUnit` | `string` | `'units'` | Unit name for x-axis (e.g., 'years', 'months') |
| `yUnit` | `string` | `'units'` | Unit name for y-axis (e.g., 'dollars', 'people') |
| `xAxisCurrency` | `string` | `undefined` | Currency code for x-axis (e.g., 'USD', 'EUR') |
| `yAxisCurrency` | `string` | `undefined` | Currency code for y-axis |
| `useRounding` | `boolean` | `true` | Use natural rounding for readability |
| `precision` | `number` | `2` | Decimal places for non-rounded values |
| `variationStrategy` | `'random'` \| `'sequential'` | `'random'` | How to select template variations |
| `templates` | `TemplateSet` | Built-in | Custom template overrides |

### Understanding the `descriptor` Option

The `descriptor` option controls how chart2text analyzes and describes your data:

- **`'auto'`** (default) - Smart mode:
  - Line charts: Uses trend analysis with piecewise regression
  - Bar/Pie charts: Uses categorical description (min/max, list values)

- **`'trend'`** - Always use trend analysis:
  - Best for **sequential/continuous data** (years, ages, time series)
  - Uses piecewise regression to describe trends
  - Example: "Starting at $50,000 in 2020, it rises at approximately $11,667 per year..."

- **`'categorical'`** - Always use categorical description:
  - Best for **independent categories** (regions, products, departments)
  - Describes min/max values and lists items
  - Example: "The highest value is North Region at $85,000..."

### Multi-Dataset Charts

When your chart has multiple datasets, `multiDatasetIntroduction` (enabled by default) adds an introduction listing all datasets before describing each one:

```javascript
new Chart(ctx, {
  type: 'line',
  data: {
    labels: [2020, 2021, 2022, 2023],
    datasets: [
      { label: 'Revenue', data: [100, 120, 140, 160] },
      { label: 'Expenses', data: [80, 90, 95, 100] }
    ]
  },
  options: {
    plugins: {
      chart2text: {
        xUnit: 'year',
        yUnit: 'thousands'
      }
    }
  }
});
```

Generates:

> "This chart displays 2 data series: Revenue and Expenses. Revenue: This chart shows Revenue based on year. At year 2020, it starts at 100 and increases by about 20 per year, until reaching 160 at year 2023. Expenses: This chart shows Expenses based on year. At year 2020, it starts at 80 and increases by about 7 per year, until reaching 100 at year 2023."

Set `multiDatasetIntroduction: false` to disable this introduction and describe each dataset without the overview.

### Pie Charts

Pie charts use categorical descriptions and are automatically sorted from largest to smallest slice for better accessibility:

```javascript
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Marketing', 'Development', 'Sales', 'Operations'],
    datasets: [{
      label: 'Department Budget',
      data: [45000, 120000, 85000, 60000]
    }]
  },
  options: {
    plugins: {
      chart2text: {
        datasetLabel: 'Annual Department Budgets',
        yAxisCurrency: 'USD',
        sortPieSlices: true  // Default - sorts largest to smallest
      }
    }
  }
});
```

Generates (sorted by size):

> "This pie chart shows Annual Department Budgets. There are 4 categories. Values range from $45,000 to $120,000. The highest value is Development at $120,000. The lowest value is Marketing at $45,000. The values are: Development at $120,000, Sales at $85,000, Operations at $60,000, Marketing at $45,000."

Set `sortPieSlices: false` to preserve the original order from your data.

## 🎨 Template System

chart2text uses a comprehensive template system with **no hardcoded English strings**. All user-facing text can be customized or translated.

### Template Categories

**Trend Analysis Templates** (for line charts):
- `introduction` - Chart introduction
- `firstSegment` - First trend segment
- `subsequentSegment` - Connected middle segments
- `disconnectedSegment` - Segments with gaps from previous (e.g., "The data resumes at...")
- `finalSegment` - Final segment

**Categorical Templates** (for bar/pie charts):
- `chartIntroduction` - Chart type and dataset intro
- `categoryCount` - Number of categories
- `valueRange` - Min/max range
- `highestValue`, `lowestValue` - Extreme values
- `allValues`, `topValues`, `notableValues` - Value lists

**Multi-Dataset Templates**:
- `introduction` - Lists all datasets

**General Templates**:
- `seriesLabel` - Default label for unnamed datasets

### Template Variables

Variables available depend on the template type:

**Trend templates**: `{datasetLabel}`, `{xUnit}`, `{yUnit}`, `{startX}`, `{endX}`, `{startY}`, `{endY}`, `{changeRate}`

**Categorical templates**: `{chartType}`, `{datasetLabel}`, `{count}`, `{minValue}`, `{maxValue}`, `{label}`, `{value}`, `{values}`

**Multi-dataset templates**: `{count}`, `{datasets}`

**General templates**: `{number}`

## ♿ Accessibility

chart2text follows WCAG 2.1 Level AA guidelines:

- Adds proper ARIA attributes (`aria-describedby`, `aria-label`, `role="img"`)
- Creates hidden `<div>` elements with detailed descriptions
- Descriptions are focusable via keyboard (tabindex="0")
- Works with popular screen readers (NVDA, JAWS, VoiceOver)

### CSS for Hidden Descriptions

Add this CSS to visually hide descriptions while keeping them accessible:

```css
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

## 🧪 How It Works

### Descriptor Modes

The plugin uses two description strategies based on the `descriptor` option:

**Trend Analysis** (used for line charts by default, optional for bar charts)
1. Performs piecewise linear regression using the `segreg` library
2. Uses original chart labels in descriptions (e.g., dates like "1/15" instead of numeric indices)
3. **Always uses actual data values**: All y-values come from your chart data, never fitted/interpolated
4. Identifies trend segments (increasing, decreasing, flat)
5. Detects disconnected segments (gaps in data where trends don't connect)
6. Generates natural language using template variations
7. Avoids repetitive phrasing with smart template rotation

**Categorical Description** (used for bar/pie charts by default)
1. Analyzes min/max values and their labels
2. Describes range and notable data points
3. Lists all values if 5 or fewer categories
4. For pie charts: Sorts slices by size and shows top 3 for larger datasets
5. For bar charts: Highlights first, max, min, and last values

## 📝 Examples

Check out the `/demo` directory for interactive examples:

- Basic line chart with trend analysis
- Multi-dataset line chart
- Categorical bar chart
- Sequential bar chart with trend analysis (using `descriptor: 'trend'`)
- Pie chart with automatic sorting
- Monthly time series (31 days) showing weekday/weekend patterns
- Custom templates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Charles McNulty

## 🙏 Acknowledgments

- Uses [segreg](https://github.com/0x326/segreg) for piecewise linear regression
- Inspired by the need for better data visualization accessibility
- Built with [Chart.js](https://www.chartjs.org/)

## 📧 Support

- [GitHub Issues](https://github.com/cmcnulty/chart2text/issues)
- [npm package](https://www.npmjs.com/package/chart2text)

---

Made with ❤️ for accessibility
