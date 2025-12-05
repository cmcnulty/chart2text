/**
 * Test setup file for Jest
 * Configures global test environment and provides common utilities
 */

// @ts-nocheck

// Mock segreg library
jest.mock('segreg', () => ({
  piecewise: jest.fn(() => ({ segments: [] })),
  adjustSegmentsToSnapIntersections: jest.fn((segments) =>
    segments.map((seg) => ({
      ...seg,
      start_t: seg.fromInclusive !== undefined ? seg.fromInclusive : seg.start_t,
      end_t: seg.toInclusive !== undefined ? seg.toInclusive : seg.end_t
    }))
  ),
  FittedSegment: class FittedSegment {}
}));

// Mock canvas for Chart.js in JSDOM environment
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    fillText: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
    transform: jest.fn(),
    rect: jest.fn(),
    clip: jest.fn(),
  }));
}

// Add ResizeObserver mock (needed for Chart.js)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
