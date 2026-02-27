#!/usr/bin/env python3
"""
List all sheets in the AM62P Excel file
"""

import zipfile
import xml.etree.ElementTree as ET

EXCEL_FILE = "../SPRUJD9_AM62P_PET_1_1.xlsm"

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def list_sheets(zip_ref):
    """List all sheet names in the workbook"""
    with zip_ref.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = root.find('.//main:sheets', NS)

        sheet_list = []
        for sheet in sheets.findall('.//main:sheet', NS):
            sheet_name = sheet.get('name')
            sheet_list.append(sheet_name)

        return sheet_list

def main():
    print(f"All sheets in {EXCEL_FILE}:\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        sheets = list_sheets(zip_ref)
        for i, sheet_name in enumerate(sheets, 1):
            print(f"{i}. {sheet_name}")

if __name__ == "__main__":
    main()
