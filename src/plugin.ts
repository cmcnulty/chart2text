import { Chart, Plugin } from 'chart.js';
import { Chart2TextOptions } from './types';
import { describeLineChart } from './descriptors/line';
import { describeBarChart } from './descriptors/bar';
import { englishTemplates } from './templates/en';

/**
 * Per-chart state. The canvas is captured at init because Chart.js sets
 * `chart.canvas` to null before calling afterDestroy. The `owns*` flags record
 * whether this plugin set the canvas's aria-label/role (rather than the page
 * author or another plugin), so it never overwrites or removes theirs.
 */
interface ChartState {
  canvas: HTMLCanvasElement;
  ownsLabel?: boolean;
  ownsRole?: boolean;
  descriptionEl?: HTMLElement;
  ownsDescription?: boolean;
}

const chartStates = new WeakMap<Chart, ChartState>();

function getState(chart: Chart): ChartState {
  let state = chartStates.get(chart);
  if (!state) {
    state = { canvas: chart.canvas };
    chartStates.set(chart, state);
  }
  return state;
}

/**
 * The element the description is written into: the one provided in options, or a visually hidden div the
 * plugin creates after the canvas. Not focusable: it is reached through the canvas's aria-describedby, and a
 * tab stop on non-interactive text would be an extra, confusing stop.
 */
function getDescriptionElement(state: ChartState, options: Chart2TextOptions): HTMLElement {
  const provided = options.descriptionElement;
  if (provided) {
    if (state.descriptionEl && state.ownsDescription) {
      state.descriptionEl.remove();
    }
    if (!provided.id) {
      provided.id = `${state.canvas.id}-description`;
    }
    state.descriptionEl = provided;
    state.ownsDescription = false;
    return provided;
  }

  if (!state.descriptionEl || !state.ownsDescription) {
    const descriptionId = `${state.canvas.id}-description`;
    let created = document.getElementById(descriptionId);
    if (!created) {
      created = document.createElement('div');
      created.id = descriptionId;
      created.classList.add('visually-hidden');
      state.canvas.parentNode?.insertBefore(created, state.canvas.nextSibling);
    }
    state.descriptionEl = created;
    state.ownsDescription = true;
  }
  return state.descriptionEl;
}

/**
 * Join list items with the listPair/listMany templates ("A and B", "A, B, and C"), so the conjunction and
 * punctuation can be translated
 */
function formatList(items: string[], options: Chart2TextOptions): string {
  const general = options.templates?.general;
  const english = englishTemplates.general;
  if (items.length <= 1) {
    return items[0] ?? '';
  }
  if (items.length === 2) {
    return firstTemplate(general?.listPair, firstTemplate(english?.listPair, '{first} and {second}'))
      .replace(/{first}/g, items[0])
      .replace(/{second}/g, items[1]);
  }
  return firstTemplate(general?.listMany, firstTemplate(english?.listMany, '{rest}, and {last}'))
    .replace(/{rest}/g, items.slice(0, -1).join(', '))
    .replace(/{last}/g, items[items.length - 1]);
}

/**
 * For combined stacks, the sentence naming the parts in the total and any hidden ones. Opt-in through the
 * stackIncludes template. Parts that are zero everywhere aren't named.
 */
function describeStackParts(chart: Chart, options: Chart2TextOptions): string {
  const general = options.templates?.general;
  const includesTemplate = firstTemplate(general?.stackIncludes, '');
  if (!includesTemplate) {
    return '';
  }

  const shown: string[] = [];
  const hidden: string[] = [];
  chart.data.datasets.forEach((dataset, i) => {
    const hasValues = (dataset.data as unknown[]).some(value => typeof value === 'number' && value !== 0);
    if (!hasValues) {
      return;
    }
    const label = dataset.label || `${i + 1}`;
    (chart.isDatasetVisible(i) ? shown : hidden).push(label);
  });

  const sentences: string[] = [];
  if (shown.length > 0) {
    sentences.push(includesTemplate.replace(/{datasets}/g, formatList(shown, options)));
  }
  if (hidden.length > 0) {
    const hiddenTemplate = hidden.length === 1
      ? firstTemplate(general?.stackHiddenOne, '')
      : firstTemplate(general?.stackHiddenMany, '');
    if (hiddenTemplate) {
      sentences.push(hiddenTemplate.replace(/{datasets}/g, formatList(hidden, options)));
    }
  }
  return sentences.join(' ');
}

function firstTemplate(template: string | string[] | undefined, fallback: string): string {
  if (typeof template === 'string') return template;
  return template?.[0] || fallback;
}

/**
 * chart2text - A Chart.js plugin for generating accessible text descriptions
 *
 * Automatically generates natural language descriptions of charts for screen readers.
 * Supports line, bar, and pie charts with intelligent trend analysis.
 */
// Typed as a plain `Plugin` (any chart type, any options), exactly the type Chart.js's `plugins` arrays expect.
// A narrower type like Plugin<'line' | 'bar' | 'pie', Chart2TextOptions> forces TypeScript to compare generic
// Chart.js types, and whether it accepts that depends on the order it checks files in (fresh builds pass,
// incremental rebuilds fail). The `chart2text` plugin options stay typed through the module augmentation in types.ts.
export const chart2text: Plugin = {
  id: 'chart2text',

  /**
   * Initialize the plugin before chart is created
   */
  beforeInit(chart: Chart, args: any, options: Chart2TextOptions) {
    const { canvas } = getState(chart);

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

    const state = getState(chart);
    const canvas = state.canvas;
    const descriptionEl = getDescriptionElement(state, options);
    canvas.setAttribute('aria-describedby', descriptionEl.id);

    // Decide ownership on the first update, after every plugin's afterInit
    // has run, so a role/label set by the author or another plugin (e.g.
    // role="application" for keyboard-navigable charts) is respected.
    if (state.ownsLabel === undefined) {
      state.ownsLabel = !canvas.hasAttribute('aria-label');
      state.ownsRole = !canvas.hasAttribute('role');
    }

    const generalTemplatesForLabel = options.templates?.general || englishTemplates.general;

    // Generate a brief summary for aria-label (keep this short)
    if (state.ownsLabel) {
      const chartTitle = chart.options.plugins?.title?.text
        || firstTemplate(generalTemplatesForLabel?.untitledChart, firstTemplate(englishTemplates.general?.untitledChart, 'Chart'));
      const titleText = typeof chartTitle === 'string' ? chartTitle : chartTitle.join(' ');
      const labelTemplate = firstTemplate(
        generalTemplatesForLabel?.chartLabel,
        firstTemplate(englishTemplates.general?.chartLabel, '{title} with {count} data series.')
      );
      const briefSummary = labelTemplate
        .replace(/{title}/g, titleText)
        .replace(/{count}/g, chart.data.datasets.length.toString());
      canvas.setAttribute('aria-label', briefSummary);
    }
    if (state.ownsRole) {
      canvas.setAttribute('role', 'img');
    }

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
      const generalTemplates = options.templates?.general || englishTemplates.general;
      const datasetLabelTemplate = generalTemplates?.datasetLabel;
      const stackedLabel = typeof datasetLabelTemplate === 'string' ? datasetLabelTemplate : (datasetLabelTemplate?.[0] || 'Total');

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
      const stackParts = describeStackParts(chart, options);
      if (useMode === 'trend') {
        description = describeLineChart(labels, combinedData, options, stackedLabel, stackParts);
      } else {
        const typeForDescriptor = chartType === 'pie' ? 'pie' : 'bar';
        description = describeBarChart(labels, combinedData, options, stackedLabel, typeForDescriptor, stackParts);
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
          const formattedDatasets = formatList(datasetLabels, options);

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
        description = describeLineChart(xScale, yScale, options, datasetLabel);
      } else {
        // Use min/max categorical description
        // Pass chart type for pie chart specific handling
        const typeForDescriptor = chartType === 'pie' ? 'pie' : 'bar';
        description = describeBarChart(xScale, yScale, options, datasetLabel, typeForDescriptor);
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
    descriptionEl.textContent = descriptions.join(' ');
  },

  /**
   * Clean up when chart is destroyed
   */
  afterDestroy(chart: Chart, _args: any, _options: Chart2TextOptions) {
    // Chart.js nulls chart.canvas before afterDestroy, so use the captured one
    const state = chartStates.get(chart);
    const canvas = state?.canvas ?? chart.canvas;
    chartStates.delete(chart);
    if (!canvas) {
      return;
    }

    // Clean up - remove the description element if the plugin created it
    const descriptionEl = state?.descriptionEl ?? document.getElementById(`${canvas.id}-description`);
    if (descriptionEl && state?.ownsDescription !== false) {
      descriptionEl.parentNode?.removeChild(descriptionEl);
    }

    // Remove only the aria attributes this plugin set
    canvas.removeAttribute('aria-describedby');
    if (state?.ownsLabel) {
      canvas.removeAttribute('aria-label');
    }
    if (state?.ownsRole) {
      canvas.removeAttribute('role');
    }
  }
};
