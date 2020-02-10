export default interface IOAuthProvider {
    authorizeUrl: string;
    authorize(code: string): Promise<void>;
}
