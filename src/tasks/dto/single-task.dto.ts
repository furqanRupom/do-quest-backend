import { ApiResponseDto } from "../../common/dto";
import { CreateTaskResponseDto } from "./new-task.dto";

export class SingleTaskDto extends ApiResponseDto<Partial<CreateTaskResponseDto>> {
    declare data: Partial<CreateTaskResponseDto>;
}
   