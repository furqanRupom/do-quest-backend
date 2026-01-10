import { ApiResponseDto } from "src/common/dto";
import { CreateNewTaskResponseDto } from "./new-task.dto";

// TODO: we will add all the other additional dtos later
export class GetAllTaskDto extends ApiResponseDto<CreateNewTaskResponseDto[]> {
    declare data: CreateNewTaskResponseDto[]
}