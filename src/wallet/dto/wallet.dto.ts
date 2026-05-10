import { IsNumber,  IsString } from "class-validator";

export class ReleaseEsrowToWorkerDto {
  @IsString()
  creatorId: string = ''
  @IsString()
  workerId: string = ''
  @IsString()
  taskId: string = ''
  @IsString()
  submissionId: string = ''
  @IsNumber()
  amount: number = 0
  @IsString()
  stripeTransferId: string = ''
}
