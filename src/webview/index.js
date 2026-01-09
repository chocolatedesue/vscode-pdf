/* global __webpack_public_path__:writable */
if (window.mediaUri) {
    __webpack_public_path__ = window.mediaUri + '/';
}

import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
    target: document.body,
});

export default app;
