import { insertCSS } from 'bpmn-js/test/helper';

import { expect } from 'chai';

import TestContainer from 'mocha-test-container-support';

import { domify } from 'min-dom';

import { renderIcon } from '../../../lib/modeler/OverlayComponent';

import lintingCSS from '../../../assets/linting.css';

insertCSS('linting.css', lintingCSS);

insertCSS('styling.css', `
  .cl-styling {
    padding: 20px 24px;
    font-family: sans-serif;
    color: #22242a;
    background: #fff;
  }

  .cl-styling h2 {
    font-size: 15px;
    margin: 0 0 4px;
  }

  .cl-styling .intro {
    color: #666;
    font-size: 12px;
    margin: 0 0 20px;
    max-width: 640px;
  }

  .cl-styling table {
    border-collapse: collapse;
  }

  .cl-styling th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: #888;
    padding: 0 20px 8px 0;
  }

  .cl-styling td {
    padding: 10px 20px 10px 0;
    border-top: 1px solid #eee;
    vertical-align: middle;
  }

  .cl-styling .swatch {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    vertical-align: middle;
    margin-right: 8px;
  }

  .cl-styling .category {
    font-weight: 600;
    font-size: 13px;
  }

  .cl-styling .value {
    font-family: monospace;
    font-size: 12px;
    color: #444;
  }

  .cl-styling .badge {
    display: inline-flex;
  }

  .cl-styling .badge-14 { --cl-icon-size: 14px; }
  .cl-styling .badge-18 { --cl-icon-size: 18px; }
  .cl-styling .badge-24 { --cl-icon-size: 24px; }
`);

const singleStart = window.__env__ && window.__env__.SINGLE_START === 'styles';

// severities as rendered by the library (cf. OverlayComponent)
const CATEGORIES = [
  { category: 'error', label: 'Error' },
  { category: 'warn', label: 'Warning' },
  { category: 'info', label: 'Info' },
  { category: 'success', label: 'Success' }
];

const SIZES = [ 14, 18, 24 ];


describe('styling', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  function badge(category, size) {
    const el = domify(`<span class="badge badge-${ size }"></span>`);

    renderIcon(el, { category });

    return el;
  }

  function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);

    if (!match) {
      return rgb;
    }

    return '#' + match.slice(0, 3)
      .map(n => parseInt(n, 10).toString(16).padStart(2, '0'))
      .join('');
  }

  function stylingExample() {
    const board = domify(`
      <div class="cl-styling">
        <h2>Linting badges &mdash; colors &amp; glyphs</h2>
        <p class="intro">
          Severity markers as rendered by the library (<code>renderIcon</code>).
          Colors and glyphs are the single source of truth shared by canvas overlays
          and the properties panel. The disc scales via the <code>--cl-icon-size</code>
          custom property &mdash; shown here at 14px, 18px and 24px.
        </p>
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Color</th>
              <th>14px</th>
              <th>18px</th>
              <th>24px</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `);

    const tbody = board.querySelector('tbody');

    CATEGORIES.forEach(({ category, label }) => {
      const row = domify(`
        <tr>
          <td class="category">${ label }</td>
          <td class="colorCell"></td>
          <td class="s14"></td>
          <td class="s18"></td>
          <td class="s24"></td>
        </tr>
      `);

      SIZES.forEach(size => {
        row.querySelector(`.s${ size }`).appendChild(badge(category, size));
      });

      tbody.appendChild(row);
    });

    container.appendChild(board);

    // read back the actual rendered color (single source of truth)
    CATEGORIES.forEach(({ category }, index) => {
      const row = tbody.children[ index ];
      const icon = row.querySelector('.cl-icon');
      const color = window.getComputedStyle(icon).backgroundColor;
      const hex = rgbToHex(color);

      row.querySelector('.colorCell').innerHTML =
        `<span class="swatch" style="background:${ color }"></span>` +
        `<span class="value">${ hex }</span>`;
    });
  }


  (singleStart ? it.only : it)('should render badges', function() {
    stylingExample();

    expect(container.querySelectorAll('.cl-icon')).to.have.length(CATEGORIES.length * SIZES.length);
  });

});
