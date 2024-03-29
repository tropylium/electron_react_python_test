export class DeferredPromise<T> {
    private readonly _promise: Promise<T>;
    resolve: (t: T) => void;
    reject: () => void;
    then: (callback: (t: T) => void) => Promise<any>;
    catch: any;
    finally: any;
    constructor() {
        this._promise = new Promise<T>((resolve, reject) => {
            // assign the resolve and reject functions to `this`
            // making them usable on the class instance
            this.resolve = resolve;
            this.reject = reject;
        });
        // bind `then` and `catch` to implement the same interface as Promise
        this.then = this._promise.then.bind(this._promise);
        this.catch = this._promise.catch.bind(this._promise);
        this.finally = this._promise.finally.bind(this._promise);
    }
}