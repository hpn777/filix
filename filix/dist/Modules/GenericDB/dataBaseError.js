"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBaseError = void 0;
class DataBaseError extends Error {
    constructor(error) {
        super();
        this.name = 'DataBaseError';
        this.message = error.message;
        this.stack = error.stack;
        Object.setPrototypeOf(this, DataBaseError.prototype);
    }
}
exports.DataBaseError = DataBaseError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YUJhc2VFcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9kYXRhQmFzZUVycm9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLE1BQWEsYUFBYyxTQUFRLEtBQUs7SUFDdEMsWUFBWSxLQUFZO1FBQ3RCLEtBQUssRUFBRSxDQUFBO1FBQ1AsSUFBSSxDQUFDLElBQUksR0FBRyxlQUFlLENBQUE7UUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFBO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQTtRQUN4QixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDdEQsQ0FBQztDQUNGO0FBUkQsc0NBUUMifQ==