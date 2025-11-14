"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetData = void 0;
const user_1 = require("../../utils/user");
const logger_1 = require("../../../utils/logger");
const commonHelpers_1 = require("./utils/commonHelpers");
class SetData {
    async SetData(request, subscription) {
        const { tableName, query, data: record } = request.parameters;
        if (!this.validateSetDataRequest(query, tableName, subscription)) {
            return;
        }
        if (!(await commonHelpers_1.CommonHelpers.validateRequestAccess(this, request, subscription))) {
            return;
        }
        const tesseract = commonHelpers_1.CommonHelpers.getTesseract(this.evH, tableName, subscription);
        if (!tesseract) {
            return;
        }
        if (!this.validateRecordOwnership(record, tesseract, request.userId, subscription)) {
            return;
        }
        try {
            await this.save(tableName, record);
            commonHelpers_1.CommonHelpers.publishSuccess(subscription, request.requestId);
        }
        catch (err) {
            commonHelpers_1.CommonHelpers.publishError(subscription, err.message);
        }
    }
    validateSetDataRequest(query, tableName, subscription) {
        if (query || !tableName) {
            commonHelpers_1.CommonHelpers.publishError(subscription, 'Cannot set data!');
            return false;
        }
        return true;
    }
    validateRecordOwnership(record, tesseract, userId, subscription) {
        const isSystemAdmin = (0, user_1.isSuperAdmin)(this.subscriptionManager, userId);
        const existingRecord = tesseract.getById(record[tesseract.idProperty]);
        if (existingRecord) {
            return this.validateExistingRecordOwnership(existingRecord, isSystemAdmin, subscription);
        }
        else {
            return this.handleNewRecordOwnership(record);
        }
    }
    validateExistingRecordOwnership(existingRecord, isSystemAdmin, subscription) {
        if (!isSystemAdmin && existingRecord.record_holder_id) {
            commonHelpers_1.CommonHelpers.publishError(subscription, 'Only owner can set the data');
            return false;
        }
        return true;
    }
    handleNewRecordOwnership(record) {
        return true;
    }
    async save(modelName, data) {
        const tesseract = this.evH.get(modelName);
        if (!tesseract) {
            throw new Error(`Table "${modelName}" not found`);
        }
        const primaryKey = this.getPrimaryKey(modelName);
        const ormModel = this.DBModels[modelName];
        const dataArray = Array.isArray(data) ? data : [data];
        const updatedData = await this.saveRecords(dataArray, ormModel, tesseract, primaryKey);
        const validData = updatedData.filter(d => !!d[primaryKey]);
        if (validData.length > 0) {
            tesseract.update(validData);
        }
        return updatedData;
    }
    getPrimaryKey(modelName) {
        return this.DBModels.getPrimaryKeyColumn(modelName);
    }
    async saveRecords(dataArray, ormModel, tesseract, primaryKey) {
        return Promise.all(dataArray.map(item => this.saveRecord(item, ormModel, tesseract, primaryKey)));
    }
    async saveRecord(item, ormModel, tesseract, primaryKey) {
        if (tesseract.businessDelete) {
            item.is_deleted = false;
        }
        const isUpdate = !item.isNewRow && item[primaryKey] !== undefined;
        if (isUpdate) {
            return this.updateExistingRecord(item, ormModel, primaryKey);
        }
        else {
            return this.createNewRecord(item, ormModel);
        }
    }
    async updateExistingRecord(item, ormModel, primaryKey) {
        try {
            const record = await ormModel.get(item[primaryKey]);
            if (record) {
                const response = await record.save(item);
                return response;
            }
            else {
                return await this.createNewRecord(item, ormModel);
            }
        }
        catch (error) {
            if (error?.literalCode === 'NOT_FOUND' || error?.code === 'NOT_FOUND' || error?.code === 2) {
                logger_1.logger.warn('Record not found when updating, creating a new record instead', {
                    module: 'GenericDB::SetData',
                    item,
                });
                return this.createNewRecord(item, ormModel);
            }
            logger_1.logger.error(`Failed to update record: ${error}`, {
                module: 'GenericDB::SetData',
                item,
            });
            throw error;
        }
    }
    async createNewRecord(item, ormModel) {
        try {
            const response = await ormModel.create(item);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`Failed to create record: ${error}`, {
                module: 'GenericDB::SetData',
                item,
            });
            throw error;
        }
    }
}
exports.SetData = SetData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0RGF0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0dlbmVyaWNEQi9taXhpbnMvc2V0RGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFHQSwyQ0FBK0M7QUFDL0Msa0RBQThDO0FBQzlDLHlEQUFxRDtBQUVyRCxNQUFhLE9BQU87SUFDbEIsS0FBSyxDQUFDLE9BQU8sQ0FBa0IsT0FBWSxFQUFFLFlBQTBCO1FBQ3JFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFBO1FBRzdELElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxZQUFZLENBQUMsRUFBRSxDQUFDO1lBQ2pFLE9BQU07UUFDUixDQUFDO1FBR0QsSUFBSSxDQUFDLENBQUMsTUFBTSw2QkFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzlFLE9BQU07UUFDUixDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsNkJBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDL0UsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsT0FBTTtRQUNSLENBQUM7UUFHRCxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUMvQixNQUFNLEVBQ04sU0FBUyxFQUNULE9BQU8sQ0FBQyxNQUFNLEVBQ2QsWUFBWSxDQUNiLEVBQUUsQ0FBQztZQUNGLE9BQU07UUFDUixDQUFDO1FBR0QsSUFBSSxDQUFDO1lBQ0gsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUNsQyw2QkFBYSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEVBQUUsT0FBTyxD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