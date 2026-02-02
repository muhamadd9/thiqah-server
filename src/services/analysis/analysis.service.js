import { asyncHandler } from "../../utils/response/error.response.js";
import fileModel from "../../DB/model/File.model.js";
import integrityRecordModel from "../../DB/model/IntegrityRecord.model.js";
import tamperAnalysisModel from "../../DB/model/TamperAnalysis.model.js";
import anomalyDetectionModel from "../../DB/model/AnomalyDetection.model.js";
import analysisResultModel from "../../DB/model/AnalysisResult.model.js";
import { create, findOne, find } from "../../DB/dbService.js";
import { successResponse } from "../../utils/response/success.response.js";
import { parseFile } from "../file/file.service.js";

/* Perform Complete Analysis */
export const analyzeFile = asyncHandler(async (req, res, next) => {
    const { fileId } = req.params;
    const { id: userId } = req.authUser;

    // Get the file to analyze
    const file = await findOne({
        model: fileModel,
        filter: { _id: fileId, user_id: userId }
    });

    if (!file) {
        return next(new Error("File not found", { cause: 404 }));
    }

    if (file.is_baseline) {
        return next(new Error("Cannot analyze baseline file", { cause: 400 }));
    }

    // Get baseline file
    const baseline = await findOne({
        model: fileModel,
        filter: { user_id: userId, is_baseline: true }
    });

    if (!baseline) {
        return next(new Error("Baseline file not found", { cause: 404 }));
    }

    // Get file hashes
    const fileHash = await findOne({
        model: integrityRecordModel,
        filter: { file_id: fileId }
    });

    const baselineHash = await findOne({
        model: integrityRecordModel,
        filter: { file_id: baseline._id }
    });

    const integrity_passed = fileHash.hash_value === baselineHash.hash_value;
    let tampering_detected = false;
    let tamperingDetails = [];
    let anomalies = [];

    // If hashes don't match, perform detailed analysis
    if (!integrity_passed) {
        tampering_detected = true;

        // Parse both files
        const baselineData = await parseFile(baseline);
        const fileData = await parseFile(file);

        // Compare files row by row
        tamperingDetails = await compareFiles(baselineData, fileData, fileId);

        // Detect anomalies in the suspicious file
        anomalies = await detectAnomalies(fileData, fileId);
    }

    // Count severity
    const highSeverityCount = [
        ...tamperingDetails.filter(t => t.severity_level === "high"),
        ...anomalies.filter(a => a.severity_level === "high")
    ].length;

    // Generate summary
    const summary = generateSummary(
        integrity_passed,
        tampering_detected,
        tamperingDetails.length,
        anomalies.length,
        highSeverityCount
    );

    // Create analysis result
    const analysisResult = await create({
        model: analysisResultModel,
        data: {
            file_id: fileId,
            baseline_file_id: baseline._id,
            status: tampering_detected ? "tampered" : "safe",
            summary,
            integrity_passed,
            tampering_detected,
            anomalies_found: anomalies.length,
            high_severity_count: highSeverityCount
        }
    });

    return successResponse({
        res,
        data: {
            analysis: analysisResult,
            tampering_details: tamperingDetails,
            anomalies: anomalies,
            integrity_check: {
                passed: integrity_passed,
                file_hash: fileHash.hash_value,
                baseline_hash: baselineHash.hash_value
            }
        }
    });
});

/* Compare two files and detect changes */
const compareFiles = async (baselineData, fileData, fileId) => {
    const changes = [];
    const maxRows = Math.max(baselineData.length, fileData.length);

    for (let i = 0; i < maxRows; i++) {
        const baselineRow = baselineData[i];
        const fileRow = fileData[i];

        // Deleted row
        if (baselineRow && !fileRow) {
            const change = await create({
                model: tamperAnalysisModel,
                data: {
                    file_id: fileId,
                    change_type: "deleted",
                    location: `Row ${i + 1}`,
                    row_number: i + 1,
                    old_value: JSON.stringify(baselineRow),
                    new_value: null,
                    severity_level: "medium"
                }
            });
            changes.push(change);
            continue;
        }

        // Added row
        if (!baselineRow && fileRow) {
            const change = await create({
                model: tamperAnalysisModel,
                data: {
                    file_id: fileId,
                    change_type: "added",
                    location: `Row ${i + 1}`,
                    row_number: i + 1,
                    old_value: null,
                    new_value: JSON.stringify(fileRow),
                    severity_level: "medium"
                }
            });
            changes.push(change);
            continue;
        }

        // Compare columns
        if (baselineRow && fileRow) {
            const columns = new Set([...Object.keys(baselineRow), ...Object.keys(fileRow)]);

            for (const column of columns) {
                const oldValue = baselineRow[column];
                const newValue = fileRow[column];

                if (oldValue !== newValue) {
                    // Determine severity based on column name or value change
                    const severity = determineSeverity(column, oldValue, newValue);

                    const change = await create({
                        model: tamperAnalysisModel,
                        data: {
                            file_id: fileId,
                            change_type: "modified",
                            location: `Row ${i + 1}, Column: ${column}`,
                            row_number: i + 1,
                            column_name: column,
                            old_value: String(oldValue),
                            new_value: String(newValue),
                            severity_level: severity
                        }
                    });
                    changes.push(change);
                }
            }
        }
    }

    return changes;
};

/* Detect anomalies using statistical analysis */
const detectAnomalies = async (data, fileId) => {
    const anomalies = [];

    if (data.length === 0) return anomalies;

    // Get numeric columns
    const firstRow = data[0];
    const numericColumns = Object.keys(firstRow).filter(key => {
        const value = firstRow[key];
        return !isNaN(parseFloat(value)) && isFinite(value);
    });

    // Analyze each numeric column
    for (const column of numericColumns) {
        const values = data
            .map((row, index) => ({ value: parseFloat(row[column]), rowIndex: index }))
            .filter(item => !isNaN(item.value));

        if (values.length < 3) continue; // Need at least 3 values for statistical analysis

        // Calculate mean and standard deviation
        const mean = values.reduce((sum, item) => sum + item.value, 0) / values.length;
        const variance = values.reduce((sum, item) => sum + Math.pow(item.value - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // Detect outliers (values beyond 3 standard deviations)
        for (const item of values) {
            const zScore = Math.abs((item.value - mean) / stdDev);

            if (zScore > 3 && stdDev > 0) {
                // Calculate confidence score (higher z-score = higher confidence)
                const confidence = Math.min(zScore / 10, 1);

                // Determine severity
                let severity = "low";
                if (zScore > 5) severity = "high";
                else if (zScore > 4) severity = "medium";

                // Calculate percentage difference from mean
                const percentDiff = Math.round(((item.value - mean) / mean) * 100);

                const anomaly = await create({
                    model: anomalyDetectionModel,
                    data: {
                        file_id: fileId,
                        column_name: column,
                        row_number: item.rowIndex + 1,
                        suspicious_value: String(item.value),
                        expected_range: `${(mean - 2 * stdDev).toFixed(2)} - ${(mean + 2 * stdDev).toFixed(2)}`,
                        reason: `${Math.abs(percentDiff)}% ${percentDiff > 0 ? 'higher' : 'lower'} than average ${column.toLowerCase()} transactions`,
                        confidence_score: confidence,
                        severity_level: severity
                    }
                });
                anomalies.push(anomaly);
            }
        }
    }

    return anomalies;
};

/* Determine severity of a change */
const determineSeverity = (column, oldValue, newValue) => {
    const columnLower = column.toLowerCase();

    // High severity for financial columns
    if (columnLower.includes("amount") ||
        columnLower.includes("salary") ||
        columnLower.includes("price") ||
        columnLower.includes("balance") ||
        columnLower.includes("total")) {

        // Check magnitude of change
        const oldNum = parseFloat(oldValue);
        const newNum = parseFloat(newValue);

        if (!isNaN(oldNum) && !isNaN(newNum)) {
            const percentChange = Math.abs((newNum - oldNum) / oldNum) * 100;
            if (percentChange > 50) return "high";
            if (percentChange > 10) return "medium";
        }

        return "medium";
    }

    // Medium severity for other changes
    return "low";
};

/* Generate analysis summary */
const generateSummary = (integrityPassed, tamperingDetected, changesCount, anomaliesCount, highSeverityCount) => {
    if (integrityPassed) {
        return "✅ The uploaded file matches the original baseline. No modifications detected.";
    }

    let summary = "❌ The uploaded file does not match the original baseline. Modifications were found.\n\n";

    if (changesCount > 0) {
        summary += `🔍 Integrity Check: Found ${changesCount} change(s) in the file.\n`;
    }

    if (anomaliesCount > 0) {
        summary += `🤖 AI Anomaly Detection: Detected ${anomaliesCount} suspicious value(s).\n`;
    }

    if (highSeverityCount > 0) {
        summary += `⚠️ High Severity Issues: ${highSeverityCount} critical issue(s) require attention.`;
    }

    return summary.trim();
};

/* Get analysis result for a file */
export const getAnalysisResult = asyncHandler(async (req, res, next) => {
    const { fileId } = req.params;
    const { id: userId } = req.authUser;

    // Verify file ownership
    const file = await findOne({
        model: fileModel,
        filter: { _id: fileId, user_id: userId }
    });

    if (!file) {
        return next(new Error("File not found", { cause: 404 }));
    }

    // Get analysis result
    const analysis = await findOne({
        model: analysisResultModel,
        filter: { file_id: fileId }
    });

    if (!analysis) {
        return next(new Error("Analysis not found. Please run analysis first.", { cause: 404 }));
    }

    // Get tampering details
    const tamperingDetails = await find({
        model: tamperAnalysisModel,
        filter: { file_id: fileId },
        sort: { severity_level: -1, row_number: 1 }
    });

    // Get anomalies
    const anomalies = await find({
        model: anomalyDetectionModel,
        filter: { file_id: fileId },
        sort: { confidence_score: -1 }
    });

    // Get integrity check
    const integrityRecord = await findOne({
        model: integrityRecordModel,
        filter: { file_id: fileId }
    });

    return successResponse({
        res,
        data: {
            analysis,
            tampering_details: tamperingDetails,
            anomalies,
            integrity_check: integrityRecord,
            file
        }
    });
});
