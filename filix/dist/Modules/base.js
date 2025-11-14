"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericBaseModule = exports.BaseModule = void 0;
class BaseModule {
    config;
    subscriptionManager;
    publicMethods = new Map();
    constructor(config, subscriptionManager) {
        this.config = config;
        this.subscriptionManager = subscriptionManager;
    }
    GetPublicMethods(request, subscription) {
        subscription.publish(Array.from(this.publicMethods.keys()));
    }
}
exports.BaseModule = BaseModule;
class GenericBaseModule extends BaseModule {
    config;
    subscriptionManager;
    evH;
    constructor(config, subscriptionManager) {
        super(config, subscriptionManager);
        this.config = config;
        this.subscriptionManager = subscriptionManager;
    }
    init() {
        throw new Error('Method not implemented.');
    }
}
exports.GenericBaseModule = GenericBaseModule;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9Nb2R1bGVzL2Jhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBNkJBLE1BQXNCLFVBQVU7SUFNckI7SUFDQTtJQU5GLGFBQWEsR0FBZ0MsSUFBSSxHQUFHLEVBQUUsQ0FBQTtJQUk3RCxZQUNTLE1BQW9CLEVBQ3BCLG1CQUF3QztRQUR4QyxXQUFNLEdBQU4sTUFBTSxDQUFjO1FBQ3BCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7SUFDOUMsQ0FBQztJQUVHLGdCQUFnQixDQUFDLE9BQVksRUFBRSxZQUEwQjtRQUM5RCxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDN0QsQ0FBQztDQUNGO0FBYkQsZ0NBYUM7QUFFRCxNQUFhLGlCQUFrQixTQUFRLFVBQVU7SUFJdEM7SUFDQTtJQUpULEdBQUcsQ0FBZTtJQUVsQixZQUNTLE1BQW9CLEVBQ3BCLG1CQUF3QztRQUUvQyxLQUFLLENBQUMsTUFBTSxFQUFFLG1CQUFtQixDQUFDLENBQUE7UUFIM0IsV0FBTSxHQUFOLE1BQU0sQ0FBYztRQUNwQix3QkFBbUIsR0FBbkIsbUJBQW1CLENBQXFCO0lBR2pELENBQUM7SUFFTSxJQUFJO1FBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO0lBQzVDLENBQUM7Q0FDRjtBQWJELDhDQWFDIn0=