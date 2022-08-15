
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
        return context;
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var default_sort = function (item, needle) { return item - needle; };
    function binarySearch(array, search, fn) {
        if (fn === void 0) { fn = default_sort; }
        var low = 0;
        var high = array.length - 1;
        var sort = fn.length === 1
            ? function (item, needle) { return fn(item) - search; }
            : fn;
        while (low <= high) {
            var i = (high + low) >> 1;
            var d = sort(array[i], search);
            if (d < 0) {
                low = i + 1;
            }
            else if (d > 0) {
                high = i - 1;
            }
            else {
                return i;
            }
        }
        return -low - 1;
    }

    function pickRandom(array) {
        var i = ~~(Math.random() * array.length);
        return array[i];
    }

    // http://bost.ocks.org/mike/shuffle/
    function shuffle(array) {
        var m = array.length;
        // While there remain elements to shuffle…
        while (m > 0) {
            // Pick a remaining element…
            var i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            var t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    function queue(max) {
        if (max === void 0) { max = 4; }
        var items = []; // TODO
        var pending = 0;
        var closed = false;
        var fulfil_closed;
        function dequeue() {
            if (pending === 0 && items.length === 0) {
                if (fulfil_closed)
                    fulfil_closed();
            }
            if (pending >= max)
                return;
            if (items.length === 0)
                return;
            pending += 1;
            var _a = items.shift(), fn = _a.fn, fulfil = _a.fulfil, reject = _a.reject;
            var promise = fn();
            try {
                promise.then(fulfil, reject).then(function () {
                    pending -= 1;
                    dequeue();
                });
            }
            catch (err) {
                reject(err);
                pending -= 1;
                dequeue();
            }
            dequeue();
        }
        return {
            add: function (fn) {
                if (closed) {
                    throw new Error("Cannot add to a closed queue");
                }
                return new Promise(function (fulfil, reject) {
                    items.push({ fn: fn, fulfil: fulfil, reject: reject });
                    dequeue();
                });
            },
            close: function () {
                closed = true;
                return new Promise(function (fulfil, reject) {
                    if (pending === 0) {
                        fulfil();
                    }
                    else {
                        fulfil_closed = fulfil;
                    }
                });
            }
        };
    }

    function createSprite(width, height, fn) {
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        fn(ctx, canvas);
        return canvas;
    }

    function clamp(num, min, max) {
        return num < min ? min : num > max ? max : num;
    }

    function random(a, b) {
        if (b === undefined)
            return Math.random() * a;
        return a + Math.random() * (b - a);
    }

    function linear(domain, range) {
        var d0 = domain[0];
        var r0 = range[0];
        var m = (range[1] - r0) / (domain[1] - d0);
        return Object.assign(function (num) {
            return r0 + (num - d0) * m;
        }, {
            inverse: function () { return linear(range, domain); }
        });
    }

    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    function commas(num) {
        var parts = String(num).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    var yootils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        binarySearch: binarySearch,
        pickRandom: pickRandom,
        shuffle: shuffle,
        queue: queue,
        createSprite: createSprite,
        clamp: clamp,
        random: random,
        linearScale: linear,
        commas: commas
    });

    /* node_modules/@sveltejs/pancake/components/Chart.svelte generated by Svelte v3.49.0 */
    const file$7 = "node_modules/@sveltejs/pancake/components/Chart.svelte";

    function create_fragment$g(ctx) {
    	let div;
    	let div_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-chart svelte-1gzh5rp");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[17].call(div));
    			toggle_class(div, "clip", /*clip*/ ctx[0]);
    			add_location(div, file$7, 78, 0, 1618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			/*div_binding*/ ctx[16](div);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[17].bind(div));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousemove", /*handle_mousemove*/ ctx[6], false, false, false),
    					listen_dev(div, "mouseleave", /*handle_mouseleave*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*clip*/ 1) {
    				toggle_class(div, "clip", /*clip*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			/*div_binding*/ ctx[16](null);
    			div_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const key = {};

    function getChartContext() {
    	return getContext(key);
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let $y_scale_inverse;
    	let $x_scale_inverse;
    	let $width;
    	let $height;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chart', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y2 = 1 } = $$props;
    	let { clip = false } = $$props;
    	let chart;
    	const _x1 = writable();
    	const _y1 = writable();
    	const _x2 = writable();
    	const _y2 = writable();
    	const width = writable();
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(2, $width = value));
    	const height = writable();
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(3, $height = value));
    	const pointer = writable(null);

    	const handle_mousemove = e => {
    		const bcr = chart.getBoundingClientRect();
    		const left = e.clientX - bcr.left;
    		const top = e.clientY - bcr.top;
    		const x = $x_scale_inverse(100 * left / (bcr.right - bcr.left));
    		const y = $y_scale_inverse(100 * top / (bcr.bottom - bcr.top));
    		pointer.set({ x, y, left, top });
    	};

    	const handle_mouseleave = () => {
    		pointer.set(null);
    	};

    	const x_scale = derived([_x1, _x2], ([$x1, $x2]) => {
    		return linear([$x1, $x2], [0, 100]);
    	});

    	const y_scale = derived([_y1, _y2], ([$y1, $y2]) => {
    		return linear([$y1, $y2], [100, 0]);
    	});

    	const x_scale_inverse = derived(x_scale, $x_scale => $x_scale.inverse());
    	validate_store(x_scale_inverse, 'x_scale_inverse');
    	component_subscribe($$self, x_scale_inverse, value => $$invalidate(19, $x_scale_inverse = value));
    	const y_scale_inverse = derived(y_scale, $y_scale => $y_scale.inverse());
    	validate_store(y_scale_inverse, 'y_scale_inverse');
    	component_subscribe($$self, y_scale_inverse, value => $$invalidate(18, $y_scale_inverse = value));

    	setContext(key, {
    		x1: _x1,
    		y1: _y1,
    		x2: _x2,
    		y2: _y2,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		pointer,
    		width,
    		height
    	});

    	const writable_props = ['x1', 'y1', 'x2', 'y2', 'clip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chart> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			chart = $$value;
    			$$invalidate(1, chart);
    		});
    	}

    	function div_elementresize_handler() {
    		$width = this.clientWidth;
    		width.set($width);
    		$height = this.clientHeight;
    		height.set($height);
    	}

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(10, x1 = $$props.x1);
    		if ('y1' in $$props) $$invalidate(11, y1 = $$props.y1);
    		if ('x2' in $$props) $$invalidate(12, x2 = $$props.x2);
    		if ('y2' in $$props) $$invalidate(13, y2 = $$props.y2);
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		key,
    		getChartContext,
    		setContext,
    		onDestroy,
    		writable,
    		derived,
    		yootils,
    		x1,
    		y1,
    		x2,
    		y2,
    		clip,
    		chart,
    		_x1,
    		_y1,
    		_x2,
    		_y2,
    		width,
    		height,
    		pointer,
    		handle_mousemove,
    		handle_mouseleave,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		$y_scale_inverse,
    		$x_scale_inverse,
    		$width,
    		$height
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(10, x1 = $$props.x1);
    		if ('y1' in $$props) $$invalidate(11, y1 = $$props.y1);
    		if ('x2' in $$props) $$invalidate(12, x2 = $$props.x2);
    		if ('y2' in $$props) $$invalidate(13, y2 = $$props.y2);
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('chart' in $$props) $$invalidate(1, chart = $$props.chart);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x1*/ 1024) {
    			_x1.set(x1);
    		}

    		if ($$self.$$.dirty & /*y1*/ 2048) {
    			_y1.set(y1);
    		}

    		if ($$self.$$.dirty & /*x2*/ 4096) {
    			_x2.set(x2);
    		}

    		if ($$self.$$.dirty & /*y2*/ 8192) {
    			_y2.set(y2);
    		}
    	};

    	return [
    		clip,
    		chart,
    		$width,
    		$height,
    		width,
    		height,
    		handle_mousemove,
    		handle_mouseleave,
    		x_scale_inverse,
    		y_scale_inverse,
    		x1,
    		y1,
    		x2,
    		y2,
    		$$scope,
    		slots,
    		div_binding,
    		div_elementresize_handler
    	];
    }

    class Chart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { x1: 10, y1: 11, x2: 12, y2: 13, clip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chart",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get x1() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get clip() {
    		throw new Error("<Chart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clip(value) {
    		throw new Error("<Chart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // adapted from https://github.com/d3/d3-array/blob/master/src/ticks.js
    // MIT License https://github.com/d3/d3-array/blob/master/LICENSE
    const e10 = Math.sqrt(50);
    const e5 = Math.sqrt(10);
    const e2 = Math.sqrt(2);

    function get_ticks(start, stop, count = 5) {
    	var reverse;
    	var i = -1;
    	var n;
    	var ticks;
    	var step;

    	if (start === stop && count > 0) return [start];

    	if (reverse = stop < start) {
    		[start, stop] = [stop, start];
    	}

    	if ((step = increment(start, stop, count)) === 0 || !isFinite(step)) {
    		return [];
    	}

    	if (step > 0) {
    		start = Math.ceil(start / step);
    		stop = Math.floor(stop / step);
    		ticks = new Array((n = Math.ceil(stop - start + 1)));
    		while (++i < n) ticks[i] = (start + i) * step;
    	} else {
    		start = Math.floor(start * step);
    		stop = Math.ceil(stop * step);
    		ticks = new Array((n = Math.ceil(start - stop + 1)));
    		while (++i < n) ticks[i] = (start - i) / step;
    	}

    	if (reverse) ticks.reverse();

    	return ticks;
    }

    function increment(start, stop, count) {
    	const step = (stop - start) / Math.max(0, count);
    	const power = Math.floor(Math.log(step) / Math.LN10);
    	const error = step / Math.pow(10, power);

    	return power >= 0
    		? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) *
    				Math.pow(10, power)
    		: -Math.pow(10, -power) /
    				(error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    /* node_modules/@sveltejs/pancake/components/Grid.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$6 = "node_modules/@sveltejs/pancake/components/Grid.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	child_ctx[25] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$9 = dirty => ({
    	value: dirty & /*_ticks*/ 2,
    	last: dirty & /*_ticks*/ 2
    });

    const get_default_slot_context$9 = ctx => ({
    	value: /*tick*/ ctx[23],
    	first: /*i*/ ctx[25] === 0,
    	last: /*i*/ ctx[25] === /*_ticks*/ ctx[1].length - 1
    });

    // (31:1) {#each _ticks as tick, i}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let div_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[20].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], get_default_slot_context$9);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t = space();
    			attr_dev(div, "class", "pancake-grid-item svelte-1wq9bba");
    			attr_dev(div, "style", div_style_value = /*style*/ ctx[0](/*tick*/ ctx[23], /*i*/ ctx[25]));
    			add_location(div, file$6, 31, 2, 876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, _ticks*/ 524290)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[19],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, get_default_slot_changes$9),
    						get_default_slot_context$9
    					);
    				}
    			}

    			if (!current || dirty & /*style, _ticks*/ 3 && div_style_value !== (div_style_value = /*style*/ ctx[0](/*tick*/ ctx[23], /*i*/ ctx[25]))) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(31:1) {#each _ticks as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div;
    	let current;
    	let each_value = /*_ticks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "pancake-grid");
    			add_location(div, file$6, 29, 0, 820);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*style, _ticks, $$scope*/ 524291) {
    				each_value = /*_ticks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let orientation;
    	let _ticks;
    	let style;
    	let $x_scale;
    	let $y_scale;
    	let $x2;
    	let $x1;
    	let $y2;
    	let $y1;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Grid', slots, ['default']);
    	let { count = undefined } = $$props;
    	let { ticks = undefined } = $$props;
    	let { horizontal = false } = $$props;
    	let { vertical = false } = $$props;
    	const { x1, y1, x2, y2, x_scale, y_scale } = getChartContext();
    	validate_store(x1, 'x1');
    	component_subscribe($$self, x1, value => $$invalidate(16, $x1 = value));
    	validate_store(y1, 'y1');
    	component_subscribe($$self, y1, value => $$invalidate(18, $y1 = value));
    	validate_store(x2, 'x2');
    	component_subscribe($$self, x2, value => $$invalidate(15, $x2 = value));
    	validate_store(y2, 'y2');
    	component_subscribe($$self, y2, value => $$invalidate(17, $y2 = value));
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(13, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(14, $y_scale = value));
    	const VERTICAL = {};
    	const HORIZONTAL = {};
    	const writable_props = ['count', 'ticks', 'horizontal', 'vertical'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('count' in $$props) $$invalidate(8, count = $$props.count);
    		if ('ticks' in $$props) $$invalidate(9, ticks = $$props.ticks);
    		if ('horizontal' in $$props) $$invalidate(10, horizontal = $$props.horizontal);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ('$$scope' in $$props) $$invalidate(19, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		get_ticks,
    		count,
    		ticks,
    		horizontal,
    		vertical,
    		x1,
    		y1,
    		x2,
    		y2,
    		x_scale,
    		y_scale,
    		VERTICAL,
    		HORIZONTAL,
    		orientation,
    		style,
    		_ticks,
    		$x_scale,
    		$y_scale,
    		$x2,
    		$x1,
    		$y2,
    		$y1
    	});

    	$$self.$inject_state = $$props => {
    		if ('count' in $$props) $$invalidate(8, count = $$props.count);
    		if ('ticks' in $$props) $$invalidate(9, ticks = $$props.ticks);
    		if ('horizontal' in $$props) $$invalidate(10, horizontal = $$props.horizontal);
    		if ('vertical' in $$props) $$invalidate(11, vertical = $$props.vertical);
    		if ('orientation' in $$props) $$invalidate(12, orientation = $$props.orientation);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    		if ('_ticks' in $$props) $$invalidate(1, _ticks = $$props._ticks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*vertical*/ 2048) {
    			$$invalidate(12, orientation = vertical ? VERTICAL : HORIZONTAL);
    		}

    		if ($$self.$$.dirty & /*horizontal, vertical*/ 3072) {
    			if (horizontal && vertical) {
    				console.error(`<Grid> must specify either 'horizontal' or 'vertical' orientation`);
    			}
    		}

    		if ($$self.$$.dirty & /*ticks, orientation, $y1, $y2, count, $x1, $x2*/ 496384) {
    			$$invalidate(1, _ticks = ticks || (orientation === HORIZONTAL
    			? get_ticks($y1, $y2, count)
    			: get_ticks($x1, $x2, count)));
    		}

    		if ($$self.$$.dirty & /*orientation, $y_scale, $x_scale*/ 28672) {
    			$$invalidate(0, style = orientation === HORIZONTAL
    			? (n, i) => `width: 100%; height: 0; top: ${$y_scale(n, i)}%`
    			: (n, i) => `width: 0; height: 100%; left: ${$x_scale(n, i)}%`);
    		}
    	};

    	return [
    		style,
    		_ticks,
    		x1,
    		y1,
    		x2,
    		y2,
    		x_scale,
    		y_scale,
    		count,
    		ticks,
    		horizontal,
    		vertical,
    		orientation,
    		$x_scale,
    		$y_scale,
    		$x2,
    		$x1,
    		$y2,
    		$y1,
    		$$scope,
    		slots
    	];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			count: 8,
    			ticks: 9,
    			horizontal: 10,
    			vertical: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get count() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontal() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontal(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get vertical() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vertical(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Point.svelte generated by Svelte v3.49.0 */
    const file$5 = "node_modules/@sveltejs/pancake/components/Point.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-point svelte-11ba04d");
    			set_style(div, "left", /*$x_scale*/ ctx[2](/*x*/ ctx[0]) + "%");
    			set_style(div, "top", /*$y_scale*/ ctx[3](/*y*/ ctx[1]) + "%");
    			add_location(div, file$5, 9, 0, 152);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$x_scale, x*/ 5) {
    				set_style(div, "left", /*$x_scale*/ ctx[2](/*x*/ ctx[0]) + "%");
    			}

    			if (!current || dirty & /*$y_scale, y*/ 10) {
    				set_style(div, "top", /*$y_scale*/ ctx[3](/*y*/ ctx[1]) + "%");
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $x_scale;
    	let $y_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Point', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(2, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(3, $y_scale = value));
    	let { x } = $$props;
    	let { y } = $$props;
    	const writable_props = ['x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Point> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x_scale,
    		y_scale,
    		x,
    		y,
    		$x_scale,
    		$y_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(0, x = $$props.x);
    		if ('y' in $$props) $$invalidate(1, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [x, y, $x_scale, $y_scale, x_scale, y_scale, $$scope, slots];
    }

    class Point extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { x: 0, y: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Point",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[0] === undefined && !('x' in props)) {
    			console.warn("<Point> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[1] === undefined && !('y' in props)) {
    			console.warn("<Point> was created without expected prop 'y'");
    		}
    	}

    	get x() {
    		throw new Error("<Point>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Point>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Point>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Point>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Box.svelte generated by Svelte v3.49.0 */
    const file$4 = "node_modules/@sveltejs/pancake/components/Box.svelte";

    function create_fragment$d(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "pancake-box svelte-38xupb");
    			attr_dev(div, "style", /*style*/ ctx[0]);
    			add_location(div, file$4, 28, 0, 648);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*style*/ 1) {
    				attr_dev(div, "style", /*style*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Box', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { y2 = 1 } = $$props;
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(8, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(7, $y_scale = value));
    	let style;
    	const writable_props = ['x1', 'x2', 'y1', 'y2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Box> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(3, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(4, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(5, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(6, y2 = $$props.y2);
    		if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x1,
    		x2,
    		y1,
    		y2,
    		x_scale,
    		y_scale,
    		style,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(3, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(4, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(5, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(6, y2 = $$props.y2);
    		if ('style' in $$props) $$invalidate(0, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x1, x2, $y_scale, y1, y2*/ 504) {
    			{
    				const _x1 = $x_scale(x1);
    				const _x2 = $x_scale(x2);
    				const _y1 = $y_scale(y1);
    				const _y2 = $y_scale(y2);
    				const left = Math.min(_x1, _x2);
    				const right = Math.max(_x1, _x2);
    				const top = Math.min(_y1, _y2);
    				const bottom = Math.max(_y1, _y2);
    				const height = bottom - top;
    				$$invalidate(0, style = `left: ${left}%; bottom: ${100 - bottom}%; width: ${right - left}%; height: ${height}%;`);
    			}
    		}
    	};

    	return [style, x_scale, y_scale, x1, x2, y1, y2, $y_scale, $x_scale, $$scope, slots];
    }

    class Box extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { x1: 3, x2: 4, y1: 5, y2: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Box",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get x1() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<Box>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<Box>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const default_x = d => d.x;
    const default_y = d => d.y;

    /* node_modules/@sveltejs/pancake/components/Bars.svelte generated by Svelte v3.49.0 */

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$8 = dirty => ({
    	value: dirty & /*data*/ 1,
    	last: dirty & /*data*/ 1
    });

    const get_default_slot_context$8 = ctx => ({
    	value: /*d*/ ctx[6],
    	first: /*i*/ ctx[8] === 0,
    	last: /*i*/ ctx[8] === /*data*/ ctx[0].length - 1
    });

    // (12:1) <Box y1="{y(d, i) - height/2}" y2="{y(d, i) + height/2}" x1={0} x2="{x(d, i)}">
    function create_default_slot$3(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$8);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, data*/ 33)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$8),
    						get_default_slot_context$8
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(12:1) <Box y1=\\\"{y(d, i) - height/2}\\\" y2=\\\"{y(d, i) + height/2}\\\" x1={0} x2=\\\"{x(d, i)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each data as d, i}
    function create_each_block$1(ctx) {
    	let box;
    	let current;

    	box = new Box({
    			props: {
    				y1: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) - /*height*/ ctx[1] / 2,
    				y2: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) + /*height*/ ctx[1] / 2,
    				x1: 0,
    				x2: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]),
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};
    			if (dirty & /*y, data, height*/ 11) box_changes.y1 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) - /*height*/ ctx[1] / 2;
    			if (dirty & /*y, data, height*/ 11) box_changes.y2 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]) + /*height*/ ctx[1] / 2;
    			if (dirty & /*x, data*/ 5) box_changes.x2 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]);

    			if (dirty & /*$$scope, data*/ 33) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(11:0) {#each data as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*y, data, height, x, $$scope*/ 47) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bars', slots, ['default']);
    	let { data } = $$props;
    	let { height = 1 } = $$props;
    	let { x = d => d.x } = $$props;
    	let { y = d => d.y } = $$props;
    	const writable_props = ['data', 'height', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bars> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Box,
    		default_x,
    		default_y,
    		data,
    		height,
    		x,
    		y
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('height' in $$props) $$invalidate(1, height = $$props.height);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, height, x, y, slots, $$scope];
    }

    class Bars extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { data: 0, height: 1, x: 2, y: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bars",
    			options,
    			id: create_fragment$c.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Bars> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Bars>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Bars>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Columns.svelte generated by Svelte v3.49.0 */

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    const get_default_slot_changes$7 = dirty => ({
    	value: dirty & /*data*/ 1,
    	last: dirty & /*data*/ 1
    });

    const get_default_slot_context$7 = ctx => ({
    	value: /*d*/ ctx[6],
    	first: /*i*/ ctx[8] === 0,
    	last: /*i*/ ctx[8] === /*data*/ ctx[0].length - 1
    });

    // (12:1) <Box x1="{x(d, i) - width/2}" x2="{x(d, i) + width/2}" y1={0} y2="{y(d, i)}">
    function create_default_slot$2(ctx) {
    	let t;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], get_default_slot_context$7);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			t = space();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, t, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, data*/ 33)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[5],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, get_default_slot_changes$7),
    						get_default_slot_context$7
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(12:1) <Box x1=\\\"{x(d, i) - width/2}\\\" x2=\\\"{x(d, i) + width/2}\\\" y1={0} y2=\\\"{y(d, i)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#each data as d, i}
    function create_each_block(ctx) {
    	let box;
    	let current;

    	box = new Box({
    			props: {
    				x1: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) - /*width*/ ctx[1] / 2,
    				x2: /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) + /*width*/ ctx[1] / 2,
    				y1: 0,
    				y2: /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]),
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(box.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(box, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const box_changes = {};
    			if (dirty & /*x, data, width*/ 7) box_changes.x1 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) - /*width*/ ctx[1] / 2;
    			if (dirty & /*x, data, width*/ 7) box_changes.x2 = /*x*/ ctx[2](/*d*/ ctx[6], /*i*/ ctx[8]) + /*width*/ ctx[1] / 2;
    			if (dirty & /*y, data*/ 9) box_changes.y2 = /*y*/ ctx[3](/*d*/ ctx[6], /*i*/ ctx[8]);

    			if (dirty & /*$$scope, data*/ 33) {
    				box_changes.$$scope = { dirty, ctx };
    			}

    			box.$set(box_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(box.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(box.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(box, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(11:0) {#each data as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*data*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*x, data, width, y, $$scope*/ 47) {
    				each_value = /*data*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Columns', slots, ['default']);
    	let { data } = $$props;
    	let { width = 1 } = $$props;
    	let { x = d => d.x } = $$props;
    	let { y = d => d.y } = $$props;
    	const writable_props = ['data', 'width', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Columns> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		Box,
    		default_x,
    		default_y,
    		data,
    		width,
    		x,
    		y
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(0, data = $$props.data);
    		if ('width' in $$props) $$invalidate(1, width = $$props.width);
    		if ('x' in $$props) $$invalidate(2, x = $$props.x);
    		if ('y' in $$props) $$invalidate(3, y = $$props.y);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [data, width, x, y, slots, $$scope];
    }

    class Columns extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { data: 0, width: 1, x: 2, y: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Columns",
    			options,
    			id: create_fragment$b.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[0] === undefined && !('data' in props)) {
    			console.warn("<Columns> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Columns>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Columns>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Svg.svelte generated by Svelte v3.49.0 */

    const file$3 = "node_modules/@sveltejs/pancake/components/Svg.svelte";

    function create_fragment$a(ctx) {
    	let svg;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			if (default_slot) default_slot.c();
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "preserveAspectRatio", "none");
    			attr_dev(svg, "class", "svelte-4s4ihd");
    			toggle_class(svg, "clip", /*clip*/ ctx[0]);
    			add_location(svg, file$3, 4, 0, 46);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);

    			if (default_slot) {
    				default_slot.m(svg, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*clip*/ 1) {
    				toggle_class(svg, "clip", /*clip*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, ['default']);
    	let { clip = false } = $$props;
    	const writable_props = ['clip'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ clip });

    	$$self.$inject_state = $$props => {
    		if ('clip' in $$props) $$invalidate(0, clip = $$props.clip);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [clip, $$scope, slots];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { clip: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get clip() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set clip(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgPolygon.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes$6 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$6 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$9(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$6);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$6),
    						get_default_slot_context$6
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgPolygon', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgPolygon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = `M${data.map((d, i) => `${$x_scale(x(d, i))},${$y_scale(y(d, i))}`).join('L')}`);
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgPolygon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgPolygon",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[3] === undefined && !('data' in props)) {
    			console.warn("<SvgPolygon> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgPolygon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgPolygon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgArea.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes$5 = dirty => ({ d: dirty & /*d*/ 128 });
    const get_default_slot_context$5 = ctx => ({ d: /*d*/ ctx[7] });

    // (17:0) <SvgPolygon data={points} let:d>
    function create_default_slot$1(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], get_default_slot_context$5);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 192)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, get_default_slot_changes$5),
    						get_default_slot_context$5
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(17:0) <SvgPolygon data={points} let:d>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let svgpolygon;
    	let current;

    	svgpolygon = new SvgPolygon({
    			props: {
    				data: /*points*/ ctx[0],
    				$$slots: {
    					default: [create_default_slot$1, ({ d }) => ({ 7: d }), ({ d }) => d ? 128 : 0]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(svgpolygon.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(svgpolygon, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const svgpolygon_changes = {};
    			if (dirty & /*points*/ 1) svgpolygon_changes.data = /*points*/ ctx[0];

    			if (dirty & /*$$scope, d*/ 192) {
    				svgpolygon_changes.$$scope = { dirty, ctx };
    			}

    			svgpolygon.$set(svgpolygon_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(svgpolygon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(svgpolygon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(svgpolygon, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let points;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgArea', slots, ['default']);
    	let { data } = $$props;
    	let { floor = 0 } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	const writable_props = ['data', 'floor', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgArea> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('floor' in $$props) $$invalidate(2, floor = $$props.floor);
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		SvgPolygon,
    		default_x,
    		default_y,
    		data,
    		floor,
    		x,
    		y,
    		points
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(1, data = $$props.data);
    		if ('floor' in $$props) $$invalidate(2, floor = $$props.floor);
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('points' in $$props) $$invalidate(0, points = $$props.points);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*x, data, floor, y*/ 30) {
    			$$invalidate(0, points = [
    				{ x: x(data[0], 0), y: floor },
    				...data.map((d, i) => ({ x: x(d, i), y: y(d, i) })),
    				{
    					x: x(data[data.length - 1], data.length - 1),
    					y: floor
    				}
    			]);
    		}
    	};

    	return [points, data, floor, x, y, slots, $$scope];
    }

    class SvgArea extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { data: 1, floor: 2, x: 3, y: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgArea",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[1] === undefined && !('data' in props)) {
    			console.warn("<SvgArea> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get floor() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set floor(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgLine.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes$4 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$4 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$7(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$4);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$4),
    						get_default_slot_context$4
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgLine', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgLine> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = 'M' + data.map((d, i) => `${$x_scale(x(d, i))},${$y_scale(y(d, i))}`).join('L'));
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgLine extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgLine",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[3] === undefined && !('data' in props)) {
    			console.warn("<SvgLine> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgLine>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgLine>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgRect.svelte generated by Svelte v3.49.0 */

    const get_default_slot_changes$3 = dirty => ({
    	x: dirty & /*left, right*/ 12,
    	y: dirty & /*top, bottom*/ 3,
    	width: dirty & /*right, left*/ 12,
    	height: dirty & /*bottom, top*/ 3
    });

    const get_default_slot_context$3 = ctx => ({
    	x: Math.min(/*left*/ ctx[3], /*right*/ ctx[2]),
    	y: Math.min(/*top*/ ctx[1], /*bottom*/ ctx[0]),
    	width: Math.abs(/*right*/ ctx[2] - /*left*/ ctx[3]),
    	height: Math.abs(/*bottom*/ ctx[0] - /*top*/ ctx[1])
    });

    function create_fragment$6(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context$3);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, left, right, top, bottom*/ 4111)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, get_default_slot_changes$3),
    						get_default_slot_context$3
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let left;
    	let right;
    	let top;
    	let bottom;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgRect', slots, ['default']);
    	let { x1 = 0 } = $$props;
    	let { x2 = 1 } = $$props;
    	let { y1 = 0 } = $$props;
    	let { y2 = 1 } = $$props;
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(11, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(10, $y_scale = value));
    	const writable_props = ['x1', 'x2', 'y1', 'y2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgRect> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x1' in $$props) $$invalidate(6, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(7, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(8, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(9, y2 = $$props.y2);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x1,
    		x2,
    		y1,
    		y2,
    		x_scale,
    		y_scale,
    		bottom,
    		top,
    		right,
    		left,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x1' in $$props) $$invalidate(6, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(7, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(8, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(9, y2 = $$props.y2);
    		if ('bottom' in $$props) $$invalidate(0, bottom = $$props.bottom);
    		if ('top' in $$props) $$invalidate(1, top = $$props.top);
    		if ('right' in $$props) $$invalidate(2, right = $$props.right);
    		if ('left' in $$props) $$invalidate(3, left = $$props.left);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x1*/ 2112) {
    			$$invalidate(3, left = $x_scale(x1));
    		}

    		if ($$self.$$.dirty & /*$x_scale, x2*/ 2176) {
    			$$invalidate(2, right = $x_scale(x2));
    		}

    		if ($$self.$$.dirty & /*$y_scale, y1*/ 1280) {
    			$$invalidate(1, top = $y_scale(y1));
    		}

    		if ($$self.$$.dirty & /*$y_scale, y2*/ 1536) {
    			$$invalidate(0, bottom = $y_scale(y2));
    		}
    	};

    	return [
    		bottom,
    		top,
    		right,
    		left,
    		x_scale,
    		y_scale,
    		x1,
    		x2,
    		y1,
    		y2,
    		$y_scale,
    		$x_scale,
    		$$scope,
    		slots
    	];
    }

    class SvgRect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { x1: 6, x2: 7, y1: 8, y2: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgRect",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get x1() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<SvgRect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<SvgRect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgScatterplot.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes$2 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$2 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[8], get_default_slot_context$2);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 257)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[8],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[8])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[8], dirty, get_default_slot_changes$2),
    						get_default_slot_context$2
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let d;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgScatterplot', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(7, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(6, $y_scale = value));
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	const writable_props = ['data', 'x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgScatterplot> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(8, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		default_x,
    		default_y,
    		x_scale,
    		y_scale,
    		data,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data, $x_scale, x, $y_scale, y*/ 248) {
    			$$invalidate(0, d = data.map((d, i) => {
    				const _x = $x_scale(x(d, i));
    				const _y = $y_scale(y(d, i));
    				return `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`;
    			}).join(' '));
    		}
    	};

    	return [d, x_scale, y_scale, data, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgScatterplot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { data: 3, x: 4, y: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgScatterplot",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[3] === undefined && !('data' in props)) {
    			console.warn("<SvgScatterplot> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgScatterplot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgScatterplot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/@sveltejs/pancake/components/SvgPoint.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes$1 = dirty => ({ d: dirty & /*d*/ 1 });
    const get_default_slot_context$1 = ctx => ({ d: /*d*/ ctx[0] });

    function create_fragment$4(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], get_default_slot_context$1);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, d*/ 129)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, get_default_slot_changes$1),
    						get_default_slot_context$1
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SvgPoint', slots, ['default']);
    	const { x_scale, y_scale } = getChartContext();
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(6, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(5, $y_scale = value));
    	let { x } = $$props;
    	let { y } = $$props;
    	let d;
    	const writable_props = ['x', 'y'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SvgPoint> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getChartContext,
    		x_scale,
    		y_scale,
    		x,
    		y,
    		d,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(3, x = $$props.x);
    		if ('y' in $$props) $$invalidate(4, y = $$props.y);
    		if ('d' in $$props) $$invalidate(0, d = $$props.d);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$x_scale, x, $y_scale, y*/ 120) {
    			{
    				const _x = $x_scale(x);
    				const _y = $y_scale(y);
    				$$invalidate(0, d = `M${_x} ${_y} A0 0 0 0 1 ${_x + 0.0001} ${_y + 0.0001}`);
    			}
    		}
    	};

    	return [d, x_scale, y_scale, x, y, $y_scale, $x_scale, $$scope, slots];
    }

    class SvgPoint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { x: 3, y: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SvgPoint",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*x*/ ctx[3] === undefined && !('x' in props)) {
    			console.warn("<SvgPoint> was created without expected prop 'x'");
    		}

    		if (/*y*/ ctx[4] === undefined && !('y' in props)) {
    			console.warn("<SvgPoint> was created without expected prop 'y'");
    		}
    	}

    	get x() {
    		throw new Error("<SvgPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<SvgPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<SvgPoint>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<SvgPoint>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class Node {
    	constructor(x0, y0, x1, y1) {
    		this.x0 = x0;
    		this.y0 = y0;
    		this.x1 = x1;
    		this.y1 = y1;
    		this.xm = (x0 + x1) / 2;
    		this.ym = (y0 + y1) / 2;

    		this.empty = true;
    		this.leaf = null;
    		this.children = null;
    	}

    	add(p) {
    		const { x0, y0, x1, y1, xm, ym, leaf } = this;

    		if (this.empty) {
    			this.leaf = p;
    			this.empty = false;
    			return;
    		}

    		if (leaf) {
    			// discard coincident points
    			if (leaf.x === p.x && leaf.y === p.y) return;

    			// need to subdivide
    			this.children = {
    				nw: new Node(x0, y0, xm, ym),
    				ne: new Node(xm, y0, x1, ym),
    				sw: new Node(x0, ym, xm, y1),
    				se: new Node(xm, ym, x1, y1)
    			};

    			this.leaf = null;
    			this.add(leaf);
    		}

    		const child = p.x < xm
    			? p.y < ym ? this.children.nw : this.children.sw
    			: p.y < ym ? this.children.ne : this.children.se;

    		child.add(p);
    	}
    }

    function build_tree(data, x, y, x_scale, y_scale) {
    	const points = data.map((d, i) => ({
    		d,
    		x: x_scale(x(d, i)),
    		y: y_scale(y(d, i))
    	}));

    	let x0 = Infinity;
    	let y0 = Infinity;
    	let x1 = -Infinity;
    	let y1 = -Infinity;

    	for (let i = 0; i < points.length; i += 1) {
    		const p = points[i];

    		if (p.x < x0) x0 = p.x;
    		if (p.y < y0) y0 = p.y;
    		if (p.x > x1) x1 = p.x;
    		if (p.y > y1) y1 = p.y;
    	}

    	const root = new Node(x0, y0, x1, y1);

    	for (let i = 0; i < points.length; i += 1) {
    		const p = points[i];
    		if (isNaN(p.x) || isNaN(p.y)) continue;

    		root.add(p);
    	}

    	return root;
    }

    class Quadtree {
    	constructor(data) {
    		this.data = data;
    		this.x = null;
    		this.y = null;
    		this.x_scale = null;
    		this.y_scale = null;
    	}

    	update(x, y, x_scale, y_scale) {
    		this.root = null;
    		this.x = x;
    		this.y = y;
    		this.x_scale = x_scale;
    		this.y_scale = y_scale;
    	}

    	find(left, top, width, height, radius) {
    		if (!this.root) this.root = build_tree(this.data, this.x, this.y, this.x_scale, this.y_scale);

    		const queue = [this.root];

    		let node;
    		let closest;
    		let min_d_squared = Infinity;

    		const x_to_px = x => x * width / 100;
    		const y_to_px = y => y * height / 100;

    		while (node = queue.pop()) {
    			if (node.empty) continue;

    			const left0 = x_to_px(node.x0);
    			const left1 = x_to_px(node.x1);
    			const top0 = y_to_px(node.y0);
    			const top1 = y_to_px(node.y1);

    			const out_of_bounds = (
    				left < (Math.min(left0, left1) - radius) ||
    				left > (Math.max(left0, left1) + radius) ||
    				top < (Math.min(top0, top1) - radius) ||
    				top > (Math.max(top0, top1) + radius)
    			);

    			if (out_of_bounds) continue;

    			if (node.leaf) {
    				const dl = x_to_px(node.leaf.x) - left;
    				const dt = y_to_px(node.leaf.y) - top;

    				const d_squared = (dl * dl + dt * dt);

    				if (d_squared < min_d_squared) {
    					closest = node.leaf.d;
    					min_d_squared = d_squared;
    				}
    			} else {
    				queue.push(
    					node.children.nw,
    					node.children.ne,
    					node.children.sw,
    					node.children.se
    				);
    			}
    		}

    		return min_d_squared < (radius * radius)
    			? closest
    			: null;
    	}
    }

    /* node_modules/@sveltejs/pancake/components/Quadtree.svelte generated by Svelte v3.49.0 */
    const get_default_slot_changes = dirty => ({ closest: dirty & /*closest*/ 1 });
    const get_default_slot_context = ctx => ({ closest: /*closest*/ ctx[0] });

    function create_fragment$3(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, closest*/ 262145)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[18],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[18], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let quadtree;
    	let $height;
    	let $width;
    	let $pointer;
    	let $y_scale;
    	let $x_scale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Quadtree', slots, ['default']);
    	let { data } = $$props;
    	let { x = default_x } = $$props;
    	let { y = default_y } = $$props;
    	let { radius = Infinity } = $$props;
    	let { closest = undefined } = $$props;
    	const { pointer, x_scale, y_scale, x_scale_inverse, y_scale_inverse, width, height } = getChartContext();
    	validate_store(pointer, 'pointer');
    	component_subscribe($$self, pointer, value => $$invalidate(15, $pointer = value));
    	validate_store(x_scale, 'x_scale');
    	component_subscribe($$self, x_scale, value => $$invalidate(17, $x_scale = value));
    	validate_store(y_scale, 'y_scale');
    	component_subscribe($$self, y_scale, value => $$invalidate(16, $y_scale = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(14, $width = value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(13, $height = value));
    	const dispatch = createEventDispatcher();

    	// track reference changes, to trigger updates sparingly
    	let prev_closest;

    	let next_closest;
    	const writable_props = ['data', 'x', 'y', 'radius', 'closest'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Quadtree> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(6, data = $$props.data);
    		if ('x' in $$props) $$invalidate(7, x = $$props.x);
    		if ('y' in $$props) $$invalidate(8, y = $$props.y);
    		if ('radius' in $$props) $$invalidate(9, radius = $$props.radius);
    		if ('closest' in $$props) $$invalidate(0, closest = $$props.closest);
    		if ('$$scope' in $$props) $$invalidate(18, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		getChartContext,
    		Quadtree,
    		default_x,
    		default_y,
    		data,
    		x,
    		y,
    		radius,
    		closest,
    		pointer,
    		x_scale,
    		y_scale,
    		x_scale_inverse,
    		y_scale_inverse,
    		width,
    		height,
    		dispatch,
    		prev_closest,
    		next_closest,
    		quadtree,
    		$height,
    		$width,
    		$pointer,
    		$y_scale,
    		$x_scale
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(6, data = $$props.data);
    		if ('x' in $$props) $$invalidate(7, x = $$props.x);
    		if ('y' in $$props) $$invalidate(8, y = $$props.y);
    		if ('radius' in $$props) $$invalidate(9, radius = $$props.radius);
    		if ('closest' in $$props) $$invalidate(0, closest = $$props.closest);
    		if ('prev_closest' in $$props) $$invalidate(10, prev_closest = $$props.prev_closest);
    		if ('next_closest' in $$props) $$invalidate(11, next_closest = $$props.next_closest);
    		if ('quadtree' in $$props) $$invalidate(12, quadtree = $$props.quadtree);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*data*/ 64) {
    			$$invalidate(12, quadtree = new Quadtree(data));
    		}

    		if ($$self.$$.dirty & /*quadtree, x, y, $x_scale, $y_scale*/ 201088) {
    			quadtree.update(x, y, $x_scale, $y_scale);
    		}

    		if ($$self.$$.dirty & /*$pointer, quadtree, $width, $height, radius*/ 61952) {
    			$$invalidate(11, next_closest = $pointer !== null
    			? quadtree.find($pointer.left, $pointer.top, $width, $height, radius)
    			: null);
    		}

    		if ($$self.$$.dirty & /*next_closest, prev_closest*/ 3072) {
    			if (next_closest !== prev_closest) {
    				$$invalidate(0, closest = $$invalidate(10, prev_closest = next_closest));
    			}
    		}
    	};

    	return [
    		closest,
    		pointer,
    		x_scale,
    		y_scale,
    		width,
    		height,
    		data,
    		x,
    		y,
    		radius,
    		prev_closest,
    		next_closest,
    		quadtree,
    		$height,
    		$width,
    		$pointer,
    		$y_scale,
    		$x_scale,
    		$$scope,
    		slots
    	];
    }

    class Quadtree_1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			data: 6,
    			x: 7,
    			y: 8,
    			radius: 9,
    			closest: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Quadtree_1",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[6] === undefined && !('data' in props)) {
    			console.warn("<Quadtree> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get radius() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set radius(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closest() {
    		throw new Error("<Quadtree>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closest(value) {
    		throw new Error("<Quadtree>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function stacks (data, keys, i = (d, i) => i) {
    	if (typeof i === 'string') {
    		const key = i;
    		i = d => d[key];
    	}

    	const stacks = data.map(d => {
    		const stack = keys.map(key => ({
    			key,
    			value: d[key],
    			i: i(d),
    			start: null,
    			end: null
    		}));

    		let acc = 0;

    		stack.forEach(d => {
    			d.start = acc;
    			d.end = acc += d.value;
    		});

    		return stack;
    	});

    	return keys.map(key => ({
    		key,
    		values: stacks.map(s => {
    			return s.find(d => d.key === key);
    		})
    	}));
    }

    var Pancake = /*#__PURE__*/Object.freeze({
        __proto__: null,
        Chart: Chart,
        Grid: Grid,
        Point: Point,
        Box: Box,
        Bars: Bars,
        Columns: Columns,
        Svg: Svg,
        SvgArea: SvgArea,
        SvgPolygon: SvgPolygon,
        SvgLine: SvgLine,
        SvgRect: SvgRect,
        SvgScatterplot: SvgScatterplot,
        SvgPoint: SvgPoint,
        Quadtree: Quadtree_1,
        stacks: stacks
    });

    /* src/Charts/LineChart.svelte generated by Svelte v3.49.0 */
    const file$2 = "src/Charts/LineChart.svelte";

    // (21:8) <Pancake.Grid horizontal count = {4} let:value>
    function create_default_slot_5(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1_value = /*value*/ ctx[9].toLocaleString() + "";
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text("$");
    			t1 = text(t1_value);
    			attr_dev(span, "class", "svelte-t1tgde");
    			add_location(span, file$2, 21, 46, 461);
    			attr_dev(div, "class", "grid-line horizontal svelte-t1tgde");
    			add_location(div, file$2, 21, 12, 427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 512 && t1_value !== (t1_value = /*value*/ ctx[9].toLocaleString() + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(21:8) <Pancake.Grid horizontal count = {4} let:value>",
    		ctx
    	});

    	return block;
    }

    // (24:8) <Pancake.Grid vertical count = {4} let:value>
    function create_default_slot_4(ctx) {
    	let span;
    	let t_value = String(new Date(/*value*/ ctx[9]).toLocaleTimeString()) + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "class", "x-label svelte-t1tgde");
    			add_location(span, file$2, 24, 12, 596);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 512 && t_value !== (t_value = String(new Date(/*value*/ ctx[9]).toLocaleTimeString()) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(24:8) <Pancake.Grid vertical count = {4} let:value>",
    		ctx
    	});

    	return block;
    }

    // (28:12) <Pancake.SvgLine data={data} let:d>
    function create_default_slot_3(ctx) {
    	let path;
    	let path_d_value;

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "data svelte-t1tgde");
    			attr_dev(path, "d", path_d_value = /*d*/ ctx[8]);
    			add_location(path, file$2, 28, 16, 784);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*d*/ 256 && path_d_value !== (path_d_value = /*d*/ ctx[8])) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(28:12) <Pancake.SvgLine data={data} let:d>",
    		ctx
    	});

    	return block;
    }

    // (27:8) <Pancake.Svg>
    function create_default_slot_2(ctx) {
    	let pancake_svgline;
    	let current;

    	pancake_svgline = new SvgLine({
    			props: {
    				data: /*data*/ ctx[5],
    				$$slots: {
    					default: [create_default_slot_3, ({ d }) => ({ 8: d }), ({ d }) => d ? 256 : 0]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pancake_svgline.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pancake_svgline, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pancake_svgline_changes = {};
    			if (dirty & /*data*/ 32) pancake_svgline_changes.data = /*data*/ ctx[5];

    			if (dirty & /*$$scope, d*/ 1280) {
    				pancake_svgline_changes.$$scope = { dirty, ctx };
    			}

    			pancake_svgline.$set(pancake_svgline_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_svgline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_svgline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pancake_svgline, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(27:8) <Pancake.Svg>",
    		ctx
    	});

    	return block;
    }

    // (33:8) {#if closest}
    function create_if_block(ctx) {
    	let pancake_point;
    	let current;

    	pancake_point = new Point({
    			props: {
    				x: /*closest*/ ctx[6].x,
    				y: /*closest*/ ctx[6].y,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(pancake_point.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pancake_point, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pancake_point_changes = {};
    			if (dirty & /*closest*/ 64) pancake_point_changes.x = /*closest*/ ctx[6].x;
    			if (dirty & /*closest*/ 64) pancake_point_changes.y = /*closest*/ ctx[6].y;

    			if (dirty & /*$$scope, closest, x1, x2*/ 1094) {
    				pancake_point_changes.$$scope = { dirty, ctx };
    			}

    			pancake_point.$set(pancake_point_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_point.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_point.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pancake_point, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(33:8) {#if closest}",
    		ctx
    	});

    	return block;
    }

    // (34:8) <Pancake.Point x={closest.x} y={closest.y}>
    function create_default_slot_1(ctx) {
    	let span0;
    	let t0;
    	let div;
    	let strong;
    	let t1;
    	let t2_value = /*closest*/ ctx[6].y.toLocaleString() + "";
    	let t2;
    	let t3;
    	let span1;
    	let t4_value = String(new Date(/*closest*/ ctx[6].x).toLocaleTimeString()) + "";
    	let t4;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			t0 = space();
    			div = element("div");
    			strong = element("strong");
    			t1 = text("$");
    			t2 = text(t2_value);
    			t3 = space();
    			span1 = element("span");
    			t4 = text(t4_value);
    			attr_dev(span0, "class", "annotation-point svelte-t1tgde");
    			add_location(span0, file$2, 34, 12, 956);
    			attr_dev(strong, "class", "svelte-t1tgde");
    			add_location(strong, file$2, 36, 16, 1121);
    			attr_dev(span1, "class", "svelte-t1tgde");
    			add_location(span1, file$2, 38, 16, 1247);
    			attr_dev(div, "class", "annotation svelte-t1tgde");
    			set_style(div, "transform", "translate(-" + 100 * ((/*closest*/ ctx[6].x - /*x1*/ ctx[1]) / (/*x2*/ ctx[2] - /*x1*/ ctx[1])) + "%,0)");
    			add_location(div, file$2, 35, 12, 1007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, strong);
    			append_dev(strong, t1);
    			append_dev(strong, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);
    			append_dev(span1, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*closest*/ 64 && t2_value !== (t2_value = /*closest*/ ctx[6].y.toLocaleString() + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*closest*/ 64 && t4_value !== (t4_value = String(new Date(/*closest*/ ctx[6].x).toLocaleTimeString()) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*closest, x1, x2*/ 70) {
    				set_style(div, "transform", "translate(-" + 100 * ((/*closest*/ ctx[6].x - /*x1*/ ctx[1]) / (/*x2*/ ctx[2] - /*x1*/ ctx[1])) + "%,0)");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(34:8) <Pancake.Point x={closest.x} y={closest.y}>",
    		ctx
    	});

    	return block;
    }

    // (20:4) <Pancake.Chart {x1} {x2} {y1} {y2}>
    function create_default_slot(ctx) {
    	let pancake_grid0;
    	let t0;
    	let pancake_grid1;
    	let t1;
    	let pancake_svg;
    	let t2;
    	let t3;
    	let pancake_quadtree;
    	let updating_closest;
    	let current;

    	pancake_grid0 = new Grid({
    			props: {
    				horizontal: true,
    				count: 4,
    				$$slots: {
    					default: [
    						create_default_slot_5,
    						({ value }) => ({ 9: value }),
    						({ value }) => value ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pancake_grid1 = new Grid({
    			props: {
    				vertical: true,
    				count: 4,
    				$$slots: {
    					default: [
    						create_default_slot_4,
    						({ value }) => ({ 9: value }),
    						({ value }) => value ? 512 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	pancake_svg = new Svg({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block = /*closest*/ ctx[6] && create_if_block(ctx);

    	function pancake_quadtree_closest_binding(value) {
    		/*pancake_quadtree_closest_binding*/ ctx[7](value);
    	}

    	let pancake_quadtree_props = { data: /*data*/ ctx[5] };

    	if (/*closest*/ ctx[6] !== void 0) {
    		pancake_quadtree_props.closest = /*closest*/ ctx[6];
    	}

    	pancake_quadtree = new Quadtree_1({
    			props: pancake_quadtree_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(pancake_quadtree, 'closest', pancake_quadtree_closest_binding));

    	const block = {
    		c: function create() {
    			create_component(pancake_grid0.$$.fragment);
    			t0 = space();
    			create_component(pancake_grid1.$$.fragment);
    			t1 = space();
    			create_component(pancake_svg.$$.fragment);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			create_component(pancake_quadtree.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pancake_grid0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(pancake_grid1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(pancake_svg, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(pancake_quadtree, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const pancake_grid0_changes = {};

    			if (dirty & /*$$scope, value*/ 1536) {
    				pancake_grid0_changes.$$scope = { dirty, ctx };
    			}

    			pancake_grid0.$set(pancake_grid0_changes);
    			const pancake_grid1_changes = {};

    			if (dirty & /*$$scope, value*/ 1536) {
    				pancake_grid1_changes.$$scope = { dirty, ctx };
    			}

    			pancake_grid1.$set(pancake_grid1_changes);
    			const pancake_svg_changes = {};

    			if (dirty & /*$$scope, data*/ 1056) {
    				pancake_svg_changes.$$scope = { dirty, ctx };
    			}

    			pancake_svg.$set(pancake_svg_changes);

    			if (/*closest*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*closest*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(t3.parentNode, t3);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			const pancake_quadtree_changes = {};
    			if (dirty & /*data*/ 32) pancake_quadtree_changes.data = /*data*/ ctx[5];

    			if (!updating_closest && dirty & /*closest*/ 64) {
    				updating_closest = true;
    				pancake_quadtree_changes.closest = /*closest*/ ctx[6];
    				add_flush_callback(() => updating_closest = false);
    			}

    			pancake_quadtree.$set(pancake_quadtree_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_grid0.$$.fragment, local);
    			transition_in(pancake_grid1.$$.fragment, local);
    			transition_in(pancake_svg.$$.fragment, local);
    			transition_in(if_block);
    			transition_in(pancake_quadtree.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_grid0.$$.fragment, local);
    			transition_out(pancake_grid1.$$.fragment, local);
    			transition_out(pancake_svg.$$.fragment, local);
    			transition_out(if_block);
    			transition_out(pancake_quadtree.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pancake_grid0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(pancake_grid1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(pancake_svg, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(pancake_quadtree, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(20:4) <Pancake.Chart {x1} {x2} {y1} {y2}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let h3;
    	let t0;
    	let t1;
    	let pancake_chart;
    	let current;

    	pancake_chart = new Chart({
    			props: {
    				x1: /*x1*/ ctx[1],
    				x2: /*x2*/ ctx[2],
    				y1: /*y1*/ ctx[3],
    				y2: /*y2*/ ctx[4],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(/*header*/ ctx[0]);
    			t1 = space();
    			create_component(pancake_chart.$$.fragment);
    			attr_dev(h3, "class", "header svelte-t1tgde");
    			add_location(h3, file$2, 18, 4, 286);
    			attr_dev(div, "class", "chart svelte-t1tgde");
    			add_location(div, file$2, 17, 0, 262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);
    			mount_component(pancake_chart, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*header*/ 1) set_data_dev(t0, /*header*/ ctx[0]);
    			const pancake_chart_changes = {};
    			if (dirty & /*x1*/ 2) pancake_chart_changes.x1 = /*x1*/ ctx[1];
    			if (dirty & /*x2*/ 4) pancake_chart_changes.x2 = /*x2*/ ctx[2];
    			if (dirty & /*y1*/ 8) pancake_chart_changes.y1 = /*y1*/ ctx[3];
    			if (dirty & /*y2*/ 16) pancake_chart_changes.y2 = /*y2*/ ctx[4];

    			if (dirty & /*$$scope, data, closest, x1, x2*/ 1126) {
    				pancake_chart_changes.$$scope = { dirty, ctx };
    			}

    			pancake_chart.$set(pancake_chart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pancake_chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pancake_chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(pancake_chart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LineChart', slots, []);
    	let { header = '' } = $$props;
    	let { x1 = +Infinity } = $$props;
    	let { x2 = -Infinity } = $$props;
    	let { y1 = +Infinity } = $$props;
    	let { y2 = -Infinity } = $$props;
    	let { data = [] } = $$props;
    	let closest;
    	const writable_props = ['header', 'x1', 'x2', 'y1', 'y2', 'data'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LineChart> was created with unknown prop '${key}'`);
    	});

    	function pancake_quadtree_closest_binding(value) {
    		closest = value;
    		$$invalidate(6, closest);
    	}

    	$$self.$$set = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('x1' in $$props) $$invalidate(1, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(2, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(3, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(4, y2 = $$props.y2);
    		if ('data' in $$props) $$invalidate(5, data = $$props.data);
    	};

    	$$self.$capture_state = () => ({
    		Pancake,
    		header,
    		x1,
    		x2,
    		y1,
    		y2,
    		data,
    		closest
    	});

    	$$self.$inject_state = $$props => {
    		if ('header' in $$props) $$invalidate(0, header = $$props.header);
    		if ('x1' in $$props) $$invalidate(1, x1 = $$props.x1);
    		if ('x2' in $$props) $$invalidate(2, x2 = $$props.x2);
    		if ('y1' in $$props) $$invalidate(3, y1 = $$props.y1);
    		if ('y2' in $$props) $$invalidate(4, y2 = $$props.y2);
    		if ('data' in $$props) $$invalidate(5, data = $$props.data);
    		if ('closest' in $$props) $$invalidate(6, closest = $$props.closest);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [header, x1, x2, y1, y2, data, closest, pancake_quadtree_closest_binding];
    }

    class LineChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			header: 0,
    			x1: 1,
    			x2: 2,
    			y1: 3,
    			y2: 4,
    			data: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LineChart",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get header() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set header(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x1() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x1(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x2() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x2(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y1() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y1(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y2() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y2(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<LineChart>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LineChart>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/LiveCoins.svelte generated by Svelte v3.49.0 */
    const file$1 = "src/LiveCoins.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let linechart0;
    	let updating_data;
    	let updating_x1;
    	let updating_x2;
    	let updating_y1;
    	let updating_y2;
    	let updating_header;
    	let t0;
    	let linechart1;
    	let updating_data_1;
    	let updating_x1_1;
    	let updating_x2_1;
    	let updating_y1_1;
    	let updating_y2_1;
    	let updating_header_1;
    	let t1;
    	let linechart2;
    	let updating_data_2;
    	let updating_x1_2;
    	let updating_x2_2;
    	let updating_y1_2;
    	let updating_y2_2;
    	let updating_header_2;
    	let t2;
    	let linechart3;
    	let updating_data_3;
    	let updating_x1_3;
    	let updating_x2_3;
    	let updating_y1_3;
    	let updating_y2_3;
    	let updating_header_3;
    	let t3;
    	let linechart4;
    	let updating_data_4;
    	let updating_x1_4;
    	let updating_x2_4;
    	let updating_y1_4;
    	let updating_y2_4;
    	let updating_header_4;
    	let t4;
    	let linechart5;
    	let updating_data_5;
    	let updating_x1_5;
    	let updating_x2_5;
    	let updating_y1_5;
    	let updating_y2_5;
    	let updating_header_5;
    	let current;

    	function linechart0_data_binding(value) {
    		/*linechart0_data_binding*/ ctx[31](value);
    	}

    	function linechart0_x1_binding(value) {
    		/*linechart0_x1_binding*/ ctx[32](value);
    	}

    	function linechart0_x2_binding(value) {
    		/*linechart0_x2_binding*/ ctx[33](value);
    	}

    	function linechart0_y1_binding(value) {
    		/*linechart0_y1_binding*/ ctx[34](value);
    	}

    	function linechart0_y2_binding(value) {
    		/*linechart0_y2_binding*/ ctx[35](value);
    	}

    	function linechart0_header_binding(value) {
    		/*linechart0_header_binding*/ ctx[36](value);
    	}

    	let linechart0_props = {};

    	if (/*btc_alldata*/ ctx[5] !== void 0) {
    		linechart0_props.data = /*btc_alldata*/ ctx[5];
    	}

    	if (/*btc_x1*/ ctx[1] !== void 0) {
    		linechart0_props.x1 = /*btc_x1*/ ctx[1];
    	}

    	if (/*btc_x2*/ ctx[2] !== void 0) {
    		linechart0_props.x2 = /*btc_x2*/ ctx[2];
    	}

    	if (/*btc_y1*/ ctx[3] !== void 0) {
    		linechart0_props.y1 = /*btc_y1*/ ctx[3];
    	}

    	if (/*btc_y2*/ ctx[4] !== void 0) {
    		linechart0_props.y2 = /*btc_y2*/ ctx[4];
    	}

    	if (/*coins*/ ctx[0][0] !== void 0) {
    		linechart0_props.header = /*coins*/ ctx[0][0];
    	}

    	linechart0 = new LineChart({ props: linechart0_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart0, 'data', linechart0_data_binding));
    	binding_callbacks.push(() => bind(linechart0, 'x1', linechart0_x1_binding));
    	binding_callbacks.push(() => bind(linechart0, 'x2', linechart0_x2_binding));
    	binding_callbacks.push(() => bind(linechart0, 'y1', linechart0_y1_binding));
    	binding_callbacks.push(() => bind(linechart0, 'y2', linechart0_y2_binding));
    	binding_callbacks.push(() => bind(linechart0, 'header', linechart0_header_binding));

    	function linechart1_data_binding(value) {
    		/*linechart1_data_binding*/ ctx[37](value);
    	}

    	function linechart1_x1_binding(value) {
    		/*linechart1_x1_binding*/ ctx[38](value);
    	}

    	function linechart1_x2_binding(value) {
    		/*linechart1_x2_binding*/ ctx[39](value);
    	}

    	function linechart1_y1_binding(value) {
    		/*linechart1_y1_binding*/ ctx[40](value);
    	}

    	function linechart1_y2_binding(value) {
    		/*linechart1_y2_binding*/ ctx[41](value);
    	}

    	function linechart1_header_binding(value) {
    		/*linechart1_header_binding*/ ctx[42](value);
    	}

    	let linechart1_props = {};

    	if (/*eth_alldata*/ ctx[10] !== void 0) {
    		linechart1_props.data = /*eth_alldata*/ ctx[10];
    	}

    	if (/*eth_x1*/ ctx[6] !== void 0) {
    		linechart1_props.x1 = /*eth_x1*/ ctx[6];
    	}

    	if (/*eth_x2*/ ctx[7] !== void 0) {
    		linechart1_props.x2 = /*eth_x2*/ ctx[7];
    	}

    	if (/*eth_y1*/ ctx[8] !== void 0) {
    		linechart1_props.y1 = /*eth_y1*/ ctx[8];
    	}

    	if (/*eth_y2*/ ctx[9] !== void 0) {
    		linechart1_props.y2 = /*eth_y2*/ ctx[9];
    	}

    	if (/*coins*/ ctx[0][1] !== void 0) {
    		linechart1_props.header = /*coins*/ ctx[0][1];
    	}

    	linechart1 = new LineChart({ props: linechart1_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart1, 'data', linechart1_data_binding));
    	binding_callbacks.push(() => bind(linechart1, 'x1', linechart1_x1_binding));
    	binding_callbacks.push(() => bind(linechart1, 'x2', linechart1_x2_binding));
    	binding_callbacks.push(() => bind(linechart1, 'y1', linechart1_y1_binding));
    	binding_callbacks.push(() => bind(linechart1, 'y2', linechart1_y2_binding));
    	binding_callbacks.push(() => bind(linechart1, 'header', linechart1_header_binding));

    	function linechart2_data_binding(value) {
    		/*linechart2_data_binding*/ ctx[43](value);
    	}

    	function linechart2_x1_binding(value) {
    		/*linechart2_x1_binding*/ ctx[44](value);
    	}

    	function linechart2_x2_binding(value) {
    		/*linechart2_x2_binding*/ ctx[45](value);
    	}

    	function linechart2_y1_binding(value) {
    		/*linechart2_y1_binding*/ ctx[46](value);
    	}

    	function linechart2_y2_binding(value) {
    		/*linechart2_y2_binding*/ ctx[47](value);
    	}

    	function linechart2_header_binding(value) {
    		/*linechart2_header_binding*/ ctx[48](value);
    	}

    	let linechart2_props = {};

    	if (/*ada_alldata*/ ctx[15] !== void 0) {
    		linechart2_props.data = /*ada_alldata*/ ctx[15];
    	}

    	if (/*ada_x1*/ ctx[11] !== void 0) {
    		linechart2_props.x1 = /*ada_x1*/ ctx[11];
    	}

    	if (/*ada_x2*/ ctx[12] !== void 0) {
    		linechart2_props.x2 = /*ada_x2*/ ctx[12];
    	}

    	if (/*ada_y1*/ ctx[13] !== void 0) {
    		linechart2_props.y1 = /*ada_y1*/ ctx[13];
    	}

    	if (/*ada_y2*/ ctx[14] !== void 0) {
    		linechart2_props.y2 = /*ada_y2*/ ctx[14];
    	}

    	if (/*coins*/ ctx[0][2] !== void 0) {
    		linechart2_props.header = /*coins*/ ctx[0][2];
    	}

    	linechart2 = new LineChart({ props: linechart2_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart2, 'data', linechart2_data_binding));
    	binding_callbacks.push(() => bind(linechart2, 'x1', linechart2_x1_binding));
    	binding_callbacks.push(() => bind(linechart2, 'x2', linechart2_x2_binding));
    	binding_callbacks.push(() => bind(linechart2, 'y1', linechart2_y1_binding));
    	binding_callbacks.push(() => bind(linechart2, 'y2', linechart2_y2_binding));
    	binding_callbacks.push(() => bind(linechart2, 'header', linechart2_header_binding));

    	function linechart3_data_binding(value) {
    		/*linechart3_data_binding*/ ctx[49](value);
    	}

    	function linechart3_x1_binding(value) {
    		/*linechart3_x1_binding*/ ctx[50](value);
    	}

    	function linechart3_x2_binding(value) {
    		/*linechart3_x2_binding*/ ctx[51](value);
    	}

    	function linechart3_y1_binding(value) {
    		/*linechart3_y1_binding*/ ctx[52](value);
    	}

    	function linechart3_y2_binding(value) {
    		/*linechart3_y2_binding*/ ctx[53](value);
    	}

    	function linechart3_header_binding(value) {
    		/*linechart3_header_binding*/ ctx[54](value);
    	}

    	let linechart3_props = {};

    	if (/*doge_alldata*/ ctx[20] !== void 0) {
    		linechart3_props.data = /*doge_alldata*/ ctx[20];
    	}

    	if (/*doge_x1*/ ctx[16] !== void 0) {
    		linechart3_props.x1 = /*doge_x1*/ ctx[16];
    	}

    	if (/*doge_x2*/ ctx[17] !== void 0) {
    		linechart3_props.x2 = /*doge_x2*/ ctx[17];
    	}

    	if (/*doge_y1*/ ctx[18] !== void 0) {
    		linechart3_props.y1 = /*doge_y1*/ ctx[18];
    	}

    	if (/*doge_y2*/ ctx[19] !== void 0) {
    		linechart3_props.y2 = /*doge_y2*/ ctx[19];
    	}

    	if (/*coins*/ ctx[0][3] !== void 0) {
    		linechart3_props.header = /*coins*/ ctx[0][3];
    	}

    	linechart3 = new LineChart({ props: linechart3_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart3, 'data', linechart3_data_binding));
    	binding_callbacks.push(() => bind(linechart3, 'x1', linechart3_x1_binding));
    	binding_callbacks.push(() => bind(linechart3, 'x2', linechart3_x2_binding));
    	binding_callbacks.push(() => bind(linechart3, 'y1', linechart3_y1_binding));
    	binding_callbacks.push(() => bind(linechart3, 'y2', linechart3_y2_binding));
    	binding_callbacks.push(() => bind(linechart3, 'header', linechart3_header_binding));

    	function linechart4_data_binding(value) {
    		/*linechart4_data_binding*/ ctx[55](value);
    	}

    	function linechart4_x1_binding(value) {
    		/*linechart4_x1_binding*/ ctx[56](value);
    	}

    	function linechart4_x2_binding(value) {
    		/*linechart4_x2_binding*/ ctx[57](value);
    	}

    	function linechart4_y1_binding(value) {
    		/*linechart4_y1_binding*/ ctx[58](value);
    	}

    	function linechart4_y2_binding(value) {
    		/*linechart4_y2_binding*/ ctx[59](value);
    	}

    	function linechart4_header_binding(value) {
    		/*linechart4_header_binding*/ ctx[60](value);
    	}

    	let linechart4_props = {};

    	if (/*avax_alldata*/ ctx[25] !== void 0) {
    		linechart4_props.data = /*avax_alldata*/ ctx[25];
    	}

    	if (/*avax_x1*/ ctx[21] !== void 0) {
    		linechart4_props.x1 = /*avax_x1*/ ctx[21];
    	}

    	if (/*avax_x2*/ ctx[22] !== void 0) {
    		linechart4_props.x2 = /*avax_x2*/ ctx[22];
    	}

    	if (/*avax_y1*/ ctx[23] !== void 0) {
    		linechart4_props.y1 = /*avax_y1*/ ctx[23];
    	}

    	if (/*avax_y2*/ ctx[24] !== void 0) {
    		linechart4_props.y2 = /*avax_y2*/ ctx[24];
    	}

    	if (/*coins*/ ctx[0][4] !== void 0) {
    		linechart4_props.header = /*coins*/ ctx[0][4];
    	}

    	linechart4 = new LineChart({ props: linechart4_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart4, 'data', linechart4_data_binding));
    	binding_callbacks.push(() => bind(linechart4, 'x1', linechart4_x1_binding));
    	binding_callbacks.push(() => bind(linechart4, 'x2', linechart4_x2_binding));
    	binding_callbacks.push(() => bind(linechart4, 'y1', linechart4_y1_binding));
    	binding_callbacks.push(() => bind(linechart4, 'y2', linechart4_y2_binding));
    	binding_callbacks.push(() => bind(linechart4, 'header', linechart4_header_binding));

    	function linechart5_data_binding(value) {
    		/*linechart5_data_binding*/ ctx[61](value);
    	}

    	function linechart5_x1_binding(value) {
    		/*linechart5_x1_binding*/ ctx[62](value);
    	}

    	function linechart5_x2_binding(value) {
    		/*linechart5_x2_binding*/ ctx[63](value);
    	}

    	function linechart5_y1_binding(value) {
    		/*linechart5_y1_binding*/ ctx[64](value);
    	}

    	function linechart5_y2_binding(value) {
    		/*linechart5_y2_binding*/ ctx[65](value);
    	}

    	function linechart5_header_binding(value) {
    		/*linechart5_header_binding*/ ctx[66](value);
    	}

    	let linechart5_props = {};

    	if (/*sol_alldata*/ ctx[30] !== void 0) {
    		linechart5_props.data = /*sol_alldata*/ ctx[30];
    	}

    	if (/*sol_x1*/ ctx[26] !== void 0) {
    		linechart5_props.x1 = /*sol_x1*/ ctx[26];
    	}

    	if (/*sol_x2*/ ctx[27] !== void 0) {
    		linechart5_props.x2 = /*sol_x2*/ ctx[27];
    	}

    	if (/*sol_y1*/ ctx[28] !== void 0) {
    		linechart5_props.y1 = /*sol_y1*/ ctx[28];
    	}

    	if (/*sol_y2*/ ctx[29] !== void 0) {
    		linechart5_props.y2 = /*sol_y2*/ ctx[29];
    	}

    	if (/*coins*/ ctx[0][5] !== void 0) {
    		linechart5_props.header = /*coins*/ ctx[0][5];
    	}

    	linechart5 = new LineChart({ props: linechart5_props, $$inline: true });
    	binding_callbacks.push(() => bind(linechart5, 'data', linechart5_data_binding));
    	binding_callbacks.push(() => bind(linechart5, 'x1', linechart5_x1_binding));
    	binding_callbacks.push(() => bind(linechart5, 'x2', linechart5_x2_binding));
    	binding_callbacks.push(() => bind(linechart5, 'y1', linechart5_y1_binding));
    	binding_callbacks.push(() => bind(linechart5, 'y2', linechart5_y2_binding));
    	binding_callbacks.push(() => bind(linechart5, 'header', linechart5_header_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(linechart0.$$.fragment);
    			t0 = space();
    			create_component(linechart1.$$.fragment);
    			t1 = space();
    			create_component(linechart2.$$.fragment);
    			t2 = space();
    			create_component(linechart3.$$.fragment);
    			t3 = space();
    			create_component(linechart4.$$.fragment);
    			t4 = space();
    			create_component(linechart5.$$.fragment);
    			attr_dev(div, "class", "chart-grid twoXfour svelte-8a3hsb");
    			add_location(div, file$1, 213, 0, 9927);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(linechart0, div, null);
    			append_dev(div, t0);
    			mount_component(linechart1, div, null);
    			append_dev(div, t1);
    			mount_component(linechart2, div, null);
    			append_dev(div, t2);
    			mount_component(linechart3, div, null);
    			append_dev(div, t3);
    			mount_component(linechart4, div, null);
    			append_dev(div, t4);
    			mount_component(linechart5, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const linechart0_changes = {};

    			if (!updating_data && dirty[0] & /*btc_alldata*/ 32) {
    				updating_data = true;
    				linechart0_changes.data = /*btc_alldata*/ ctx[5];
    				add_flush_callback(() => updating_data = false);
    			}

    			if (!updating_x1 && dirty[0] & /*btc_x1*/ 2) {
    				updating_x1 = true;
    				linechart0_changes.x1 = /*btc_x1*/ ctx[1];
    				add_flush_callback(() => updating_x1 = false);
    			}

    			if (!updating_x2 && dirty[0] & /*btc_x2*/ 4) {
    				updating_x2 = true;
    				linechart0_changes.x2 = /*btc_x2*/ ctx[2];
    				add_flush_callback(() => updating_x2 = false);
    			}

    			if (!updating_y1 && dirty[0] & /*btc_y1*/ 8) {
    				updating_y1 = true;
    				linechart0_changes.y1 = /*btc_y1*/ ctx[3];
    				add_flush_callback(() => updating_y1 = false);
    			}

    			if (!updating_y2 && dirty[0] & /*btc_y2*/ 16) {
    				updating_y2 = true;
    				linechart0_changes.y2 = /*btc_y2*/ ctx[4];
    				add_flush_callback(() => updating_y2 = false);
    			}

    			if (!updating_header && dirty[0] & /*coins*/ 1) {
    				updating_header = true;
    				linechart0_changes.header = /*coins*/ ctx[0][0];
    				add_flush_callback(() => updating_header = false);
    			}

    			linechart0.$set(linechart0_changes);
    			const linechart1_changes = {};

    			if (!updating_data_1 && dirty[0] & /*eth_alldata*/ 1024) {
    				updating_data_1 = true;
    				linechart1_changes.data = /*eth_alldata*/ ctx[10];
    				add_flush_callback(() => updating_data_1 = false);
    			}

    			if (!updating_x1_1 && dirty[0] & /*eth_x1*/ 64) {
    				updating_x1_1 = true;
    				linechart1_changes.x1 = /*eth_x1*/ ctx[6];
    				add_flush_callback(() => updating_x1_1 = false);
    			}

    			if (!updating_x2_1 && dirty[0] & /*eth_x2*/ 128) {
    				updating_x2_1 = true;
    				linechart1_changes.x2 = /*eth_x2*/ ctx[7];
    				add_flush_callback(() => updating_x2_1 = false);
    			}

    			if (!updating_y1_1 && dirty[0] & /*eth_y1*/ 256) {
    				updating_y1_1 = true;
    				linechart1_changes.y1 = /*eth_y1*/ ctx[8];
    				add_flush_callback(() => updating_y1_1 = false);
    			}

    			if (!updating_y2_1 && dirty[0] & /*eth_y2*/ 512) {
    				updating_y2_1 = true;
    				linechart1_changes.y2 = /*eth_y2*/ ctx[9];
    				add_flush_callback(() => updating_y2_1 = false);
    			}

    			if (!updating_header_1 && dirty[0] & /*coins*/ 1) {
    				updating_header_1 = true;
    				linechart1_changes.header = /*coins*/ ctx[0][1];
    				add_flush_callback(() => updating_header_1 = false);
    			}

    			linechart1.$set(linechart1_changes);
    			const linechart2_changes = {};

    			if (!updating_data_2 && dirty[0] & /*ada_alldata*/ 32768) {
    				updating_data_2 = true;
    				linechart2_changes.data = /*ada_alldata*/ ctx[15];
    				add_flush_callback(() => updating_data_2 = false);
    			}

    			if (!updating_x1_2 && dirty[0] & /*ada_x1*/ 2048) {
    				updating_x1_2 = true;
    				linechart2_changes.x1 = /*ada_x1*/ ctx[11];
    				add_flush_callback(() => updating_x1_2 = false);
    			}

    			if (!updating_x2_2 && dirty[0] & /*ada_x2*/ 4096) {
    				updating_x2_2 = true;
    				linechart2_changes.x2 = /*ada_x2*/ ctx[12];
    				add_flush_callback(() => updating_x2_2 = false);
    			}

    			if (!updating_y1_2 && dirty[0] & /*ada_y1*/ 8192) {
    				updating_y1_2 = true;
    				linechart2_changes.y1 = /*ada_y1*/ ctx[13];
    				add_flush_callback(() => updating_y1_2 = false);
    			}

    			if (!updating_y2_2 && dirty[0] & /*ada_y2*/ 16384) {
    				updating_y2_2 = true;
    				linechart2_changes.y2 = /*ada_y2*/ ctx[14];
    				add_flush_callback(() => updating_y2_2 = false);
    			}

    			if (!updating_header_2 && dirty[0] & /*coins*/ 1) {
    				updating_header_2 = true;
    				linechart2_changes.header = /*coins*/ ctx[0][2];
    				add_flush_callback(() => updating_header_2 = false);
    			}

    			linechart2.$set(linechart2_changes);
    			const linechart3_changes = {};

    			if (!updating_data_3 && dirty[0] & /*doge_alldata*/ 1048576) {
    				updating_data_3 = true;
    				linechart3_changes.data = /*doge_alldata*/ ctx[20];
    				add_flush_callback(() => updating_data_3 = false);
    			}

    			if (!updating_x1_3 && dirty[0] & /*doge_x1*/ 65536) {
    				updating_x1_3 = true;
    				linechart3_changes.x1 = /*doge_x1*/ ctx[16];
    				add_flush_callback(() => updating_x1_3 = false);
    			}

    			if (!updating_x2_3 && dirty[0] & /*doge_x2*/ 131072) {
    				updating_x2_3 = true;
    				linechart3_changes.x2 = /*doge_x2*/ ctx[17];
    				add_flush_callback(() => updating_x2_3 = false);
    			}

    			if (!updating_y1_3 && dirty[0] & /*doge_y1*/ 262144) {
    				updating_y1_3 = true;
    				linechart3_changes.y1 = /*doge_y1*/ ctx[18];
    				add_flush_callback(() => updating_y1_3 = false);
    			}

    			if (!updating_y2_3 && dirty[0] & /*doge_y2*/ 524288) {
    				updating_y2_3 = true;
    				linechart3_changes.y2 = /*doge_y2*/ ctx[19];
    				add_flush_callback(() => updating_y2_3 = false);
    			}

    			if (!updating_header_3 && dirty[0] & /*coins*/ 1) {
    				updating_header_3 = true;
    				linechart3_changes.header = /*coins*/ ctx[0][3];
    				add_flush_callback(() => updating_header_3 = false);
    			}

    			linechart3.$set(linechart3_changes);
    			const linechart4_changes = {};

    			if (!updating_data_4 && dirty[0] & /*avax_alldata*/ 33554432) {
    				updating_data_4 = true;
    				linechart4_changes.data = /*avax_alldata*/ ctx[25];
    				add_flush_callback(() => updating_data_4 = false);
    			}

    			if (!updating_x1_4 && dirty[0] & /*avax_x1*/ 2097152) {
    				updating_x1_4 = true;
    				linechart4_changes.x1 = /*avax_x1*/ ctx[21];
    				add_flush_callback(() => updating_x1_4 = false);
    			}

    			if (!updating_x2_4 && dirty[0] & /*avax_x2*/ 4194304) {
    				updating_x2_4 = true;
    				linechart4_changes.x2 = /*avax_x2*/ ctx[22];
    				add_flush_callback(() => updating_x2_4 = false);
    			}

    			if (!updating_y1_4 && dirty[0] & /*avax_y1*/ 8388608) {
    				updating_y1_4 = true;
    				linechart4_changes.y1 = /*avax_y1*/ ctx[23];
    				add_flush_callback(() => updating_y1_4 = false);
    			}

    			if (!updating_y2_4 && dirty[0] & /*avax_y2*/ 16777216) {
    				updating_y2_4 = true;
    				linechart4_changes.y2 = /*avax_y2*/ ctx[24];
    				add_flush_callback(() => updating_y2_4 = false);
    			}

    			if (!updating_header_4 && dirty[0] & /*coins*/ 1) {
    				updating_header_4 = true;
    				linechart4_changes.header = /*coins*/ ctx[0][4];
    				add_flush_callback(() => updating_header_4 = false);
    			}

    			linechart4.$set(linechart4_changes);
    			const linechart5_changes = {};

    			if (!updating_data_5 && dirty[0] & /*sol_alldata*/ 1073741824) {
    				updating_data_5 = true;
    				linechart5_changes.data = /*sol_alldata*/ ctx[30];
    				add_flush_callback(() => updating_data_5 = false);
    			}

    			if (!updating_x1_5 && dirty[0] & /*sol_x1*/ 67108864) {
    				updating_x1_5 = true;
    				linechart5_changes.x1 = /*sol_x1*/ ctx[26];
    				add_flush_callback(() => updating_x1_5 = false);
    			}

    			if (!updating_x2_5 && dirty[0] & /*sol_x2*/ 134217728) {
    				updating_x2_5 = true;
    				linechart5_changes.x2 = /*sol_x2*/ ctx[27];
    				add_flush_callback(() => updating_x2_5 = false);
    			}

    			if (!updating_y1_5 && dirty[0] & /*sol_y1*/ 268435456) {
    				updating_y1_5 = true;
    				linechart5_changes.y1 = /*sol_y1*/ ctx[28];
    				add_flush_callback(() => updating_y1_5 = false);
    			}

    			if (!updating_y2_5 && dirty[0] & /*sol_y2*/ 536870912) {
    				updating_y2_5 = true;
    				linechart5_changes.y2 = /*sol_y2*/ ctx[29];
    				add_flush_callback(() => updating_y2_5 = false);
    			}

    			if (!updating_header_5 && dirty[0] & /*coins*/ 1) {
    				updating_header_5 = true;
    				linechart5_changes.header = /*coins*/ ctx[0][5];
    				add_flush_callback(() => updating_header_5 = false);
    			}

    			linechart5.$set(linechart5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(linechart0.$$.fragment, local);
    			transition_in(linechart1.$$.fragment, local);
    			transition_in(linechart2.$$.fragment, local);
    			transition_in(linechart3.$$.fragment, local);
    			transition_in(linechart4.$$.fragment, local);
    			transition_in(linechart5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(linechart0.$$.fragment, local);
    			transition_out(linechart1.$$.fragment, local);
    			transition_out(linechart2.$$.fragment, local);
    			transition_out(linechart3.$$.fragment, local);
    			transition_out(linechart4.$$.fragment, local);
    			transition_out(linechart5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(linechart0);
    			destroy_component(linechart1);
    			destroy_component(linechart2);
    			destroy_component(linechart3);
    			destroy_component(linechart4);
    			destroy_component(linechart5);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LiveCoins', slots, []);

    	let coins = [
    		'BTC - Bitcoin',
    		'ETH - Ethereum',
    		'ADA - Cardano',
    		'DOGE - Dogecoin',
    		'AVAX - Avalanche',
    		'SOL - Solano',
    		'BNB - Binance Coin',
    		'MATIC - Polygon'
    	];

    	let btc_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    	let btc_x1 = +Infinity;
    	let btc_x2 = -Infinity;
    	let btc_y1 = +Infinity;
    	let btc_y2 = -Infinity;
    	let btc_alldata = [];
    	let eth_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    	let eth_x1 = +Infinity;
    	let eth_x2 = -Infinity;
    	let eth_y1 = +Infinity;
    	let eth_y2 = -Infinity;
    	let eth_alldata = [];
    	let ada_socket = new WebSocket('wss://stream.binance.com:9443/ws/adausdt@trade');
    	let ada_x1 = +Infinity;
    	let ada_x2 = -Infinity;
    	let ada_y1 = +Infinity;
    	let ada_y2 = -Infinity;
    	let ada_alldata = [];
    	let doge_socket = new WebSocket('wss://stream.binance.com:9443/ws/dogeusdt@trade');
    	let doge_x1 = +Infinity;
    	let doge_x2 = -Infinity;
    	let doge_y1 = +Infinity;
    	let doge_y2 = -Infinity;
    	let doge_alldata = [];
    	let avax_socket = new WebSocket('wss://stream.binance.com:9443/ws/avaxusdt@trade');
    	let avax_x1 = +Infinity;
    	let avax_x2 = -Infinity;
    	let avax_y1 = +Infinity;
    	let avax_y2 = -Infinity;
    	let avax_alldata = [];
    	let sol_socket = new WebSocket('wss://stream.binance.com:9443/ws/solusdt@trade');
    	let sol_x1 = +Infinity;
    	let sol_x2 = -Infinity;
    	let sol_y1 = +Infinity;
    	let sol_y2 = -Infinity;
    	let sol_alldata = [];

    	// let bnb_socket = new WebSocket('wss://stream.binance.com:9443/ws/bnbusdt@trade');
    	// let bnb_x1 = +Infinity;
    	// let bnb_x2 = -Infinity;
    	// let bnb_y1 = +Infinity;
    	// let bnb_y2 = -Infinity;
    	// let bnb_alldata = [];
    	// let matic_socket = new WebSocket('wss://stream.binance.com:9443/ws/maticusdt@trade');
    	// let matic_x1 = +Infinity;
    	// let matic_x2 = -Infinity;
    	// let matic_y1 = +Infinity;
    	// let matic_y2 = -Infinity;
    	// let matic_alldata = [];
    	// let usdt_socket = new WebSocket('wss://stream.binance.com:9443/ws/usdtusd@trade');
    	// let usdt_x1 = +Infinity;
    	// let usdt_x2 = -Infinity;
    	// let usdt_y1 = +Infinity;
    	// let usdt_y2 = -Infinity;
    	// let usdt_alldata = [];
    	// let avax_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    	// let sol_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    	// let bnb_socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@trade');
    	// let usdt_socket = new WebSocket('wss://stream.binance.com:9443/ws/ethusdt@trade');
    	/* PAYLOAD STRUCTURE
    {
        "e": "trade",     // Event type
        "E": 123456789,   // Event time
        "s": "BNBBTC",    // Symbol
        "t": 12345,       // Trade ID
        "p": "0.001",     // Price
        "q": "100",       // Quantity
        "b": 88,          // Buyer order ID
        "a": 50,          // Seller order ID
        "T": 123456785,   // Trade time
        "m": true,        // Is the buyer the market maker?
        "M": true         // Ignore
    }
    */
    	// let socket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker');
    	//let subscribemsg = JSON.parse('{"method": "SUBSCRIBE","params": ["btcusdt@trade"],"id": 1}');
    	btc_socket.onmessage = function (event) {
    		var btc_data = JSON.parse(event.data);

    		let btc_data_dict = {
    			'x': btc_data['E'],
    			'y': parseFloat(btc_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (btc_data_dict.x > btc_x2) $$invalidate(2, btc_x2 = btc_data_dict.x);

    		if (btc_data_dict.x < btc_x1) $$invalidate(1, btc_x1 = btc_data_dict.x);
    		if (btc_data_dict.y > btc_y2) $$invalidate(4, btc_y2 = btc_data_dict.y);
    		if (btc_data_dict.y < btc_y1) $$invalidate(3, btc_y1 = btc_data_dict.y);

    		// if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
    		if (btc_x2 - btc_x1 > 86400000) $$invalidate(1, btc_x1 = btc_x2 - 86400000);

    		btc_alldata.push(btc_data_dict);
    		$$invalidate(5, btc_alldata = [...btc_alldata.filter(data => data.x > btc_x1)]);
    	}; // console.log(btc_alldata[btc_alldata.length-1]);

    	eth_socket.onmessage = function (event) {
    		var eth_data = JSON.parse(event.data);

    		let eth_data_dict = {
    			'x': eth_data['E'],
    			'y': parseFloat(eth_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (eth_data_dict.x > eth_x2) $$invalidate(7, eth_x2 = eth_data_dict.x);

    		if (eth_data_dict.x < eth_x1) $$invalidate(6, eth_x1 = eth_data_dict.x);
    		if (eth_data_dict.y > eth_y2) $$invalidate(9, eth_y2 = eth_data_dict.y);
    		if (eth_data_dict.y < eth_y1) $$invalidate(8, eth_y1 = eth_data_dict.y);

    		// if (eth_x2-eth_x1 > 60000) eth_x1 = eth_x2-60000
    		if (eth_x2 - eth_x1 > 86400000) $$invalidate(6, eth_x1 = eth_x2 - 86400000);

    		eth_alldata.push(eth_data_dict);
    		$$invalidate(10, eth_alldata = [...eth_alldata.filter(data => data.x > eth_x1)]);
    	}; // console.log(eth_alldata[eth_alldata.length-1]);

    	ada_socket.onmessage = function (event) {
    		var ada_data = JSON.parse(event.data);

    		let ada_data_dict = {
    			'x': ada_data['E'],
    			'y': parseFloat(ada_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (ada_data_dict.x > ada_x2) $$invalidate(12, ada_x2 = ada_data_dict.x);

    		if (ada_data_dict.x < ada_x1) $$invalidate(11, ada_x1 = ada_data_dict.x);
    		if (ada_data_dict.y > ada_y2) $$invalidate(14, ada_y2 = ada_data_dict.y);
    		if (ada_data_dict.y < ada_y1) $$invalidate(13, ada_y1 = ada_data_dict.y);

    		// if (btc_x2-btc_x1>60000) btc_x1 = btc_x2-60000
    		if (ada_x2 - ada_x1 > 86400000) $$invalidate(11, ada_x1 = ada_x2 - 86400000);

    		ada_alldata.push(ada_data_dict);
    		$$invalidate(15, ada_alldata = [...ada_alldata.filter(data => data.x > btc_x1)]);
    	}; // console.log(ada_alldata[ada_alldata.length-1]);

    	doge_socket.onmessage = function (event) {
    		var doge_data = JSON.parse(event.data);

    		let doge_data_dict = {
    			'x': doge_data['E'],
    			'y': parseFloat(doge_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (doge_data_dict.x > doge_x2) $$invalidate(17, doge_x2 = doge_data_dict.x);

    		if (doge_data_dict.x < doge_x1) $$invalidate(16, doge_x1 = doge_data_dict.x);
    		if (doge_data_dict.y > doge_y2) $$invalidate(19, doge_y2 = doge_data_dict.y);
    		if (doge_data_dict.y < doge_y1) $$invalidate(18, doge_y1 = doge_data_dict.y);

    		// if (doge_x2-doge_x1>60000) doge_x1 = doge_x2-60000
    		if (doge_x2 - doge_x1 > 86400000) $$invalidate(16, doge_x1 = doge_x2 - 86400000);

    		doge_alldata.push(doge_data_dict);
    		$$invalidate(20, doge_alldata = [...doge_alldata.filter(data => data.x > doge_x1)]);
    	}; // console.log(doge_alldata[doge_alldata.length-1]);

    	avax_socket.onmessage = function (event) {
    		var avax_data = JSON.parse(event.data);

    		let avax_data_dict = {
    			'x': avax_data['E'],
    			'y': parseFloat(avax_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (avax_data_dict.x > avax_x2) $$invalidate(22, avax_x2 = avax_data_dict.x);

    		if (avax_data_dict.x < avax_x1) $$invalidate(21, avax_x1 = avax_data_dict.x);
    		if (avax_data_dict.y > avax_y2) $$invalidate(24, avax_y2 = avax_data_dict.y);
    		if (avax_data_dict.y < avax_y1) $$invalidate(23, avax_y1 = avax_data_dict.y);

    		// if (avax_x2-avax_x1>60000) avax_x1 = avax_x2-60000
    		if (avax_x2 - avax_x1 > 86400000) $$invalidate(21, avax_x1 = avax_x2 - 86400000);

    		avax_alldata.push(avax_data_dict);
    		$$invalidate(25, avax_alldata = [...avax_alldata.filter(data => data.x > avax_x1)]);
    	}; // console.log(avax_alldata[avax_alldata.length-1]);

    	sol_socket.onmessage = function (event) {
    		var sol_data = JSON.parse(event.data);

    		let sol_data_dict = {
    			'x': sol_data['E'],
    			'y': parseFloat(sol_data['p'])
    		};

    		// let dataDict = {'x':data['E'], 'y':parseFloat(data['c'])}
    		if (sol_data_dict.x > sol_x2) $$invalidate(27, sol_x2 = sol_data_dict.x);

    		if (sol_data_dict.x < sol_x1) $$invalidate(26, sol_x1 = sol_data_dict.x);
    		if (sol_data_dict.y > sol_y2) $$invalidate(29, sol_y2 = sol_data_dict.y);
    		if (sol_data_dict.y < sol_y1) $$invalidate(28, sol_y1 = sol_data_dict.y);

    		// if (sol_x2-sol_x1>60000) sol_x1 = sol_x2-60000
    		if (sol_x2 - sol_x1 > 86400000) $$invalidate(26, sol_x1 = sol_x2 - 86400000);

    		sol_alldata.push(sol_data_dict);
    		$$invalidate(30, sol_alldata = [...sol_alldata.filter(data => data.x > sol_x1)]);
    	}; // console.log(sol_alldata[sol_alldata.length-1]);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LiveCoins> was created with unknown prop '${key}'`);
    	});

    	function linechart0_data_binding(value) {
    		btc_alldata = value;
    		$$invalidate(5, btc_alldata);
    	}

    	function linechart0_x1_binding(value) {
    		btc_x1 = value;
    		$$invalidate(1, btc_x1);
    	}

    	function linechart0_x2_binding(value) {
    		btc_x2 = value;
    		$$invalidate(2, btc_x2);
    	}

    	function linechart0_y1_binding(value) {
    		btc_y1 = value;
    		$$invalidate(3, btc_y1);
    	}

    	function linechart0_y2_binding(value) {
    		btc_y2 = value;
    		$$invalidate(4, btc_y2);
    	}

    	function linechart0_header_binding(value) {
    		if ($$self.$$.not_equal(coins[0], value)) {
    			coins[0] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	function linechart1_data_binding(value) {
    		eth_alldata = value;
    		$$invalidate(10, eth_alldata);
    	}

    	function linechart1_x1_binding(value) {
    		eth_x1 = value;
    		$$invalidate(6, eth_x1);
    	}

    	function linechart1_x2_binding(value) {
    		eth_x2 = value;
    		$$invalidate(7, eth_x2);
    	}

    	function linechart1_y1_binding(value) {
    		eth_y1 = value;
    		$$invalidate(8, eth_y1);
    	}

    	function linechart1_y2_binding(value) {
    		eth_y2 = value;
    		$$invalidate(9, eth_y2);
    	}

    	function linechart1_header_binding(value) {
    		if ($$self.$$.not_equal(coins[1], value)) {
    			coins[1] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	function linechart2_data_binding(value) {
    		ada_alldata = value;
    		$$invalidate(15, ada_alldata);
    	}

    	function linechart2_x1_binding(value) {
    		ada_x1 = value;
    		$$invalidate(11, ada_x1);
    	}

    	function linechart2_x2_binding(value) {
    		ada_x2 = value;
    		$$invalidate(12, ada_x2);
    	}

    	function linechart2_y1_binding(value) {
    		ada_y1 = value;
    		$$invalidate(13, ada_y1);
    	}

    	function linechart2_y2_binding(value) {
    		ada_y2 = value;
    		$$invalidate(14, ada_y2);
    	}

    	function linechart2_header_binding(value) {
    		if ($$self.$$.not_equal(coins[2], value)) {
    			coins[2] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	function linechart3_data_binding(value) {
    		doge_alldata = value;
    		$$invalidate(20, doge_alldata);
    	}

    	function linechart3_x1_binding(value) {
    		doge_x1 = value;
    		$$invalidate(16, doge_x1);
    	}

    	function linechart3_x2_binding(value) {
    		doge_x2 = value;
    		$$invalidate(17, doge_x2);
    	}

    	function linechart3_y1_binding(value) {
    		doge_y1 = value;
    		$$invalidate(18, doge_y1);
    	}

    	function linechart3_y2_binding(value) {
    		doge_y2 = value;
    		$$invalidate(19, doge_y2);
    	}

    	function linechart3_header_binding(value) {
    		if ($$self.$$.not_equal(coins[3], value)) {
    			coins[3] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	function linechart4_data_binding(value) {
    		avax_alldata = value;
    		$$invalidate(25, avax_alldata);
    	}

    	function linechart4_x1_binding(value) {
    		avax_x1 = value;
    		$$invalidate(21, avax_x1);
    	}

    	function linechart4_x2_binding(value) {
    		avax_x2 = value;
    		$$invalidate(22, avax_x2);
    	}

    	function linechart4_y1_binding(value) {
    		avax_y1 = value;
    		$$invalidate(23, avax_y1);
    	}

    	function linechart4_y2_binding(value) {
    		avax_y2 = value;
    		$$invalidate(24, avax_y2);
    	}

    	function linechart4_header_binding(value) {
    		if ($$self.$$.not_equal(coins[4], value)) {
    			coins[4] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	function linechart5_data_binding(value) {
    		sol_alldata = value;
    		$$invalidate(30, sol_alldata);
    	}

    	function linechart5_x1_binding(value) {
    		sol_x1 = value;
    		$$invalidate(26, sol_x1);
    	}

    	function linechart5_x2_binding(value) {
    		sol_x2 = value;
    		$$invalidate(27, sol_x2);
    	}

    	function linechart5_y1_binding(value) {
    		sol_y1 = value;
    		$$invalidate(28, sol_y1);
    	}

    	function linechart5_y2_binding(value) {
    		sol_y2 = value;
    		$$invalidate(29, sol_y2);
    	}

    	function linechart5_header_binding(value) {
    		if ($$self.$$.not_equal(coins[5], value)) {
    			coins[5] = value;
    			$$invalidate(0, coins);
    		}
    	}

    	$$self.$capture_state = () => ({
    		LineChart,
    		coins,
    		btc_socket,
    		btc_x1,
    		btc_x2,
    		btc_y1,
    		btc_y2,
    		btc_alldata,
    		eth_socket,
    		eth_x1,
    		eth_x2,
    		eth_y1,
    		eth_y2,
    		eth_alldata,
    		ada_socket,
    		ada_x1,
    		ada_x2,
    		ada_y1,
    		ada_y2,
    		ada_alldata,
    		doge_socket,
    		doge_x1,
    		doge_x2,
    		doge_y1,
    		doge_y2,
    		doge_alldata,
    		avax_socket,
    		avax_x1,
    		avax_x2,
    		avax_y1,
    		avax_y2,
    		avax_alldata,
    		sol_socket,
    		sol_x1,
    		sol_x2,
    		sol_y1,
    		sol_y2,
    		sol_alldata
    	});

    	$$self.$inject_state = $$props => {
    		if ('coins' in $$props) $$invalidate(0, coins = $$props.coins);
    		if ('btc_socket' in $$props) btc_socket = $$props.btc_socket;
    		if ('btc_x1' in $$props) $$invalidate(1, btc_x1 = $$props.btc_x1);
    		if ('btc_x2' in $$props) $$invalidate(2, btc_x2 = $$props.btc_x2);
    		if ('btc_y1' in $$props) $$invalidate(3, btc_y1 = $$props.btc_y1);
    		if ('btc_y2' in $$props) $$invalidate(4, btc_y2 = $$props.btc_y2);
    		if ('btc_alldata' in $$props) $$invalidate(5, btc_alldata = $$props.btc_alldata);
    		if ('eth_socket' in $$props) eth_socket = $$props.eth_socket;
    		if ('eth_x1' in $$props) $$invalidate(6, eth_x1 = $$props.eth_x1);
    		if ('eth_x2' in $$props) $$invalidate(7, eth_x2 = $$props.eth_x2);
    		if ('eth_y1' in $$props) $$invalidate(8, eth_y1 = $$props.eth_y1);
    		if ('eth_y2' in $$props) $$invalidate(9, eth_y2 = $$props.eth_y2);
    		if ('eth_alldata' in $$props) $$invalidate(10, eth_alldata = $$props.eth_alldata);
    		if ('ada_socket' in $$props) ada_socket = $$props.ada_socket;
    		if ('ada_x1' in $$props) $$invalidate(11, ada_x1 = $$props.ada_x1);
    		if ('ada_x2' in $$props) $$invalidate(12, ada_x2 = $$props.ada_x2);
    		if ('ada_y1' in $$props) $$invalidate(13, ada_y1 = $$props.ada_y1);
    		if ('ada_y2' in $$props) $$invalidate(14, ada_y2 = $$props.ada_y2);
    		if ('ada_alldata' in $$props) $$invalidate(15, ada_alldata = $$props.ada_alldata);
    		if ('doge_socket' in $$props) doge_socket = $$props.doge_socket;
    		if ('doge_x1' in $$props) $$invalidate(16, doge_x1 = $$props.doge_x1);
    		if ('doge_x2' in $$props) $$invalidate(17, doge_x2 = $$props.doge_x2);
    		if ('doge_y1' in $$props) $$invalidate(18, doge_y1 = $$props.doge_y1);
    		if ('doge_y2' in $$props) $$invalidate(19, doge_y2 = $$props.doge_y2);
    		if ('doge_alldata' in $$props) $$invalidate(20, doge_alldata = $$props.doge_alldata);
    		if ('avax_socket' in $$props) avax_socket = $$props.avax_socket;
    		if ('avax_x1' in $$props) $$invalidate(21, avax_x1 = $$props.avax_x1);
    		if ('avax_x2' in $$props) $$invalidate(22, avax_x2 = $$props.avax_x2);
    		if ('avax_y1' in $$props) $$invalidate(23, avax_y1 = $$props.avax_y1);
    		if ('avax_y2' in $$props) $$invalidate(24, avax_y2 = $$props.avax_y2);
    		if ('avax_alldata' in $$props) $$invalidate(25, avax_alldata = $$props.avax_alldata);
    		if ('sol_socket' in $$props) sol_socket = $$props.sol_socket;
    		if ('sol_x1' in $$props) $$invalidate(26, sol_x1 = $$props.sol_x1);
    		if ('sol_x2' in $$props) $$invalidate(27, sol_x2 = $$props.sol_x2);
    		if ('sol_y1' in $$props) $$invalidate(28, sol_y1 = $$props.sol_y1);
    		if ('sol_y2' in $$props) $$invalidate(29, sol_y2 = $$props.sol_y2);
    		if ('sol_alldata' in $$props) $$invalidate(30, sol_alldata = $$props.sol_alldata);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		coins,
    		btc_x1,
    		btc_x2,
    		btc_y1,
    		btc_y2,
    		btc_alldata,
    		eth_x1,
    		eth_x2,
    		eth_y1,
    		eth_y2,
    		eth_alldata,
    		ada_x1,
    		ada_x2,
    		ada_y1,
    		ada_y2,
    		ada_alldata,
    		doge_x1,
    		doge_x2,
    		doge_y1,
    		doge_y2,
    		doge_alldata,
    		avax_x1,
    		avax_x2,
    		avax_y1,
    		avax_y2,
    		avax_alldata,
    		sol_x1,
    		sol_x2,
    		sol_y1,
    		sol_y2,
    		sol_alldata,
    		linechart0_data_binding,
    		linechart0_x1_binding,
    		linechart0_x2_binding,
    		linechart0_y1_binding,
    		linechart0_y2_binding,
    		linechart0_header_binding,
    		linechart1_data_binding,
    		linechart1_x1_binding,
    		linechart1_x2_binding,
    		linechart1_y1_binding,
    		linechart1_y2_binding,
    		linechart1_header_binding,
    		linechart2_data_binding,
    		linechart2_x1_binding,
    		linechart2_x2_binding,
    		linechart2_y1_binding,
    		linechart2_y2_binding,
    		linechart2_header_binding,
    		linechart3_data_binding,
    		linechart3_x1_binding,
    		linechart3_x2_binding,
    		linechart3_y1_binding,
    		linechart3_y2_binding,
    		linechart3_header_binding,
    		linechart4_data_binding,
    		linechart4_x1_binding,
    		linechart4_x2_binding,
    		linechart4_y1_binding,
    		linechart4_y2_binding,
    		linechart4_header_binding,
    		linechart5_data_binding,
    		linechart5_x1_binding,
    		linechart5_x2_binding,
    		linechart5_y1_binding,
    		linechart5_y2_binding,
    		linechart5_header_binding
    	];
    }

    class LiveCoins extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {}, null, [-1, -1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LiveCoins",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let livecoins0;
    	let t;
    	let livecoins1;
    	let current;
    	livecoins0 = new LiveCoins({ $$inline: true });
    	livecoins1 = new LiveCoins({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			create_component(livecoins0.$$.fragment);
    			t = space();
    			create_component(livecoins1.$$.fragment);
    			attr_dev(div, "class", "chart-grid twoXone svelte-ri7rrh");
    			add_location(div, file, 6, 1, 116);
    			add_location(main, file, 4, 0, 65);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			mount_component(livecoins0, div, null);
    			append_dev(div, t);
    			mount_component(livecoins1, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(livecoins0.$$.fragment, local);
    			transition_in(livecoins1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(livecoins0.$$.fragment, local);
    			transition_out(livecoins1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(livecoins0);
    			destroy_component(livecoins1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ LiveCoins });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
