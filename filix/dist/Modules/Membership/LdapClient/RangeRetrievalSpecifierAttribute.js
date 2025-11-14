"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangeRetrievalSpecifierAttribute = void 0;
const pattern = '^([^;]+);range=(\\d+)-(.+)?$';
function parseRangeRetrievalSpecifierAttribute(attribute) {
    const re = new RegExp(pattern, 'i');
    const match = re.exec(attribute);
    if (!match) {
        throw new Error(`Invalid range attribute: ${attribute}`);
    }
    return {
        attributeName: match[1],
        low: parseInt(match[2], 10),
        high: match[3] === '*' ? null : parseInt(match[3], 10),
    };
}
class RangeRetrievalSpecifierAttribute {
    attributeName;
    low;
    high;
    constructor(attribute) {
        if (!attribute) {
            throw new Error('No attribute provided to create a range retrieval specifier.');
        }
        if (typeof attribute === 'string') {
            const parsed = parseRangeRetrievalSpecifierAttribute(attribute);
            this.attributeName = parsed.attributeName;
            this.low = parsed.low;
            this.high = parsed.high;
        }
        else {
            this.attributeName = attribute.attributeName;
            this.low = attribute.low;
            this.high = attribute.high;
        }
    }
    next() {
        if (this.high !== null && this.high !== this.low) {
            const low = this.low;
            const high = this.high;
            this.low = high + 1;
            this.high = high + (high - low) + 1;
            return this;
        }
        return null;
    }
    toString() {
        return `${this.attributeName};range=${this.low}-${this.high !== null ? this.high : '*'}`;
    }
    static getRangeAttributes(item) {
        const attributes = [];
        for (const attribute in item || {}) {
            if (RangeRetrievalSpecifierAttribute.isRangeAttribute(attribute)) {
                attributes.push(new RangeRetrievalSpecifierAttribute(attribute));
            }
        }
        return attributes.length > 0 ? attributes : null;
    }
    static isRangeAttribute(attribute) {
        const re = new RegExp(pattern, 'i');
        return re.test(attribute);
    }
    static hasRangeAttributes(item) {
        if (!item)
            return false;
        return Object.keys(item).some(attribute => RangeRetrievalSpecifierAttribute.isRangeAttribute(attribute));
    }
}
exports.RangeRetrievalSpecifierAttribute = RangeRetrievalSpecifierAttribute;
exports.default = RangeRetrievalSpecifierAttribute;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFuZ2VSZXRyaWV2YWxTcGVjaWZpZXJBdHRyaWJ1dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9NZW1iZXJzaGlwL0xkYXBDbGllbnQvUmFuZ2VSZXRyaWV2YWxTcGVjaWZpZXJBdHRyaWJ1dGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsTUFBTSxPQUFPLEdBQUcsOEJBQThCLENBQUE7QUFPOUMsU0FBUyxxQ0FBcUMsQ0FBQyxTQUFpQjtJQUM5RCxNQUFNLEVBQUUsR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUE7SUFDbkMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUVoQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixTQUFTLEVBQUUsQ0FBQyxDQUFBO0lBQzFELENBQUM7SUFFRCxPQUFPO1FBQ0wsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDdkIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQzNCLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ3ZELENBQUE7QUFDSCxDQUFDO0FBS0QsTUFBYSxnQ0FBZ0M7SUFDM0MsYUFBYSxDQUFRO0lBQ3JCLEdBQUcsQ0FBUTtJQUNYLElBQUksQ0FBZTtJQUVuQixZQUFZLFNBQWtDO1FBQzVDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQTtRQUNqRixDQUFDO1FBRUQsSUFBSSxPQUFP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