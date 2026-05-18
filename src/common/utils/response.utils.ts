interface IMeta {
    page:number,
    limit:number,
    total:number,
    totalPages:number
}

export interface SendResponseOptions<T> {
    success: boolean;
    message: string;
    meta?:IMeta
    data: T;

}


export function sendResponse<T>(options: SendResponseOptions<T>) : SendResponseOptions<T> {
    return {
        success: options.success,
        message: options.message,
        data: options.data,
        meta:options?.meta
    };
}
