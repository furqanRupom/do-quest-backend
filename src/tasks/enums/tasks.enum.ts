export enum TaskStatus {
    pending = 'PENDING',        
    active = 'ACTIVE',         
    completed = 'COMPLETED',   
    cancelled = 'CANCELLED', 
}


export enum PaymentStatus {
    active = 'ACTIVE',
    completed = 'COMPLETED',
    cancelled = 'CANCELLED',
}



export enum PaymentFlowStatus {
    no_payment = 'NO_PAYMENT',
    pending = 'PENDING',
    authorized = 'AUTHORIZED',
    captured = 'CAPTURED',
    cancelled = 'CANCELLED',
    failed = 'FAILED',
}