export class ServiceError extends Error {
    constructor(
        public code: number,
        message: string,
    ) {
        super(message);
    }
}

export class DocumentNotFoundError extends ServiceError {
    constructor(id: string) {
        super(404, `No system found with id ${id}`);
    }
}
