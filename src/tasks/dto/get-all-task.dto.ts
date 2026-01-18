import { ApiMetaResponseDto } from "src/common/dto";
import { CreateTaskResponseDto } from "./new-task.dto";

// TODO: we will add all the other additional dtos later
export class GetAllTaskDto<T> extends ApiMetaResponseDto<Partial<T>> {
    declare data: Partial<T>[];
}


// export class GetAllTaskDto {
//     success: boolean;
//     message: string;
//     data: CreateTaskResponseDto[];
//     meta?: any
// }