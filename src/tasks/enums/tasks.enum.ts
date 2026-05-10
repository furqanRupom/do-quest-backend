export enum TaskStatus {
    pending = 'PENDING',        
    active = 'ACTIVE',         
    completed = 'COMPLETED',   
    cancelled = 'CANCELLED',
    disputed = 'DISPUTED' 
}


export enum PaymentStatus {
    active = 'ACTIVE',
    completed = 'COMPLETED',
    cancelled = 'CANCELLED',
    refunded = 'REFUNDED',
    released = 'RELEASED'
}



export enum PaymentFlowStatus {
    no_payment = 'NO_PAYMENT',
    pending = 'PENDING',
    paid = 'PAID',
    authorized = 'AUTHORIZED',
    captured = 'CAPTURED',
    cancelled = 'CANCELLED',
    failed = 'FAILED',
    refunded = 'REFUNDED'
}
