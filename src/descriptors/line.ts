import { piecewise, adjustSegmentsToSnapIntersections, FittedSegment } from 'segreg';
import { Chart2TextOptions, TemplateValues } from '../types';
import { formatNumber } from '../formatters/number';
import { englishTemplates } from '../templates/en';

/**
 * Classifies the slope type based on its value
 */
function getSlopeType(slope: number): 'increasing' | 'decreasing' | 'flat' {
  const THRESHOLD = 0.0001; // Threshold for considering a slope as flat
  if (Math.abs(slope) < THRESHOLD) return 'flat';
  return slope > 0 ? 'increasing' : 'decreasing';
}

/**
 * Fills in a template with the provided values
 */
function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return values[key] !== undefined ? values[key].toString() : match;
  });
}

/**
 * Selects a template from potentially multiple variations
 */
function selectTemplate(
  templateOption: string | string[] | undefined,
  strategy: 'random' | 'sequential' = 'random',
  usedTemplates: Set<string> = new Set()
): string {
  if (!templateOption) return '';

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

    let selectedTemplate: string;

    if (strategy === 'random') {
      // Random selection
      const randomIndex = Math.floor(Math.random() * candidateTemplates.length);
      selectedTemplate = candidateTemplates[randomIndex];
    } else {
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
export function describeLineChart(
  xScale: any[],
  yScale: any[],
  options: Chart2TextOptions
): string {
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
    piecewiseSegments = piecewise(numericXScale, numericYScale);
    segments = adjustSegmentsToSnapIntersections(piecewiseSegments.segments);
  } catch (error) {
    console.error('Error in piecewise regression:', error);
    return 'Unable to analyze trend data.';
  }

  if (!segments || segments.length === 0) {
    return 'No trend segments identified.';
  }

  // Helper function to map numeric x-value back to original label
  const mapXToLabel = (numericX: number): string => {
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
  const usedTemplates = new Set<string>();

  // Initialize result with introduction if provided
  let result = '';

  if (options.introduction !== false && templates.introduction) {
    const selectedIntro = selectTemplate(
      templates.introduction,
      options.variationStrategy,
      usedTemplates
    );

    if (selectedIntro) {
      result = fillTemplate(selectedIntro, {
        datasetLabel: options.datasetLabel || 'data',
        xUnit: options.xUnit || 'units',
        yUnit: options.yUnit || 'units'
      } as TemplateValues) + ' ';
    }
  }

  // Generate description for each segment
  segments.forEach((segment: FittedSegment, index: number) => {
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
    } else if (isDisconnected && templates.disconnectedSegment) {
      // Use disconnected templates when there's a gap from previous segment
      templateGroup = templates.disconnectedSegment;
    } else if (isLastSegment && templates.finalSegment) {
      templateGroup = templates.finalSegment;
    } else {
      templateGroup = templates.subsequentSegment;
    }

    if (!templateGroup) return;

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
    const formattedValues: TemplateValues = {
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
      const selectedTemplate = selectTemplate(
        templateOption,
        options.variationStrategy,
        usedTemplates
      );

      // Fill in the template and add to result
      if (selectedTemplate) {
        result += fillTemplate(selectedTemplate, formattedValues) + ' ';
      }
    }
  });

  return result.trim();
}
