import { Chart, Plugin } from 'chart.js';
import { Chart2TextOptions } from './types';
import { describeLineChart } from './descriptors/line';
import { describeBarChart } from './descriptors/bar';
import { englishTemplates } from './templates/en';

/**
 * chart2text - A Chart.js plugin for generating accessible text descriptions
 *
 * Automatically generates natural language descriptions of charts for screen readers.
 * Supports line, bar, and pie charts with intelligent trend analysis.
 */
export const chart2text: Plugin<'line' | 'bar' | 'pie', Chart2TextOptions> = {
  id: 'chart2text',

  /**
   * Initialize the plugin before chart is created
   */
  beforeInit(chart: Chart, args: any, options: Chart2TextOptions) {
    const canvas = chart.canvas;

    // Generate a unique ID for the canvas if it doesn't have one
    if (!canvas.id) {
      canvas.id = `chart-${Math.random().toString(36).substring(2, 9)}`;
    }

    const descriptionId = `${canvas.id}-description`;

    // Set up the relationship between canvas and description div that will be created
    canvas.setAttribute('aria-describedby', descriptionId);
  },

  /**
   * Generate and update text description after chart is rendered
   */
  afterUpdate(chart: Chart, args: any, options: Chart2TextOptions) {
    // Check if plugin is disabled
    if (options.enabled === false) {
      return;
    }

    // Skip if no datasets
    if (chart.data.datasets.length === 0) {
      return;
    }

    const canvas = chart.canvas;
    const descriptionId = `${canvas.id}-description`;

    // Find existing description element or create a new one
    let descriptionEl = document.getElementById(descriptionId);
    if (!descriptionEl) {
      descriptionEl = document.createElement('div');
      descriptionEl.id = descriptionId;
      descriptionEl.classList.add('visually-hidden');
      descriptionEl.setAttribute('tabindex', '0'); // Make it focusable for keyboard users

      // Insert after canvas
      canvas?.parentNode?.insertBefore(descriptionEl, canvas.nextSibling);
    }

    // Generate a brief summary for aria-label (keep this short)
    const chartTitle = chart.options.plugins?.title?.text || 'Chart';
    const titleText = typeof chartTitle === 'string' ? chartTitle : chartTitle.join(' ');
    const briefSummary = `${titleText} with ${chart.data.datasets.length} data series.`;

    // Set brief summary on canvas
    canvas.setAttribute('aria-label', briefSummary);
    canvas.setAttribute('role', 'img');

    // Generate detailed descriptions for each dataset
    const descriptions: string[] = [];

    // Count only visible datasets
    const visibleDatasets = chart.data.datasets.filter((_, i) => chart.isDatasetVisible(i));
    const hasMultipleDatasets = visibleDatasets.length > 1;

    // Check if the chart is stacked
    const xScale = chart.options.scales?.x as any;
    const yScale = chart.options.scales?.y as any;
    const isStacked = xScale?.stacked || yScale?.stacked;
    const shouldCombineStacks = options.combineStacks === true && isStacked && hasMultipleDatasets;

    // If combining stacks, create a combined dataset with summed values
    if (shouldCombineStacks) {
      // Sum all dataset values at each label position
      const combinedData: number[] = [];
      const labels = chart.data.labels as any[];

      for (let i = 0; i < labels.length; i++) {
        let sum = 0;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          // Only include visible datasets
          if (chart.isDatasetVisible(datasetIndex)) {
            const value = dataset.data[i];
            if (typeof value === 'number') {
              sum += value;
            }
          }
        });
        combinedData.push(sum);
      }

      // Generate a single description for the combined data
      const chartType = (chart.config as any).type;
      const stackedLabel = options.datasetLabel || 'Total';

      const descriptorOptions: Chart2TextOptions = {
        ...options,
        datasetLabel: stackedLabel,
        locale: options.locale || 'en',
        useRounding: options.useRounding !== false,
        precision: options.precision || 2,
        variationStrategy: options.variationStrategy || 'random'
      };

      // Determine which descriptor to use
      const descriptorMode = options.descriptor || 'auto';
      let useMode: 'trend' | 'categorical';

      if (descriptorMode === 'auto') {
        // Auto mode: line charts use trend, bar/pie charts use categorical
        useMode = chartType === 'line' ? 'trend' : 'categorical';
      } else {
        useMode = descriptorMode;
      }

      // Generate description based on chosen mode
      let description = '';
      if (useMode === 'trend') {
        description = describeLineChart(labels, combinedData, descriptorOptions);
      } else {
        const typeForDescriptor = chartType === 'pie' ? 'pie' : 'bar';
        description = describeBarChart(labels, combinedData, descriptorOptions, typeForDescriptor);
      }

      if (description) {
        descriptions.push(description);
      }

      // Skip the normal multi-dataset processing
    } else {
      // Normal processing: describe each dataset separately
      const shouldIncludeMultiDatasetIntro = options.multiDatasetIntroduction !== false && hasMultipleDatasets;

      // Add multi-dataset introduction if enabled and multiple datasets exist
      if (shouldIncludeMultiDatasetIntro) {
      const generalTemplates = options.templates?.general || englishTemplates.general;
      const seriesTemplate = generalTemplates?.seriesLabel;
      const seriesLabelTemplate = typeof seriesTemplate === 'string' ? seriesTemplate : (seriesTemplate?.[0] || 'Series {number}');

      const datasetLabels = chart.data.datasets
        .map((ds, i) => {
          // Only include visible datasets
          if (!chart.isDatasetVisible(i)) return null;
          return ds.label || seriesLabelTemplate.replace(/{number}/g, (i + 1).toString());
        })
        .filter(label => label !== null) as string[];

      if (datasetLabels.length > 0) {
        const templates = options.templates?.multiDataset || englishTemplates.multiDataset;
        const introTemplate = templates?.introduction;

        if (introTemplate) {
          // Format the dataset list with commas and "and"
          let formattedDatasets: string;
          if (datasetLabels.length === 1) {
            formattedDatasets = datasetLabels[0];
          } else if (datasetLabels.length === 2) {
            formattedDatasets = `${datasetLabels[0]} and ${datasetLabels[1]}`;
          } else {
            const allButLast = datasetLabels.slice(0, -1).join(', ');
            const last = datasetLabels[datasetLabels.length - 1];
            formattedDatasets = `${allButLast}, and ${last}`;
          }

          // Use first variation if it's an array
          const template = typeof introTemplate === 'string' ? introTemplate : introTemplate[0];
          const introduction = template
            .replace(/{count}/g, datasetLabels.length.toString())
            .replace(/{datasets}/g, formattedDatasets);

          descriptions.push(introduction);
        }
      }
    }

    chart.data.datasets.forEach((dataset, i) => {
      if (!dataset.data || dataset.data.length === 0) {
        return;
      }

      // Skip hidden datasets
      if (!chart.isDatasetVisible(i)) {
        return;
      }

      const generalTemplates = options.templates?.general || englishTemplates.general;
      const seriesTemplate = generalTemplates?.seriesLabel;
      const seriesLabelTemplate = typeof seriesTemplate === 'string' ? seriesTemplate : (seriesTemplate?.[0] || 'Series {number}');
      const datasetLabel = dataset.label || seriesLabelTemplate.replace(/{number}/g, (i + 1).toString());

      // Prepare options for descriptor
      const descriptorOptions: Chart2TextOptions = {
        ...options,
        datasetLabel: datasetLabel,
        locale: options.locale || 'en',
        useRounding: options.useRounding !== false,
        precision: options.precision || 2,
        variationStrategy: options.variationStrategy || 'random'
      };

      // Determine which descriptor to use
      const chartType = (chart.config as any).type;
      const descriptorMode = options.descriptor || 'auto';

      let useMode: 'trend' | 'categorical';

      if (descriptorMode === 'auto') {
        // Auto mode: line charts use trend, bar/pie charts use categorical
        useMode = chartType === 'line' ? 'trend' : 'categorical';
      } else {
        useMode = descriptorMode;
      }

      // Generate description based on chosen mode
      let description = '';
      let xScale = chart.data.labels as any[];
      let yScale = dataset.data as any[];

      // For pie/doughnut charts, filter out hidden data points (slices)
      if (chartType === 'pie' || chartType === 'doughnut') {
        const visibleIndices: number[] = [];
        yScale.forEach((_, index) => {
          if (chart.getDataVisibility(index)) {
            visibleIndices.push(index);
          }
        });

        // Filter labels and data to only include visible slices
        xScale = visibleIndices.map(idx => xScale[idx]);
        yScale = visibleIndices.map(idx => yScale[idx]);
      }

      if (useMode === 'trend') {
        // Use piecewise regression for trend analysis
        description = describeLineChart(xScale, yScale, descriptorOptions);
      } else {
        // Use min/max categorical description
        // Pass chart type for pie chart specific handling
        const typeForDescriptor = chartType === 'pie' ? 'pie' : 'bar';
        description = describeBarChart(xScale, yScale, descriptorOptions, typeForDescriptor);
      }

      if (description) {
        // For multi-dataset charts, prefix with dataset label
        if (hasMultipleDatasets) {
          description = `${datasetLabel}: ${description}`;
        }
        descriptions.push(description);
      }
    });
    } // End of else block for non-combined stacks

    // Update the description element content
    descriptionEl.innerHTML = descriptions.join(' ');
  },

  /**
   * Clean up when chart is destroyed
   */
  afterDestroy(chart: Chart, _args: any, _options: Chart2TextOptions) {
    // Clean up - remove the description element when chart is destroyed
    const canvas = chart.canvas;
    const descriptionId = `${canvas.id}-description`;
    const descriptionEl = document.getElementById(descriptionId);

    if (descriptionEl) {
      descriptionEl.parentNode?.removeChild(descriptionEl);
    }

    // Remove aria attributes
    canvas.removeAttribute('aria-describedby');
    canvas.removeAttribute('aria-label');
    canvas.removeAttribute('role');
  }
};
