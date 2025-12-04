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
     * Locale for number formatting and templates
     * @default 'en'
     */
    locale?: string;
    /**
     * Label for the dataset (e.g., "Retirement Income", "Sales")
     */
    datasetLabel?: string;
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
     * Whether to use "natural" rounding for readability
     * @default true
     */
    useRounding?: boolean;
    /**
     * Number of decimal places for non-rounded values
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
}
/**
 * Complete set of templates for generating descriptions
 */
export interface TemplateSet {
    introduction?: string | string[];
    firstSegment?: TrendTemplates;
    subsequentSegment?: TrendTemplates;
    disconnectedSegment?: TrendTemplates;
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
export type Chart2TextPlugin = Plugin<'line' | 'bar' | 'pie', Chart2TextOptions>;
/**
 * Declare module augmentation for Chart.js plugin options
 */
declare module 'chart.js' {
    interface PluginOptionsByType<TType> {
        chart2text?: Chart2TextOptions;
    }
}
//# sourceMappingURL=types.d.ts.map