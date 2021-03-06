const test = require("tape")
const { createSchema, types } = require("../dist/index.js")
const { createStore, applyMiddleware } = require("redux")
const thunk = require("redux-thunk").default

test("create middleware", (t) => {
    const { createReducer, createMiddleware } = createSchema([
        ["foo"],
        ["bar", types.String],
    ])

    const initState = { count: 0, message: "hello" }

    const reducer = createReducer({
        foo: (state) => state,
        bar: (state) => state,
    }, initState)

    const middleware = createMiddleware({
        onError: () => { throw new Error("unknown action") },
    })

    const store = createStore(reducer, applyMiddleware(middleware))

    t.doesNotThrow(() => {
        store.dispatch({ type: "foo" })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "EFFECT_TRIGGERED" })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "bar", payload: "world", meta: { a: 1 } })
    })
    t.throws(() => {
        store.dispatch({ type: "bar", payload: { a: "bad argument" } })
    })
    t.throws(() => {
        store.dispatch({ type: "foo", payload: "arg" })
    })
    t.throws(() => {
        store.dispatch({ type: "quux" })
    })
    t.end()
})

test("create middleware with unchecked payloads", (t) => {
    const { createReducer, createMiddleware } = createSchema([
        ["foo"],
        ["bar", types.String],
    ])

    const initState = { count: 0, message: "hello" }

    const reducer = createReducer({
        foo: (state) => state,
        bar: (state) => state,
    }, initState)

    const middleware = createMiddleware({
        ignorePayloads: true,
        onError: () => { throw new Error("unknown action") },
    })

    const store = createStore(reducer, applyMiddleware(middleware))

    t.doesNotThrow(() => {
        store.dispatch({ type: "foo" })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "EFFECT_TRIGGERED" })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "bar", payload: "world", meta: { a: 1 } })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "bar", payload: { a: "bad argument" } })
    })
    t.throws(() => {
        store.dispatch({ type: "quux" })
    })
    t.end()
})

test("create middleware with ignored actions", (t) => {
    const { createReducer, createMiddleware } = createSchema([
        ["foo"],
        ["bar", types.String],
    ])

    const initState = { count: 0, message: "hello" }

    const reducer = createReducer({
        foo: (state) => state,
        bar: (state) => state,
    }, initState)

    const middleware = createMiddleware({
        ignoreActions: ["baz", "quux"],
        onError: () => { throw new Error("unknown action") },
    })

    const store = createStore(reducer, applyMiddleware(middleware))

    t.doesNotThrow(() => {
        store.dispatch({ type: "foo" })
    })
    t.throws(() => {
        store.dispatch({ type: "EFFECT_TRIGGERED" })
    })
    t.doesNotThrow(() => {
        store.dispatch({ type: "baz" })
    })
    t.end()
})

test("doesn't interfere with redux-thunk", (t) => {
    const { createReducer, createMiddleware } = createSchema([
        ["foo"],
        ["bar", types.String],
    ])

    const initState = { count: 0, message: "hello" }

    const reducer = createReducer({
        foo: (state) => state,
        bar: (state) => state,
    }, initState)

    const middleware = createMiddleware({
        onError: () => { throw new Error("unknown action") },
    })

    const asyncAction = (dispatch) => {
        dispatch({ type: "foo" })
    }

    const store = createStore(
        reducer,
        applyMiddleware(middleware, thunk))

    t.doesNotThrow(() => {
        store.dispatch(asyncAction)
    })
    t.end()
})
