class apiResponse {
    constructor(statusCode, message = "Success", data ) {
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.success = true;
    }
}

export default apiResponse;