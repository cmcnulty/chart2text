'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var segreg = require('segreg');

/**
 * Formats a number according to the provided options
 *
 * @param num - Number to format
 * @param options - Formatting options
 * @param currency - Optional currency code (USD, EUR, etc.)
 * @returns Formatted string representation
 */
function formatNumber(num, options, currency) {
    if (currency) {
        // Format as currency
        const formatter = new Intl.NumberFormat(options.locale || 'en', {
            style: 'currency',
            currency: currency
        });
        return formatter.format(num);
    }
    if (options.useRounding !== false) {
        // Apply "natural" rounding for readability
        if (Math.abs(num) < 0.1)
            return num.toFixed(options.precision || 2);
        if (Math.abs(num) < 1)
            return num.toFixed(2);
        if (Math.abs(num) < 10)
            return num.toFixed(1);
        return Math.round(num).toString();
    }
    return num.toFixed(options.precision || 2);
}

/**
 * English language templates for chart descriptions
 */
const englishTemplates = {
    introduction: [
        'This chart shows {datasetLabel} based on {xUnit}.',
        'This visualization displays how {datasetLabel} changes with {xUnit}.',
        'The following graph represents {datasetLabel} as it relates to {xUnit}.'
    ],
    categorical: {
        chartIntroduction: 'This {chartType} shows {datasetLabel}.',
        categoryCount: 'There are {count} categories.',
        valueRange: 'Values range from {minValue} to {maxValue}.',
        highestValue: 'The highest value is {label} at {value}.',
        lowestValue: 'The lowest value is {label} at {value}.',
        allValues: 'The values are: {values}.',
        topValues: 'The top values are: {values}.',
        notableValues: 'Notable values include: {values}.'
    },
    multiDataset: {
        introduction: 'This chart displays {count} data series: {datasets}.'
    },
    general: {
        seriesLabel: 'Series {number}',
        barChartLabel: 'bar chart',
        pieChartLabel: 'pie chart'
    },
    firstSegment: {
        increasing: [
            'At {xUnit} {startX}, it starts at {startY} and increases by about {changeRate} per {xUnit}, until reaching {endY} at {xUnit} {endX}.',
            'Starting at {startY} when {xUnit} is {startX}, it rises at a rate of approximately {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
            'The {datasetLabel} begins at {startY} at {xUnit} {startX} and climbs on average by about {changeRate} per {xUnit} until it hits {endY} at {xUnit} {endX}.'
        ],
        decreasing: [
            'At {xUnit} {startX}, it starts at {startY} and decreases by about {changeRate} per {xUnit}, until reaching {endY} at {xUnit} {endX}.',
            'Starting at {startY} when {xUnit} is {startX}, it falls at a rate of approximately {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
            'The {datasetLabel} begins at {startY} at {xUnit} {startX} and drops on average by about {changeRate} per {xUnit} until it reaches {endY} at {xUnit} {endX}.'
        ],
        flat: [
            'It remains flat at {startY} from {xUnit} {startX} to {xUnit} {endX}.',
            'The {datasetLabel} holds steady at {startY} between {xUnit} {startX} and {xUnit} {endX}.',
            'From {xUnit} {startX} to {xUnit} {endX}, it maintains a constant value of {startY}.'
        ]
    },
    subsequentSegment: {
        increasing: [
            'It then increases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, reaching {endY}.',
            'After that, it rises at approximately {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, climbing to {endY}.',
            'Subsequently, it grows by roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, reaching {endY}.',
            'Following this, the value increases at a rate of {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, going up to {endY}.',
            'Next, it shows an upward trend of about {changeRate} per {xUnit} from {xUnit} {startX} through {xUnit} {endX}, ascending to {endY}.'
        ],
        decreasing: [
            'It then decreases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, falling to {endY}.',
            'After that, it declines at approximately {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, dropping to {endY}.',
            'Subsequently, it falls by roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, reaching {endY}.',
            'Following this, the value decreases at a rate of {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, going down to {endY}.',
            'Next, it shows a downward trend of about {changeRate} per {xUnit} from {xUnit} {startX} through {xUnit} {endX}, descending to {endY}.'
        ],
        flat: [
            'It then remains flat at {startY} from {xUnit} {startX} to {xUnit} {endX}.',
            'After that, it stabilizes at {startY} between {xUnit} {startX} and {xUnit} {endX}.',
            'Subsequently, it maintains a steady value of {startY} from {xUnit} {startX} to {xUnit} {endX}.',
            'Following this period, it stays constant at {startY} from {xUnit} {startX} through {xUnit} {endX}.',
            'Next, it plateaus at {startY} between {xUnit} {startX} and {xUnit} {endX}.'
        ]
    },
    disconnectedSegment: {
        increasing: [
            'The data resumes at {xUnit} {startX} with a value of {startY}, then increases by about {changeRate} per {xUnit} to {endY} at {xUnit} {endX}.',
            'Starting again at {startY} when {xUnit} is {startX}, it rises at approximately {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
            'A new trend begins at {xUnit} {startX} at {startY}, climbing by roughly {changeRate} per {xUnit} until reaching {endY} at {xUnit} {endX}.'
        ],
        decreasing: [
            'The data resumes at {xUnit} {startX} with a value of {startY}, then decreases by about {changeRate} per {xUnit} to {endY} at {xUnit} {endX}.',
            'Starting again at {startY} when {xUnit} is {startX}, it falls at approximately {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
            'A new trend begins at {xUnit} {startX} at {startY}, dropping by roughly {changeRate} per {xUnit} until reaching {endY} at {xUnit} {endX}.'
        ],
        flat: [
            'The data resumes at {xUnit} {startX}, holding steady at {startY} through {xUnit} {endX}.',
            'Starting again at {xUnit} {startX}, it maintains a constant value of {startY} until {xUnit} {endX}.',
            'A new trend begins at {xUnit} {startX}, plateauing at {startY} through {xUnit} {endX}.'
        ]
    },
    finalSegment: {
        increasing: [
            'Finally, it increases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, ultimately reaching {endY}.',
            'In the final segment, it rises at approximately {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, ending at {endY}.',
            'The last trend shows an increase of roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, concluding at {endY}.'
        ],
        decreasing: [
            'Finally, it decreases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, ultimately falling to {endY}.',
            'In the final segment, it declines at approximately {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, ending at {endY}.',
            'The last trend shows a decrease of roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, concluding at {endY}.'
        ],
        flat: [
            'Finally, it remains flat at {startY} from {xUnit} {startX} to {xUnit} {endX}.',
            'In the final segment, it stabilizes at {startY} between {xUnit} {startX} and {xUnit} {endX}.',
            'The last portion of the chart shows a constant value of {startY} from {xUnit} {startX} until {xUnit} {endX}.'
        ]
    }
};

/**
 * Classifies the slope type based on its value
 */
function getSlopeType(slope) {
    const THRESHOLD = 0.0001; // Threshold for considering a slope as flat
    if (Math.abs(slope) < THRESHOLD)
        return 'flat';
    return slope > 0 ? 'increasing' : 'decreasing';
}
/**
 * Fills in a template with the provided values
 */
function fillTemplate$1(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        return values[key] !== undefined ? values[key].toString() : match;
    });
}
/**
 * Selects a template from potentially multiple variations
 */
function selectTemplate$1(templateOption, strategy = 'random', usedTemplates = new Set()) {
    if (!templateOption)
        return '';
    // If it's a single string, return it
    if (typeof templateOption === 'string') {
        return templateOption;
    }
    // If it's an array, select based on strategy
    if (Array.isArray(templateOption) && templateOption.length > 0) {
        // Try to find unused templates first
        const unusedTemplates = templateOption.filter(t => !usedTemplates.has(t));
        // If all templates have been used, consider all templates again
        const candidateTemplates = unusedTemplates.length > 0 ? unusedTemplates : templateOption;
        let selectedTemplate;
        if (strategy === 'random') {
            // Random selection
            const randomIndex = Math.floor(Math.random() * candidateTemplates.length);
            selectedTemplate = candidateTemplates[randomIndex];
        }
        else {
            // Sequential selection - take the first unused one
            selectedTemplate = candidateTemplates[0];
        }
        // Add to used templates set
        usedTemplates.add(selectedTemplate);
        return selectedTemplate;
    }
    return '';
}
/**
 * Generates natural language description for line chart segments
 */
function describeLineChart(xScale, yScale, options) {
    if (!xScale || !yScale || xScale.length === 0 || yScale.length === 0) {
        return 'No data available to describe.';
    }
    // Convert labels to numeric values if needed for regression
    const numericXScale = xScale.map((x, i) => {
        const num = Number(x);
        return isNaN(num) ? i : num;
    });
    const numericYScale = yScale.map(y => Number(y) || 0);
    // Perform piecewise linear regression
    let piecewiseSegments;
    let segments;
    try {
        piecewiseSegments = segreg.piecewise(numericXScale, numericYScale);
        segments = segreg.adjustSegmentsToSnapIntersections(piecewiseSegments.segments);
    }
    catch (error) {
        console.error('Error in piecewise regression:', error);
        return 'Unable to analyze trend data.';
    }
    if (!segments || segments.length === 0) {
        return 'No trend segments identified.';
    }
    // Helper function to map numeric x-value back to original label
    const mapXToLabel = (numericX) => {
        // Find the closest index in numericXScale
        let closestIndex = 0;
        let minDiff = Math.abs(numericXScale[0] - numericX);
        for (let i = 1; i < numericXScale.length; i++) {
            const diff = Math.abs(numericXScale[i] - numericX);
            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        // Return the original label at that index
        return xScale[closestIndex];
    };
    // Use templates from options or fall back to English
    const templates = options.templates || englishTemplates;
    // Track used templates to avoid immediate repetition
    const usedTemplates = new Set();
    // Initialize result with introduction if provided
    let result = '';
    if (options.introduction !== false && templates.introduction) {
        const selectedIntro = selectTemplate$1(templates.introduction, options.variationStrategy, usedTemplates);
        if (selectedIntro) {
            result = fillTemplate$1(selectedIntro, {
                datasetLabel: options.datasetLabel || 'data',
                xUnit: options.xUnit || 'units',
                yUnit: options.yUnit || 'units'
            }) + ' ';
        }
    }
    // Generate description for each segment
    segments.forEach((segment, index) => {
        const isFirstSegment = index === 0;
        const isLastSegment = index === segments.length - 1;
        // Check if this segment is disconnected from the previous one
        let isDisconnected = false;
        if (index > 0) {
            const prevSegment = segments[index - 1];
            const prevEndX = prevSegment.end_t;
            const currentStartX = segment.start_t;
            // If there's a gap in x values, this is a disconnected segment
            // Use a small threshold to account for floating point precision
            const threshold = 0.001;
            isDisconnected = Math.abs(currentStartX - prevEndX) > threshold;
        }
        // Select appropriate template group based on segment position and connectivity
        let templateGroup;
        if (isFirstSegment) {
            templateGroup = templates.firstSegment;
        }
        else if (isDisconnected && templates.disconnectedSegment) {
            // Use disconnected templates when there's a gap from previous segment
            templateGroup = templates.disconnectedSegment;
        }
        else if (isLastSegment && templates.finalSegment) {
            templateGroup = templates.finalSegment;
        }
        else {
            templateGroup = templates.subsequentSegment;
        }
        if (!templateGroup)
            return;
        // Calculate key values
        const startX = segment.start_t;
        const endX = segment.end_t;
        // Always use actual data points - never report values that don't exist in the data
        // Find the closest actual data points to segment boundaries
        const startIndex = numericXScale.findIndex(x => Math.abs(x - startX) < 0.001);
        const endIndex = numericXScale.findIndex(x => Math.abs(x - endX) < 0.001);
        const startY = startIndex !== -1 && numericYScale[startIndex] !== undefined
            ? numericYScale[startIndex]
            : segment.coeffs.intercept + segment.coeffs.slope * startX; // Fallback to fitted if not found
        const endY = endIndex !== -1 && numericYScale[endIndex] !== undefined
            ? numericYScale[endIndex]
            : segment.coeffs.intercept + segment.coeffs.slope * endX; // Fallback to fitted if not found
        const slopeType = getSlopeType(segment.coeffs.slope);
        const yAxisCurrency = options.yAxisCurrency;
        // Map numeric x-values back to original labels
        const startXLabel = mapXToLabel(startX);
        const endXLabel = mapXToLabel(endX);
        // Format values for presentation
        const formattedValues = {
            startX: startXLabel,
            endX: endXLabel,
            startY: formatNumber(startY, options, yAxisCurrency),
            endY: formatNumber(endY, options, yAxisCurrency),
            changeRate: formatNumber(Math.abs(segment.coeffs.slope), options, yAxisCurrency),
            xUnit: options.xUnit || 'units',
            yUnit: options.yUnit || 'units',
            datasetLabel: options.datasetLabel || 'data'
        };
        // Select appropriate template based on segment position and slope type
        const templateOption = templateGroup[slopeType];
        if (templateOption) {
            const selectedTemplate = selectTemplate$1(templateOption, options.variationStrategy, usedTemplates);
            // Fill in the template and add to result
            if (selectedTemplate) {
                result += fillTemplate$1(selectedTemplate, formattedValues) + ' ';
            }
        }
    });
    return result.trim();
}

/**
 * Fills in a template with the provided values
 */
function fillTemplate(template, values) {
    return template.replace(/{(\w+)}/g, (match, key) => {
        return values[key] !== undefined ? values[key].toString() : match;
    });
}
/**
 * Selects a template from potentially multiple variations
 */
function selectTemplate(templateOption) {
    if (!templateOption)
        return '';
    if (typeof templateOption === 'string')
        return templateOption;
    if (Array.isArray(templateOption) && templateOption.length > 0) {
        return templateOption[0]; // For categorical, just use first variation for now
    }
    return '';
}
/**
 * Generates natural language description for bar/pie charts
 */
function describeBarChart(labels, values, options, chartType = 'bar') {
    if (!labels || !values || labels.length === 0 || values.length === 0) {
        return 'No data available to describe.';
    }
    const datasetLabel = options.datasetLabel || 'data';
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
    const generalTemplates = options.templates?.general || englishTemplates.general;
    const chartTypeLabel = chartType === 'pie'
        ? selectTemplate(generalTemplates?.pieChartLabel)
        : selectTemplate(generalTemplates?.barChartLabel);
    // Introduction
    const introTemplate = selectTemplate(templates.chartIntroduction);
    if (introTemplate) {
        result += fillTemplate(introTemplate, { chartType: chartTypeLabel, datasetLabel }) + ' ';
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
    }
    else {
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
        }
        else {
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

/**
 * chart2text - A Chart.js plugin for generating accessible text descriptions
 *
 * Automatically generates natural language descriptions of charts for screen readers.
 * Supports line, bar, and pie charts with intelligent trend analysis.
 */
const chart2text = {
    id: 'chart2text',
    /**
     * Initialize the plugin before chart is created
     */
    beforeInit(chart, args, options) {
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
    afterUpdate(chart, args, options) {
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
        const descriptions = [];
        const hasMultipleDatasets = chart.data.datasets.length > 1;
        const shouldIncludeMultiDatasetIntro = options.multiDatasetIntroduction !== false && hasMultipleDatasets;
        // Add multi-dataset introduction if enabled and multiple datasets exist
        if (shouldIncludeMultiDatasetIntro) {
            const generalTemplates = options.templates?.general || englishTemplates.general;
            const seriesTemplate = generalTemplates?.seriesLabel;
            const seriesLabelTemplate = typeof seriesTemplate === 'string' ? seriesTemplate : (seriesTemplate?.[0] || 'Series {number}');
            const datasetLabels = chart.data.datasets
                .map((ds, i) => ds.label || seriesLabelTemplate.replace(/{number}/g, (i + 1).toString()))
                .filter(label => label);
            if (datasetLabels.length > 0) {
                const templates = options.templates?.multiDataset || englishTemplates.multiDataset;
                const introTemplate = templates?.introduction;
                if (introTemplate) {
                    // Format the dataset list with commas and "and"
                    let formattedDatasets;
                    if (datasetLabels.length === 1) {
                        formattedDatasets = datasetLabels[0];
                    }
                    else if (datasetLabels.length === 2) {
                        formattedDatasets = `${datasetLabels[0]} and ${datasetLabels[1]}`;
                    }
                    else {
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
            const generalTemplates = options.templates?.general || englishTemplates.general;
            const seriesTemplate = generalTemplates?.seriesLabel;
            const seriesLabelTemplate = typeof seriesTemplate === 'string' ? seriesTemplate : (seriesTemplate?.[0] || 'Series {number}');
            const datasetLabel = dataset.label || seriesLabelTemplate.replace(/{number}/g, (i + 1).toString());
            // Prepare options for descriptor
            const descriptorOptions = {
                ...options,
                datasetLabel: datasetLabel,
                locale: options.locale || 'en',
                useRounding: options.useRounding !== false,
                precision: options.precision || 2,
                variationStrategy: options.variationStrategy || 'random'
            };
            // Determine which descriptor to use
            const chartType = chart.config.type;
            const descriptorMode = options.descriptor || 'auto';
            let useMode;
            if (descriptorMode === 'auto') {
                // Auto mode: line charts use trend, bar/pie charts use categorical
                useMode = chartType === 'line' ? 'trend' : 'categorical';
            }
            else {
                useMode = descriptorMode;
            }
            // Generate description based on chosen mode
            let description = '';
            const xScale = chart.data.labels;
            const yScale = dataset.data;
            if (useMode === 'trend') {
                // Use piecewise regression for trend analysis
                description = describeLineChart(xScale, yScale, descriptorOptions);
            }
            else {
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
        // Update the description element content
        descriptionEl.innerHTML = descriptions.join(' ');
    },
    /**
     * Clean up when chart is destroyed
     */
    afterDestroy(chart, args, options) {
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

exports.chart2text = chart2text;
exports.default = chart2text;
exports.describeBarChart = describeBarChart;
exports.describeLineChart = describeLineChart;
exports.englishTemplates = englishTemplates;
exports.formatNumber = formatNumber;
//# sourceMappingURL=index.js.map
