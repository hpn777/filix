"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const findValueByKey_1 = require("./findValueByKey");
const findConfigurationSection = (configuration, array) => {
    if (!array.length) {
        return configuration;
    }
    const config = (0, findValueByKey_1.findValueByKey)(configuration, array.shift());
    return findConfigurationSection(config, array);
};
exports.default = findConfigurationSection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmluZENvbmZpZ3VyYXRpb25TZWN0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3V0aWxzL2ZpbmRDb25maWd1cmF0aW9uU2VjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHFEQUFpRDtBQUVqRCxNQUFNLHdCQUF3QixHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQ3hELElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDbEIsT0FBTyxhQUFhLENBQUE7SUFDdEIsQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLElBQUEsK0JBQWMsRUFBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUE7SUFFM0QsT0FBTyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7QUFDaEQsQ0FBQyxDQUFBO0FBRUQsa0JBQWUsd0JBQXdCLENBQUEifQ==