/// <reference types="node" />
type Options = {
    onnxPath?: string;
    charsetsPath?: string;
};
declare class DdddOcr {
    #private;
    private constructor();
    static create(options?: Options): Promise<DdddOcr>;
    classification(buff: Buffer): Promise<string>;
    private loadImage;
    private coverImageToTensor;
}
export default DdddOcr;
