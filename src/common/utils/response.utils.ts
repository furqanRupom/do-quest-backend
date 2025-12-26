interface SendResponseOptions<T> {
    success: boolean;
    message: string;
    data: T;
}

export function sendResponse<T>(options: SendResponseOptions<T>) {
    return {
        success: options.success,
        message: options.message,
        data: options.data,
    };
}
