declare module 'fuse.js' {
  interface FuseOptions<T> {
    keys?: (keyof T)[] | string[];
    threshold?: number;
    distance?: number;
    minMatchCharLength?: number;
    shouldSort?: boolean;
    location?: number;
    ignoreLocation?: boolean;
    findAllMatches?: boolean;
    includeScore?: boolean;
    includeMatches?: boolean;
  }

  interface FuseMatch {
    indices: [number, number][];
    key: string;
    value: string;
  }

  interface FuseResult<T> {
    item: T;
    refIndex: number;
    score?: number;
    matches?: FuseMatch[];
  }

  class Fuse<T> {
    constructor(list: T[], options?: FuseOptions<T>);
    search(pattern: string): FuseResult<T>[];
    setCollection(list: T[]): void;
  }

  export default Fuse;
} 