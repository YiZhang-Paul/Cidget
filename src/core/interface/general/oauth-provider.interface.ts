export default interface IOAuthProvider {
    promptAuthorization(): void;
    authorize(code: string): Promise<void>;
}
