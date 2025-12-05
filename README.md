# chart2text

> Chart.js plugin for generating natural language descriptions of chart data

[![npm version](https://badge.fury.io/js/chart2text.svg)](https://www.npmjs.com/package/chart2text)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Chart.js plugin that generates natural language descriptions for screen readers and assistive technologies.

**[View Demo](https://cmcnulty.github.io/chart2text)**

## Features

- Trend analysis using piecewise linear regression
- Detects disconnected segments in data
- Supports line, bar, and pie charts
- Automatic pie chart sorting (largest to smallest)
- Fully localizable template system
- WCAG compliant ARIA attributes
- TypeScript definitions included

## Installation

```bash
npm install chart2text
```

## Quick Start

```javascript
import Chart from 'chart.js/auto';
import { chart2text } from 'chart2text';

Chart.register(chart2text);

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

Generated description:

> "This chart shows Revenue based on year. Starting at $50,000 when year is 2020, it rises at a rate of approximately $11,667 per year, reaching $85,000 by year 2023."

## Usage Examples

### Line Chart

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

Generated description:

> "This bar chart shows Quarterly Sales. There are 4 categories. Values range from $45,000 to $61,000. The highest value is Q4 at $61,000. The lowest value is Q1 at $45,000."

### Bar Chart with Trend Analysis

For sequential data (time series, ages), use `descriptor: 'trend'`:

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
        descriptor: 'trend',
        datasetLabel: 'Retirement Balance',
        xUnit: 'age',
        yUnit: 'dollars',
        yAxisCurrency: 'USD'
      }
    }
  }
});
```

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

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | `boolean` | `true` | Enable/disable the plugin |
| `descriptor` | `'auto'` \| `'trend'` \| `'categorical'` | `'auto'` | Description strategy |
| `multiDatasetIntroduction` | `boolean` | `true` | List all datasets before describing each |
| `sortPieSlices` | `boolean` | `true` | Sort pie slices largest to smallest |
| `combineStacks` | `boolean` | `false` | Combine stacked datasets into totals |
| `locale` | `string` | `'en'` | Locale for number formatting |
| `datasetLabel` | `string` | `'data'` | Label for the dataset |
| `xUnit` | `string` | `'units'` | Unit name for x-axis |
| `yUnit` | `string` | `'units'` | Unit name for y-axis |
| `xAxisCurrency` | `string` | `undefined` | Currency code for x-axis |
| `yAxisCurrency` | `string` | `undefined` | Currency code for y-axis |
| `useRounding` | `boolean` | `true` | Use natural rounding for readability |
| `precision` | `number` | `2` | Decimal places when rounding disabled |
| `variationStrategy` | `'random'` \| `'sequential'` | `'random'` | Template variation selection |
| `templates` | `TemplateSet` | Built-in | Custom template overrides |

### Description Modes

The `descriptor` option controls analysis strategy:

- **`'auto'`** (default):
  - Line charts: trend analysis
  - Bar/Pie charts: categorical description

- **`'trend'`**: Use piecewise regression
  - Best for sequential data (years, ages, time series)
  - Describes trends and rates of change

- **`'categorical'`**: Describe min/max and list values
  - Best for independent categories (regions, products)

### Stacked Charts

For stacked bar/area charts, use `combineStacks: true` to describe totals instead of individual datasets:

```javascript
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      { label: 'Product A', data: [30, 40, 35, 50] },
      { label: 'Product B', data: [20, 25, 30, 35] }
    ]
  },
  options: {
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    },
    plugins: {
      chart2text: {
        combineStacks: true,
        datasetLabel: 'Total Quarterly Revenue'
      }
    }
  }
});
```

## Template System

All text is generated from templates. No English is hardcoded in the logic.

### Template Categories

**Trend Analysis** (line charts):
- `introduction` - Chart introduction
- `firstSegment` - First trend segment
- `subsequentSegment` - Middle segments
- `disconnectedSegment` - Segments with data gaps
- `finalSegment` - Final segment

**Categorical** (bar/pie charts):
- `chartIntroduction` - Chart type and dataset
- `categoryCount` - Number of categories
- `valueRange` - Min/max range
- `highestValue`, `lowestValue` - Extreme values
- `allValues`, `topValues`, `notableValues` - Value lists

**Multi-Dataset**:
- `introduction` - Lists all datasets

**General**:
- `seriesLabel` - Default label for unnamed datasets

### Template Variables

**Trend templates**: `{datasetLabel}`, `{xUnit}`, `{yUnit}`, `{startX}`, `{endX}`, `{startY}`, `{endY}`, `{changeRate}`

**Categorical templates**: `{chartType}`, `{datasetLabel}`, `{count}`, `{minValue}`, `{maxValue}`, `{label}`, `{value}`, `{values}`

**Multi-dataset templates**: `{count}`, `{datasets}`

## Accessibility

Follows WCAG 2.1 Level AA:

- Adds ARIA attributes: `aria-describedby`, `aria-label`, `role="img"`
- Creates hidden `<div>` with full description
- Keyboard focusable (tabindex="0")
- Compatible with NVDA, JAWS, VoiceOver

### Required CSS

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

## How It Works

**Trend Analysis** (line charts, optional for bar charts):
1. Performs piecewise linear regression via `segreg` library
2. Maps regression results back to original labels
3. Uses actual data values (never fitted/interpolated)
4. Identifies trend segments (increasing, decreasing, flat)
5. Detects disconnected segments

**Categorical** (bar/pie charts):
1. Finds min/max values
2. Lists all values if ≤5 categories
3. For pie: sorts by size, shows top 3 if >5 slices
4. For bar: highlights first, max, min, last values

## Examples

See **[live demo](https://cmcnulty.github.io/chart2text)** or `/demo` directory for:
- Basic line chart
- Multi-dataset line chart
- Categorical bar chart
- Sequential bar chart (trend mode)
- Pie chart with sorting
- Stacked bar chart
- Custom templates

## Contributing

Pull requests welcome.

## License

MIT © Charles McNulty

## Acknowledgments

- [segreg](https://github.com/0x326/segreg) - Piecewise linear regression
- [Chart.js](https://www.chartjs.org/)

## Support

- [GitHub Issues](https://github.com/cmcnulty/chart2text/issues)
- [npm package](https://www.npmjs.com/package/chart2text)
