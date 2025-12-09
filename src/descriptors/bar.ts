import { Chart2TextOptions } from '../types';
import { formatNumber } from '../formatters/number';
import { englishTemplates } from '../templates/en';

/**
 * Fills in a template with the provided values
 */
function fillTemplate(template: string, values: Record<string, any>): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key] !== undefined ? values[key].toString() : match;
  });
}

/**
 * Selects a template from potentially multiple variations
 */
function selectTemplate(templateOption: string | string[] | undefined): string {
  if (!templateOption) return '';
  if (typeof templateOption === 'string') return templateOption;
  if (Array.isArray(templateOption) && templateOption.length > 0) {
    return templateOption[0]; // For categorical, just use first variation for now
  }
  return '';
}

/**
 * Generates natural language description for bar/pie charts
 */
export function describeBarChart(
  labels: any[],
  values: any[],
  options: Chart2TextOptions,
  datasetLabel?: string,
  chartType: 'bar' | 'pie' = 'bar'
): string {
  if (!labels || !values || labels.length === 0 || values.length === 0) {
    return 'No data available to describe.';
  }

  // Get dataset label from parameter, or fall back to template, or use 'data' as last resort
  const generalTemplates = options.templates?.general || englishTemplates.general;
  const templateLabel = typeof generalTemplates?.datasetLabel === 'string'
    ? generalTemplates.datasetLabel
    : (generalTemplates?.datasetLabel?.[0] || 'data');
  const datasetLabelToUse = datasetLabel || templateLabel;
  const yAxisCurrency = options.yAxisCurrency;

  // Use templates from options or fall back to English
  const templates = options.templates?.categorical || englishTemplates.categorical;
  if (!templates) {
    return 'No templates available for categorical description.';
  }

  // Create array of {label, value, index} for sorting
  let items = labels.map((label, index) => ({
    label,
    value: Number(values[index]) || 0,
    originalIndex: index
  }));

  // Sort pie chart slices if requested (default true for pie)
  if (chartType === 'pie' && options.sortPieSlices !== false) {
    items = items.sort((a, b) => b.value - a.value);
  }

  // Find min and max values (from original unsorted data)
  const numericValues = values.map(v => Number(v) || 0);
  const maxValue = Math.max(...numericValues);
  const minValue = Math.min(...numericValues);
  const maxIndex = numericValues.indexOf(maxValue);
  const minIndex = numericValues.indexOf(minValue);

  const formattedMax = formatNumber(maxValue, options, yAxisCurrency);
  const formattedMin = formatNumber(minValue, options, yAxisCurrency);

  // Build description using templates
  let result = '';

  // Get chart type label from templates
  const chartTypeLabel = chartType === 'pie'
    ? selectTemplate(generalTemplates?.pieChartLabel)
    : selectTemplate(generalTemplates?.barChartLabel);

  // Introduction
  const introTemplate = selectTemplate(templates.chartIntroduction);
  if (introTemplate) {
    result += fillTemplate(introTemplate, { chartType: chartTypeLabel, datasetLabel: datasetLabelToUse }) + ' ';
  }

  // Category count
  const countTemplate = selectTemplate(templates.categoryCount);
  if (countTemplate) {
    result += fillTemplate(countTemplate, { count: labels.length }) + ' ';
  }

  // Value range
  const rangeTemplate = selectTemplate(templates.valueRange);
  if (rangeTemplate) {
    result += fillTemplate(rangeTemplate, { minValue: formattedMin, maxValue: formattedMax }) + ' ';
  }

  // Highest value
  if (maxIndex >= 0) {
    const highestTemplate = selectTemplate(templates.highestValue);
    if (highestTemplate) {
      result += fillTemplate(highestTemplate, { label: labels[maxIndex], value: formattedMax }) + ' ';
    }
  }

  // Lowest value
  if (minIndex >= 0 && minIndex !== maxIndex) {
    const lowestTemplate = selectTemplate(templates.lowestValue);
    if (lowestTemplate) {
      result += fillTemplate(lowestTemplate, { label: labels[minIndex], value: formattedMin }) + ' ';
    }
  }

  // List all values if there aren't too many (5 or fewer)
  if (items.length <= 5) {
    const valuePairs = items.map((item) => {
      const formatted = formatNumber(item.value, options, yAxisCurrency);
      return `${item.label} at ${formatted}`;
    });
    const allValuesTemplate = selectTemplate(templates.allValues);
    if (allValuesTemplate) {
      result += fillTemplate(allValuesTemplate, { values: valuePairs.join(', ') });
    }
  } else {
    // For larger datasets, list notable values
    // For sorted pie charts, show top 3
    // For unsorted or bar charts, show first, max, min, last
    if (chartType === 'pie' && options.sortPieSlices !== false) {
      const topItems = items.slice(0, 3);
      const topPairs = topItems.map((item) => {
        const formatted = formatNumber(item.value, options, yAxisCurrency);
        return `${item.label} at ${formatted}`;
      });
      const topValuesTemplate = selectTemplate(templates.topValues);
      if (topValuesTemplate) {
        result += fillTemplate(topValuesTemplate, { values: topPairs.join(', ') });
      }
    } else {
      // Show first, max, min, and last from original order
      const notableIndices = [0, maxIndex, minIndex, labels.length - 1];
      const uniqueIndices = Array.from(new Set(notableIndices)).sort((a, b) => a - b);

      const notablePairs = uniqueIndices.map(i => {
        const formatted = formatNumber(numericValues[i], options, yAxisCurrency);
        return `${labels[i]} at ${formatted}`;
      });

      const notableValuesTemplate = selectTemplate(templates.notableValues);
      if (notableValuesTemplate) {
        result += fillTemplate(notableValuesTemplate, { values: notablePairs.join(', ') });
      }
    }
  }

  return result.trim();
}
