export interface ScannedFile {
    relativePath: string;
    absolutePath: string;
    content: string;
}
export type Framework = "swiftui" | "uikit" | "react" | "nextjs" | "react-native" | "vue" | "nuxt" | "svelte" | "sveltekit" | "angular" | "flutter" | "compose" | "android" | "html" | "unknown";
export interface ScanResult {
    directory: string;
    frameworks: Framework[];
    codeFiles: ScannedFile[];
    styleFiles: ScannedFile[];
    configFiles: ScannedFile[];
    markupFiles: ScannedFile[];
    swiftFiles: ScannedFile[];
    infoPlistPaths: string[];
    assetCatalogs: string[];
    storyboards: ScannedFile[];
    xcodeProjects: string[];
    packageSwift: ScannedFile | null;
}
export interface ScanOptions {
    /** Path globs (relative to the scanned root) to skip. Merged with `.higauditignore`. */
    exclude?: string[];
}
export declare function globToRegExp(glob: string): RegExp;
export declare function scanProject(directory: string, options?: ScanOptions): Promise<ScanResult>;
