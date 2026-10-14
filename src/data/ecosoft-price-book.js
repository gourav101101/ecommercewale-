// Private supplier purchase costs transcribed from the supplied PDF, 14 October 2026.
// Import only from admin server routes/scripts. Never from storefront components.
const groups = [];
function add(id, name, page, quantities, text, options = {}) {
  groups.push({ id, name, page, quantities, ...options, rows: text.trim().split('\n').map(line => {
    const [size, code, ...prices] = line.trim().split('|');
    return { size, code, prices: prices.map(Number) };
  }) });
}
add('plain', 'Plain courier bags — silver strip', 2, [], `
6x8||1.12|1.43
8x10||1.64|1.93
8x12||1.91|2.29
10x12||2.34|2.76
10x14||2.58|2.94
12x14||3.24|3.49
12x16||3.48|3.77
14x18||4.33|4.82
16x22||5.76|6.63
18x24||6.89|7.61
22x24||8.52|9.43
25x28||10.76|11.99`, { podColumns: true });
add('myntra', 'Myntra poly bags', 3, [], `
6.5x7.5|MPP1|1.52
8x10|MPP2|2.14
8.5x11.5|MPP2.5A|2.49
9.5x12.5|MPP2.5B|2.91
10x14|MPP3|3.48
11.5x14|MPP4|3.73
14x16|MPP5|4.89
15x17.5|MPP6|5.71
17x20|MPP7|7.31
19x22|MPP8|8.92
23x31|MPP9|13.43`);
add('meesho-transparent-pod', 'Meesho transparent POD', 4, [100,500,5000,25000], `
6.5x8|TP1|1.89|1.78|1.51|1.49
8x10|TP2|2.86|2.58|2.25|2.23
8x12|TP3|3.20|3.02|2.74|2.70
9x12|TP15|3.66|3.39|3.04|2.97
10x12|TP4|4.00|3.43|3.27|3.17
10x14|TP5|4.44|3.93|3.75|3.65
12x14|TP0|5.49|4.75|4.48|4.39
12.5x16|TP6|6.39|5.49|5.28|5.20
14x18|TP7|8.03|6.89|6.48|6.35
16x20|TP8|10.10|8.51|8.24|8.10
18x22|TP11|12.91|10.25|9.86|9.72
22x24|TP13|16.99|13.65|13.50|13.37
24x26|TP9|19.48|16.16|15.80|15.66
8x16|TP18|4.40|4.00|3.51|3.38
9x19|TP17|5.63|5.05|4.46|4.32
10x16|TP16|5.28|4.62|4.05|3.98`);
add('meesho-opaque-non-pod', 'Meesho opaque Non-POD', 5, [100,500,5000,25000], `
6.5x8|NP1|1.39|1.31|1.11|1.09
8x10|NP2|2.10|1.89|1.65|1.63
8x12|NP3|2.35|2.22|2.01|1.98
9x12|NP15|2.68|2.49|2.23|2.18
10x12|NP4|2.93|2.52|2.40|2.33
10x14|NP5|3.26|2.88|2.75|2.67
12x14|NP6|4.03|3.48|3.29|3.22
12x16|NP7|4.68|4.03|3.87|3.81
14x18|NP8|5.89|5.05|4.75|4.65
16x20|NP9|7.41|6.24|6.04|5.94
18x22|NP11|9.46|7.51|7.23|7.13
22x24|NP13|12.42|10.01|9.90|9.80
24x26|NP14|14.29|11.85|11.58|11.48
8x16|NP18|3.23|2.93|2.57|2.48
9x19|NP17|4.13|3.70|3.27|3.17
10x16|NP16|3.87|3.39|2.97|2.92`);
add('meesho-opaque-pod', 'Meesho opaque POD', 6, [100,500,5000,25000], `
6x8|NP1|1.88|1.77|1.50|1.47
8x10|NP2|2.84|2.55|2.23|2.20
8x12|NP3|3.17|3.02|2.71|2.67
9x12|NP15|3.66|3.39|3.04|2.97
10x12|NP4|3.99|3.43|3.27|3.17
10x14|NP5|4.44|3.93|3.75|3.65
12x14|NP6|5.49|4.75|4.48|4.39
12x16|NP7|6.39|5.49|5.28|5.20
14x18|NP8|8.03|6.89|6.48|6.35
16x20|NP9|10.10|8.51|8.24|8.10
18x22|NP11|12.91|10.25|9.86|9.72
22x24|NP13|16.99|13.65|13.50|13.37
24x26|NP14|19.48|16.16|15.80|15.66
8x16|NP18|4.40|4.00|3.51|3.38
9x19|NP17|5.63|5.05|4.46|4.32
10x16|NP16|5.28|4.62|4.05|3.98`);
add('meesho-transparent-non-pod', 'Meesho transparent Non-POD', 7, [100,500,5000,25000], `
6.5x8|TP1|1.40|1.32|1.12|1.10
8x10|TP2|2.12|1.91|1.67|1.65
8x12|TP3|2.37|2.24|2.03|2.00
9x12|TP15|2.71|2.51|2.25|2.20
10x12|TP4|2.96|2.54|2.42|2.35
10x14|TP5|3.29|2.91|2.78|2.70
12x14|TP0|4.07|3.52|3.32|3.25
12.5x16|TP6|4.73|4.07|3.91|3.85
14x18|TP7|5.95|5.10|4.80|4.70
16x20|TP8|7.48|6.30|6.10|6.00
18x22|TP11|9.56|7.59|7.30|7.20
22x24|TP13|12.55|10.11|10.00|9.90
24x26|TP9|14.43|11.97|11.70|11.60
8x16|TP18|3.26|2.96|2.60|2.50
9x19|TP17|4.17|3.74|3.30|3.20
10x16|TP16|3.91|3.42|3.00|2.95`);
add('flipkart-transparent', 'Flipkart transparent courier bags', 8, [100,500,5000,25000], `
6.3x7.6|TSB0|1.48|1.34|1.12|1.10
8.5x11|TSB1|2.84|2.53|2.31|2.28
10x13|TSB2|3.62|3.17|2.87|2.79
12.5x15|TSB3|4.87|4.32|4.06|3.99
14x18|TSB3.5|5.89|5.52|5.27|5.21
16x20|TSB4|7.52|7.02|6.68|6.61
20x23|TSB5|10.83|9.48|9.39|9.29`);
add('flipkart-opaque', 'Flipkart opaque courier bags', 9, [100,500,5000,25000], `
6.3x7.6|NSB0|1.48|1.34|1.02|1.01
8.5x11|NSB1|2.71|2.41|2.04|2.02
5x20|NSB1.5|2.78|2.39|2.17|2.07
10x13|NSB2|3.61|3.17|2.70|2.60
5x27|NSB2.5|3.92|3.54|2.93|2.89
12.5x15|NSB3|4.49|4.03|3.69|3.61
14x18|NSB3.5|5.57|5.11|4.91|4.75
16x20|NSB4|7.13|6.49|6.05|5.91
20x23|NSB5|9.61|8.87|8.49|8.35
25x28|NSB6|14.11|13.27|12.91|12.31
7x25|NSB7|4.71|4.28|4.10|4.01`);
add('amazon', 'Amazon courier bags', 10, [100,500], `
6x8||1.42|1.28
8x11||2.33|1.96
10x12||2.79|2.42
12x14||3.52|3.09
12.5x16||4.41|3.70
14x17||4.89|4.11
17x19||6.11|5.35
21x23||8.72|7.82`);
add('colour-pod', 'Coloured courier bags with POD', 11, [], `
6x8||1.86
8x10||2.51
10x14||3.82
12x16||4.90`, { colours: ['Red','Yellow','Pink','Black','Green','Blue'] });
add('paper', 'Laminated paper courier bags', 12, [], `
7.5x8||2.04
9x11||3.37
11x14||4.93
13x16||6.37
15x18||7.79
17x21||9.89`);
add('bubble', 'Bubble courier bags', 13, [], `
5x7||2.94|3.93
6.5x8||3.87|5.23
8x10||6.10|8.37
10x12||8.03|10.84
10x14||9.41|12.71
12x14||10.76|14.53
12x16||12.72|17.17
14x18||16.63|22.46`, { podColumns: true });

export const priceBookSource = {
  supplier: 'Ecosoft', file: 'Ecosoft_Packaging_Price_Catalogue.pdf', recordedOn: '2026-10-14',
  currency: 'INR', unit: 'bag', dimensionsUnit: 'inches', gstIncluded: false, deliveryIncluded: false,
  priceValidity: 'Not supplied',
  notes: 'Owner confirmed purchase prices exclude GST and delivery. Quantity headings are quoted order quantities, not confirmed MOQ or intermediate-quantity rules. GST rate, HSN, stock and validity remain unconfirmed.',
};
export const priceBookGroups = groups.map(({id,name,page}) => ({id,name,page}));
export const priceBookItems = groups.flatMap(group => group.rows.flatMap(row => {
  const options = group.podColumns ? ['Non-POD','POD'] : group.colours || [''];
  return options.map((option,index) => {
    const flags = [];
    if (!group.quantities.length) flags.push('Order quantity / MOQ not specified.');
    if (/meesho-opaque/.test(group.id) && row.code==='NP1') flags.push('NP1 is 6 × 8 in POD and 6.5 × 8 in Non-POD. Confirm dimensions.');
    if (group.id==='meesho-opaque-non-pod' && row.code==='NP3') flags.push('Price table says NP3; reference illustration says NP2. Confirm code.');
    if (group.id==='colour-pod' || group.podColumns || group.id.endsWith('-pod') && !group.id.endsWith('-non-pod')) flags.push('Confirm POD pocket / printing specification.');
    return {
      id: `eco-${group.id}-${row.size}${option?'-'+option.toLowerCase():''}`,
      groupId: group.id, name: group.name, size: row.size, option, code: row.code, page: group.page, flags,
      tiers: group.quantities.length ? group.quantities.map((quantity,i)=>({quantity,unitCost:row.prices[i]})) : [{quantity:null,unitCost:row.prices[group.podColumns?index:0]}],
    };
  });
}));
