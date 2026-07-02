import { use, expect as chaiExpect } from 'chai';
import sinonChai from 'sinon-chai';

use(sinonChai);

window.expect = chaiExpect;
