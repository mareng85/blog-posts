import IStore = require("./istore");

export class Store<T> implements IStore<T> {

    private readonly key: string;
    private value: T;
    private callbacks: [((val: T) => void)?] = [] as [((val: T) => void)?];

    constructor(key: string, defaultValue: T = null) {
        this.key = key;

        const storedValue = sessionStorage.getItem(key);

        if (storedValue !== null) {
            this.set(JSON.parse(storedValue));
        } else if (defaultValue !== null) {
            this.set(defaultValue);
        } else {
            // NOP
        }
    }

    public set(value: T, tiggerCallbacksAnyway: boolean = false) {

        if (this.value === value) {
            if (tiggerCallbacksAnyway) {
                this.callbacks.forEach(callback => callback(value));
            }
            return; // NOP
        }

        this.value = value;

        try {
            sessionStorage.setItem(this.key, JSON.stringify(value));
        } catch (e) {
            throw e;
        }

        this.callbacks.forEach(callback => callback(value));
    }

    public isSet(): boolean {
        return this.value !== null;
    }

    public get(): T {
        if (!this.isSet()) {
            throw new Error(`[${this.key}] Value not set`);
        }

        return this.value;
    }

    public clear(): void {
        this.value = null;
        sessionStorage.removeItem(this.key);
    }

    public onChange(callback: (value: T) => void) {
        this.callbacks.push(callback);
    }

    public removeOnChange(callback: (value: T) => void) {
        // TODO: implement
    }
}
