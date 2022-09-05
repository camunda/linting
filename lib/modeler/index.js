import Linting from './Linting';
import LintingAnnotations from './LintingAnnotations';

export default {
  __init__: [
    'linting',
    'lintingAnnotations'
  ],
  linting: [ 'type', Linting ],
  lintingAnnotations: [ 'type', LintingAnnotations ]
};