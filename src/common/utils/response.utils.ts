interface IMeta {
    page:number,
    limit:number,
    total:number,
    totalPage:number
}

export interface SendResponseOptions<T> {
    success: boolean;
    message: string;
    data: T;
    meta?:IMeta

}


export function sendResponse<T>(options: SendResponseOptions<T>) : SendResponseOptions<T> {
    return {
        success: options.success,
        message: options.message,
        data: options.data,
        meta:options?.meta
    };
}
