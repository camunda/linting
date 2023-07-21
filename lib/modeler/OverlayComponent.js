import {
  render as renderComponent,
  html
} from '@bpmn-io/diagram-js-ui';

import classNames from 'clsx';

const errorSvg = html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14S23.7,2,16,2z M21.4,23L16,17.6L10.6,23L9,21.4l5.4-5.4L9,10.6L10.6,9
    l5.4,5.4L21.4,9l1.6,1.6L17.6,16l5.4,5.4L21.4,23z" fill="currentColor" />
</svg>
`;

const warningSvg = html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25
  c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z" fill="currentColor" />
</svg>
`;

const infoSvg = html`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,6a1.5,1.5,0,1,1-1.5,1.5A1.5,1.5,0,0,1,16,8Zm4,16.125H12v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z" fill="currentColor" />
</svg>
`;

const icons = {
  error: errorSvg,
  warn: warningSvg,
  info: infoSvg
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