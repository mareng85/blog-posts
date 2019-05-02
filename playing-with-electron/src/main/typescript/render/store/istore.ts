interface IStore<T> {
    set(value: T): void;
    isSet(): boolean;
    get(): T;
    clear(): void;
    onChange(callback: (value: T) => void): void;
    removeOnChange(callback: (value: T) => void): void;
}

export = IStore;
