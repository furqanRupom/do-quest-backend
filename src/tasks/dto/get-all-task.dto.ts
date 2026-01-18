import { ApiMetaResponseDto } from "src/common/dto";

export class GetAllTaskDto<T> extends ApiMetaResponseDto<Partial<T>> {
    declare data: Partial<T>[];
}

