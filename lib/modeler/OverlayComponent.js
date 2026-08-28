import {
  render as renderComponent,
  html
} from '@bpmn-io/diagram-js-ui';

import classNames from 'clsx';

// Lucide-style glyphs, rendered as a white mark centered on the colored disc.
const glyphSvg = (paths) => html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="3 3 18 18" fill="none"
  stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  ${paths}
</svg>
`;

const errorSvg = glyphSvg(html`
  <path d="m15 9-6 6" />
  <path d="m9 9 6 6" />
`);

const warningSvg = glyphSvg(html`
  <path d="M12 8v4.5" />
  <path d="M12 16.5h.01" />
`);

const infoSvg = glyphSvg(html`
  <path d="M12 16v-4" />
  <path d="M12 8h.01" />
`);

const successSvg = glyphSvg(html`
  <path d="m8.5 12 2.3 2.3 4.7-4.7" />
`);

const icons = {
  error: errorSvg,
  warn: warningSvg,
  info: infoSvg,
  success: successSvg
};

export function OverlayComponent(props) {

  const {
    onClick = () => {},
    reports
  } = props;

  const category =
    reports.find(({ category }) => category === 'error')
      ? 'error'
      : reports.find(({ category }) => category === 'warn')
        ? 'warn'
        : 'info';

  return html`
    <div
      class=${ classNames('cl-icon',`cl-icon-${category}`) }
      onClick=${ onClick }
      title="Click to show issue"
    >
      ${ icons[category] }
    </div>
  `;
}

export function renderOverlay(el, props) {
  return renderComponent(html`<${OverlayComponent} ...${props} />`, el);
}

export function IconComponent(props) {
  const { category } = props;

  return html`
    <div class=${ classNames('cl-icon', `cl-icon-${category}`) }>
      ${ icons[category] }
    </div>
  `;
}

export function renderIcon(el, props) {
  return renderComponent(html`<${IconComponent} ...${props} />`, el);
}