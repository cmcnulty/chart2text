/**
 * Type definitions for segreg library
 */
declare module 'segreg' {
  export interface FittedSegment {
    start_t: number;
    end_t: number;
    coeffs: {
      intercept: number;
      slope: number;
    };
  }

  export interface PiecewiseResult {
    segments: FittedSegment[];
    threshold: number;
  }

  export function piecewise(
    xData: any[],
    yData: any[],
    threshold?: number
  ): PiecewiseResult;

  export function adjustSegmentsToSnapIntersections(
    segments: FittedSegment[],
    threshold?: number
  ): FittedSegment[];
}
