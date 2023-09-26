export type CommandList = {
    cmd: string;
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
    timeout: NodeJS.Timeout | undefined;
};
