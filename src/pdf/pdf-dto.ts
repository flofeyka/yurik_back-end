import { UUID } from "crypto";

export class PdfDto {
    public readonly fileName: string;
    public readonly pdfLink: string;

    constructor({fileName}) {
        this.fileName = fileName;
        this.pdfLink = `${process.env.API_URL}/pdf/${fileName}`;
    } 
}