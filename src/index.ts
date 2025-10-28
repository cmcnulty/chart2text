/**
 * chart2text - Chart.js plugin for accessible text descriptions
 *
 * Automatically generates natural language descriptions of chart data
 * for screen readers and other assistive technologies.
 *
 * @packageDocumentation
 */

export { chart2text } from './plugin';
export { Chart2TextOptions, TemplateSet, TrendTemplates, Chart2TextPlugin } from './types';
export { describeLineChart } from './descriptors/line';
export { describeBarChart } from './descriptors/bar';
export { formatNumber } from './formatters/number';
export { englishTemplates } from './templates/en';

// Default export for convenience
export { chart2text as default } from './plugin';
