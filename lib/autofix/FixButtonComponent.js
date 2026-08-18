import {
  render as renderComponent,
  html
} from '@bpmn-io/diagram-js-ui';

const BUTTON_STYLE = [
  'display:inline-flex',
  'align-items:center',
  'gap:4px',
  'padding:2px 8px',
  'font-size:12px',
  'line-height:16px',
  'color:#fff',
  'background:#0072ce',
  'border:none',
  'border-radius:4px',
  'cursor:pointer',
  'box-shadow:0 1px 2px rgba(0,0,0,.2)'
].join(';');

function FixButton(props) {
  const {
    label,
    onClick,
    disabled = false
  } = props;

  return html`
    <button
      type="button"
      class="cl-autofix-button"
      style=${ BUTTON_STYLE }
      disabled=${ disabled }
      onClick=${ onClick }
      title="Apply the suggested fix"
    >
      ${ label }
    </button>
  `;
}

export function renderFixButton(el, props) {
  return renderComponent(html`<${FixButton} ...${ props } />`, el);
}
