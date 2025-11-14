"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uiModuleLoader = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const loadDefinition = (fixturesPath, filePath) => {
    return fs_1.default.readFileSync(path_1.default.resolve(fixturesPath, filePath), 'utf8');
};
const uiModuleLoader = (fixturesPath) => {
    const indexPath = path_1.default.resolve(fixturesPath, 'uiModulesIndex.json');
    if (!fs_1.default.existsSync(indexPath)) {
        return {};
    }
    const indexContent = fs_1.default.readFileSync(indexPath, 'utf8');
    const uiModulesIndex = JSON.parse(indexContent);
    const data = uiModulesIndex.reduce((defs, module) => {
        module.versions.forEach((version) => {
            const def = loadDefinition(fixturesPath, version.path);
            const re = /\({(.|\n)*}\)/gm;
            const defParsed = re.exec(def);
            if (defParsed) {
                version.config = defParsed[0];
            }
            else {
                throw new Error(`Error while parsing module version definition: ${version.path}`);
            }
        });
        defs[module.id] = module;
        return defs;
    }, {});
    return data;
};
exports.uiModuleLoader = uiModuleLoader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWlNb2R1bGVMb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvTW9kdWxlcy9EYXNoYm9hcmQvdWlNb2R1bGVMb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLG9EQUFtQjtBQUNuQix3REFBdUI7QUFFdkIsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUFvQixFQUFFLFFBQWdCLEVBQUUsRUFBRTtJQUNoRSxPQUFPLFlBQUUsQ0FBQyxZQUFZLENBQUMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUE7QUFDdEUsQ0FBQyxDQUFBO0FBRU0sTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUFvQixFQUFFLEVBQUU7SUFDckQsTUFBTSxTQUFTLEdBQUcsY0FBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUscUJBQXFCLENBQUMsQ0FBQTtJQUVuRSxJQUFJLENBQUMsWUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzlCLE9BQU8sRUFBRSxDQUFBO0lBQ1gsQ0FBQztJQUVELE1BQU0sWUFBWSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFL0MsTUFBTSxJQUFJLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3RELE1BQU0sRUFBRSxHQUFHLGlCQUFpQixDQUFBO1lBQzVCLE1BQU0sU0FBUyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDOUIsSUFBSSxTQUFTLEVBQUUsQ0FBQztnQkFDZCxPQUFPLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMvQixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sTUFBTSxJQUFJLEtBQUssQ0FDYixrREFBa0QsT0FBTyxDQUFDLElBQUksRUFBRSxDQUNqRSxDQUFBO1lBQ0gsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFBO1FBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUE7UUFDeEIsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMsQ0FBQTtBQTVCWSxRQUFBLGNBQWMsa0JBNEIxQiJ9