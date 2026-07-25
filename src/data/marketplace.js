export const marketplaces = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    color: '#2874F0',
    requirements: [
      'Tamper-proof courier bags mandatory',
      'POD jacket required for all shipments',
      'Minimum 55 micron bag thickness',
      '3-ply boxes minimum for standard items',
    ],
  },
  {
    id: 'amazon',
    name: 'Amazon',
    color: '#FF9900',
    requirements: [
      'FBA-compliant labeling required',
      'Scannable barcodes on all packages',
      'Tamper-proof packaging mandatory',
      '5-ply boxes for heavy/fragile items',
    ],
  },
  {
    id: 'myntra',
    name: 'Myntra',
    color: '#FF3E6C',
    requirements: [
      'Fashion-grade packaging expected',
      'Clean presentation for apparel',
      'Tamper-proof bags required',
      'Premium feel packaging preferred',
    ],
  },
  {
    id: 'meesho',
    name: 'Meesho',
    color: '#570A57',
    requirements: [
      'Transparent bags often required',
      'Product must be visible for inspection',
      'POD jacket for shipping labels',
      'Cost-effective packaging preferred',
    ],
  },
];

export const marketplaceCompatibility = {
  'courier-bags': {
    flipkart: { compatible: true, note: 'Both transparent & opaque accepted' },
    amazon: { compatible: true, note: 'Opaque bags preferred for FBA' },
    myntra: { compatible: true, note: 'Opaque bags for fashion items' },
    meesho: { compatible: true, note: 'Transparent bags often required' },
  },
  'boxes-tapes': {
    flipkart: { compatible: true, note: '3-ply for standard, 5-ply for heavy' },
    amazon: { compatible: true, note: 'FBA has specific box size requirements' },
    myntra: { compatible: true, note: 'Clean boxes for fashion shipments' },
    meesho: { compatible: true, note: 'Cost-effective 3-ply boxes' },
  },
  'labels-stickers': {
    flipkart: { compatible: true, note: 'Thermal labels for AWB printing' },
    amazon: { compatible: true, note: 'FNSKU & shipping labels required' },
    myntra: { compatible: true, note: 'Standard shipping labels' },
    meesho: { compatible: true, note: 'Thermal labels for label printing' },
  },
  'shredded-paper': {
    flipkart: { compatible: true, note: 'As void filler for fragile items' },
    amazon: { compatible: true, note: 'Accepted as packaging filler' },
    myntra: { compatible: true, note: 'Premium unboxing experience' },
    meesho: { compatible: false, note: 'Not commonly used' },
  },
};
