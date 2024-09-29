import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";
import { UUID } from "crypto"

export class ChangeOrder {
    @ApiProperty({ title: "ID договора", example: 61 })
    @IsNumber()
    id: number;
    @ApiProperty({
        title: "Список из ID шагов.", example: {
            "steps": [
                {
                    "id": "b2164a80-e6a2-4424-ab17-197552c11f3c"
                },
                {
                    "id": "5678e92b-2141-4dc1-a8a1-9ab79be83a77"
                }
            ]
        }
    })
    @IsArray()
    steps: {
        id: UUID
    }[]
}