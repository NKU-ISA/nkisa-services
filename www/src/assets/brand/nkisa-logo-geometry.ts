/**
 * Coordinates are measured from nkisa-logo-white.svg's 1000 × 1000 viewBox.
 *
 * The two downward frames are interrupted by the wordmark. Their lower arms
 * are about 68 units below the extrapolated upper arms, so a single ideal
 * triangle would drift away from the actual logo. Keep the upper/lower clips
 * and centerline subpaths separate. Clips include a small antialias margin.
 *
 * These clips select the existing traced paths; they are not replacement art.
 */
export const nkisaTriangles = [
  {
    id: 'primary',
    clipPath: [
      'M159.5 153.25 H846.5 L718.5 376.25 H683.5 L792.5 184.25 H213.5 L322.5 376.25 H287.5 Z',
      'M381.8 607 H417.6 L503 754.8 L588.4 607 H624.2 L503 817 Z',
    ].join(' '),
    centerline: [
      'M361 168.75 H186.5 L305 375',
      'M701 375 L819.5 168.75 H645',
      'M399.75 608 L503 785.95 L606.25 608',
    ].join(' '),
    // Move along the left arm's approximately 60-degree slope.
    motionVector: { x: -80, y: -139 },
  },
  {
    id: 'secondary',
    clipPath: [
      'M137.8 268 H868.2 L807.9 376.2 H791.7 L845.8 282.2 H160.2 L214.3 376.2 H198.1 Z',
      'M292.3 606.8 H309.4 L503 942.8 L696.6 606.8 H713.7 L503 971 Z',
    ].join(' '),
    centerline: [
      'M383.5 275.3 H149.5 L206.5 375',
      'M799.5 375 L856.5 275.3 H622.5',
      'M301.05 608.2 L503 956.96 L704.95 608.2',
    ].join(' '),
    // Opposing diagonal gives the two stacked triangles distinct entrances.
    motionVector: { x: 70, y: -121 },
  },
  {
    id: 'counter',
    clipPath: [
      'M503 701 L411.6 860 H595.5 Z',
      'M503 715 L423 853.5 H583 Z',
    ].join(' '),
    // Fits visible side pixels to within 0.22 source pixels (standard deviation).
    // This is the SMALL upward triangle at the bottom, not a full-size guide.
    centerline: 'M503 706.24 L416.36 856.75 H590.29 Z',
    motionVector: { x: 0, y: 88 },
  },
] as const

/** Outer edge of the Nankai badge, including its star-like projecting corners. */
export const nkisaBadgeOutline = [
  'M503 24.5',
  'L552.418 77.243 L623.5 74.724 L621.144 145.5',
  'L671.9 194.9 L620.744 244.359 L623.505 315.284',
  'L551.5 312.853 L503 363.5 L454.5 312.832',
  'L382.5 315.288 L384.413 243.885 L332.616 194.68',
  'L384.929 145.497 L383 74.716 L453.624 77.246 Z',
].join(' ')
