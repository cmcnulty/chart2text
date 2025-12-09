import { TemplateSet } from '../types';

/**
 * English language templates for chart descriptions
 */
export const englishTemplates: TemplateSet = {
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
      'Starting at {startY} when {xUnit} is {startX}, it rises at a rate of about {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
      'The {datasetLabel} begins at {startY} at {xUnit} {startX} and climbs on average by about {changeRate} per {xUnit} until it hits {endY} at {xUnit} {endX}.'
    ],
    decreasing: [
      'At {xUnit} {startX}, it starts at {startY} and decreases by about {changeRate} per {xUnit}, until reaching {endY} at {xUnit} {endX}.',
      'Starting at {startY} when {xUnit} is {startX}, it falls at a rate of about {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
      'The {datasetLabel} begins at {startY} at {xUnit} {startX} and drops on average by about {changeRate} per {xUnit} until it reaches {endY} at {xUnit} {endX}.'
    ],
    flat: [
      'To start, it remains flat at {startY} from {xUnit} {startX} to {xUnit} {endX}.',
      'The {datasetLabel} starts steady at {startY} between {xUnit} {startX} and {xUnit} {endX}.',
      'From {xUnit} {startX} to {xUnit} {endX}, it starts at a constant value of {startY}.'
    ]
  },

  subsequentSegment: {
    increasing: [
      'It then increases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, reaching {endY}.',
      'After that, it rises at about {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, climbing to {endY}.',
      'Subsequently, it grows by roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, reaching {endY}.',
      'Following this, the value increases at a rate of {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, going up to {endY}.',
      'Next, it shows an upward trend of about {changeRate} per {xUnit} from {xUnit} {startX} through {xUnit} {endX}, ascending to {endY}.'
    ],
    decreasing: [
      'It then decreases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, falling to {endY}.',
      'After that, it declines at about {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, dropping to {endY}.',
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
      'Starting again at {startY} when {xUnit} is {startX}, it rises at about {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
      'A new trend begins at {xUnit} {startX} at {startY}, climbing by roughly {changeRate} per {xUnit} until reaching {endY} at {xUnit} {endX}.'
    ],
    decreasing: [
      'The data resumes at {xUnit} {startX} with a value of {startY}, then decreases by about {changeRate} per {xUnit} to {endY} at {xUnit} {endX}.',
      'Starting again at {startY} when {xUnit} is {startX}, it falls at about {changeRate} per {xUnit}, reaching {endY} by {xUnit} {endX}.',
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
      'In the final segment, it rises at about {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, ending at {endY}.',
      'The last trend shows an increase of roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, concluding at {endY}.'
    ],
    decreasing: [
      'Finally, it decreases by about {changeRate} per {xUnit} from {xUnit} {startX} to {xUnit} {endX}, ultimately falling to {endY}.',
      'In the final segment, it declines at about {changeRate} per {xUnit} between {xUnit} {startX} and {xUnit} {endX}, ending at {endY}.',
      'The last trend shows a decrease of roughly {changeRate} per {xUnit} from {xUnit} {startX} until {xUnit} {endX}, concluding at {endY}.'
    ],
    flat: [
      'Finally, it remains flat at {startY} from {xUnit} {startX} to {xUnit} {endX}.',
      'In the final segment, it stabilizes at {startY} between {xUnit} {startX} and {xUnit} {endX}.',
      'The last portion of the chart shows a constant value of {startY} from {xUnit} {startX} until {xUnit} {endX}.'
    ]
  }
};
