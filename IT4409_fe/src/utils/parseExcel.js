import * as XLSX from "xlsx";

export const parseExcel = async (file) => {
    try {
        if (!file) throw new Error("No file provided");

        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) throw new Error("Sheet not found");

        const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        return {
            success: true,
            data: jsonData,
            error: null,
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            error: error.message,
        };
    }
}