import { ApiMetaResponseDto } from "../../common/dto";

export class GetAllTaskDto<T> extends ApiMetaResponseDto<Partial<T>> {
    declare data: Partial<T>[];
}

