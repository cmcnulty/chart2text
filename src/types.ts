import { Plugin } from 'chart.js';

/**
 * Configuration options for chart2text plugin
 */
export interface Chart2TextOptions {
  /**
   * Enable or disable the plugin
   * @default true
   */
  enabled?: boolean;

  /**
   * Element to write the description into, such as a paragraph inside a visible <details> disclosure.
   * When omitted, the plugin creates a visually hidden div after the canvas.
   * A provided element is never removed or hidden by the plugin; it gets an id if it has none, and the
   * canvas's aria-describedby points to it.
   */
  descriptionElement?: HTMLElement;

  /**
   * Locale for number formatting and templates
   * @default 'en'
   */
  locale?: string;

  /**
   * Unit for x-axis values (e.g., "years", "months", "age")
   * @default 'units'
   */
  xUnit?: string;

  /**
   * Unit for y-axis values (e.g., "dollars", "units", "people")
   * @default 'units'
   */
  yUnit?: string;

  /**
   * Currency code for x-axis values (e.g., "USD", "EUR")
   */
  xAxisCurrency?: string;

  /**
   * Currency code for y-axis values (e.g., "USD", "EUR")
   */
  yAxisCurrency?: string;

  /**
   * Whether to use "natural" rounding for readability. For currency, this drops minor units (cents) from
   * amounts of 1 or more ("$1,234" rather than "$1,234.56")
   * @default true
   */
  useRounding?: boolean;

  /**
   * Number of decimal places for non-rounded values (for currency, defaults to the currency's own, e.g. 2 for USD)
   * @default 2
   */
  precision?: number;

  /**
   * Template variation selection strategy
   * @default 'random'
   */
  variationStrategy?: 'random' | 'sequential';

  /**
   * Custom templates for description generation
   */
  templates?: TemplateSet;

  /**
   * Introduction text (or false to disable)
   */
  introduction?: string | false;

  /**
   * How to describe the data
   * - 'auto': Line charts use trend analysis, bar charts use categorical (default)
   * - 'trend': Always use piecewise regression and describe trends (good for sequential data)
   * - 'categorical': Always use min/max and list values (good for independent categories)
   * @default 'auto'
   */
  descriptor?: 'auto' | 'trend' | 'categorical';

  /**
   * For multi-dataset charts, include an introduction listing all datasets before describing each
   * @default true
   */
  multiDatasetIntroduction?: boolean;

  /**
   * For pie charts, sort slices from largest to smallest before describing
   * @default true
   */
  sortPieSlices?: boolean;

  /**
   * Categorical descriptions list every value when there are at most this many categories; with more, they
   * list only notable ones (top values for pie charts; first, highest, lowest, and last for bar charts)
   * @default 5
   */
  maxListedValues?: number;

  /**
   * For stacked charts (bar, area, etc.), combine all dataset values into totals
   * instead of describing each dataset separately
   * @default false
   */
  combineStacks?: boolean;
}

/**
 * Template variations for different trend types
 */
export interface TrendTemplates {
  increasing?: string | string[];
  decreasing?: string | string[];
  flat?: string | string[];
}

/**
 * Templates for categorical descriptions (bar/pie charts)
 */
export interface CategoricalTemplates {
  chartIntroduction?: string | string[];
  categoryCount?: string | string[];
  valueRange?: string | string[];
  highestValue?: string | string[];
  lowestValue?: string | string[];
  allValues?: string | string[];
  topValues?: string | string[];
  notableValues?: string | string[];
  /** One entry in a value list. Placeholders: {label}, {value} */
  valuePair?: string | string[];
}

/**
 * Templates for multi-dataset charts
 */
export interface MultiDatasetTemplates {
  introduction?: string | string[];
}

/**
 * General templates for common strings
 */
export interface GeneralTemplates {
  seriesLabel?: string | string[];
  barChartLabel?: string | string[];
  pieChartLabel?: string | string[];
  datasetLabel?: string | string[];
  /** Joins two list items. Placeholders: {first}, {second} (default "{first} and {second}") */
  listPair?: string | string[];
  /** Joins three or more list items. Placeholders: {rest} (comma-separated), {last} (default "{rest}, and {last}") */
  listMany?: string | string[];
  /**
   * With combineStacks, a sentence after the introduction naming the parts in the total, e.g. "It includes {datasets}."
   * Opt-in: omitted unless set. Parts that are zero everywhere aren't named.
   */
  stackIncludes?: string | string[];
  /** With stackIncludes, names one hidden part, e.g. "{datasets} is hidden." */
  stackHiddenOne?: string | string[];
  /** With stackIncludes, names several hidden parts, e.g. "{datasets} are hidden." */
  stackHiddenMany?: string | string[];
  /** Canvas aria-label. Placeholders: {title}, {count} (number of datasets) */
  chartLabel?: string | string[];
  /** Title used in chartLabel when the chart has no title */
  untitledChart?: string | string[];
}

/**
 * Complete set of templates for generating descriptions
 */
export interface TemplateSet {
  introduction?: string | string[];
  firstSegment?: TrendTemplates;
  subsequentSegment?: TrendTemplates;
  disconnectedSegment?: TrendTemplates; // For segments that don't connect to previous
  finalSegment?: TrendTemplates;
  categorical?: CategoricalTemplates;
  multiDataset?: MultiDatasetTemplates;
  general?: GeneralTemplates;
}

/**
 * Template placeholder values
 */
export interface TemplateValues {
  datasetLabel: string;
  xUnit: string;
  yUnit: string;
  startX: string;
  endX: string;
  startY: string;
  endY: string;
  changeRate: string;
  [key: string]: string | number;
}

/**
 * Plugin type export for Chart.js registration
 */
export type Chart2TextPlugin = Plugin;

/**
 * Declare module augmentation for Chart.js plugin options
 */
declare module 'chart.js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType> {
    chart2text?: Chart2TextOptions;
  }
}
