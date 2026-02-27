#!/usr/bin/env python3
"""
Extract the REAL use cases from the AM62P Use Case sheet
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re

EXCEL_FILE = "../SPRUJD9_AM62P_PET_1_1.xlsm"

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def get_shared_strings(zip_ref):
    """Extract shared strings table from Excel"""
    try:
        with zip_ref.open('xl/sharedStrings.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            strings = []
            for si in root.findall('.//main:si', NS):
                t = si.find('.//main:t', NS)
                if t is not None and t.text:
                    strings.append(t.text)
                else:
                    strings.append('')
            return strings
    except KeyError:
        return []

def get_cell_value(cell, shared_strings):
    """Extract value from a cell element"""
    cell_type = cell.get('t', 'n')
    v = cell.find('main:v', NS)
    f = cell.find('main:f', NS)

    formula = None
    if f is not None and f.text:
        formula = f.text

    if v is None or v.text is None:
        return None

    if cell_type == 's':
        idx = int(v.text)
        if 0 <= idx < len(shared_strings):
            return shared_strings[idx]
        return None
    elif cell_type == 'str':
        return v.text
    elif cell_type == 'b':
        return v.text == '1'
    else:
        try:
            val = float(v.text)
            if val.is_integer():
                return int(val)
            return val
        except:
            return v.text

def parse_cell_reference(ref):
    """Parse cell reference like 'A1' into (col_idx, row_idx)"""
    match = re.match(r'([A-Z]+)(\d+)', ref)
    if not match:
        return None, None

    col_str, row_str = match.groups()
    col_idx = 0
    for char in col_str:
        col_idx = col_idx * 26 + (ord(char) - ord('A') + 1)
    col_idx -= 1

    row_idx = int(row_str) - 1

    return col_idx, row_idx

def col_idx_to_letter(idx):
    """Convert column index to Excel letter"""
    result = ""
    idx += 1
    while idx > 0:
        idx -= 1
        result = chr(ord('A') + (idx % 26)) + result
        idx //= 26
    return result

def explore_use_case_sheet(zip_ref, shared_strings):
    """Explore the Use Case sheet - get ALL data"""
    # Find Use Case sheet
    with zip_ref.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = root.find('.//main:sheets', NS)

        sheet_id = None
        for sheet in sheets.findall('.//main:sheet', NS):
            if sheet.get('name') == 'Use Case':
                rid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                sheet_id = rid
                break

        if not sheet_id:
            return None

    with zip_ref.open('xl/_rels/workbook.xml.rels') as f:
        tree = ET.parse(f)
        root = tree.getroot()

        sheet_file = None
        for rel in root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
            if rel.get('Id') == sheet_id:
                sheet_file = 'xl/' + rel.get('Target')
                break

        if not sheet_file:
            return None

    # Parse sheet - get ALL rows and columns
    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        data = {}
        sheet_data = root.find('.//main:sheetData', NS)
        if sheet_data is None:
            return {}

        for row_elem in sheet_data.findall('.//main:row', NS):
            row_idx = int(row_elem.get('r')) - 1

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                value = get_cell_value(cell, shared_strings)

                if row_idx not in data:
                    data[row_idx] = {}
                data[row_idx][col_idx] = value

        return data

def main():
    print(f"Extracting REAL use cases from {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        data = explore_use_case_sheet(zip_ref, shared_strings)

        if not data:
            print("ERROR: Could not load Use Case sheet")
            return

        # Find "Starting Use case" header row (should be row 2, column C+)
        # Look for columns that have use case names
        use_case_columns = []

        # Check row 1 (index 0) for headers with "Starting Use case" or similar
        row_2 = data.get(1, {})  # Row 2 (index 1)
        row_3 = data.get(2, {})  # Row 3 (index 2)

        print("Row 2 content (looking for 'Starting Use case'):")
        for col_idx in range(30):
            val = row_2.get(col_idx, '')
            if val:
                print(f"  Col {col_idx_to_letter(col_idx)}: {val}")

        print("\nRow 3 content (looking for use case names):")
        for col_idx in range(30):
            val = row_3.get(col_idx, '')
            if val:
                print(f"  Col {col_idx_to_letter(col_idx)}: {val}")
                if 'UC' in str(val) or 'Use' in str(val):
                    use_case_columns.append(col_idx)

        print(f"\nFound {len(use_case_columns)} use case columns: {[col_idx_to_letter(c) for c in use_case_columns]}")

        # Now extract full data for each use case column
        print("\n" + "="*80)
        print("FULL USE CASE DATA")
        print("="*80)

        for uc_col in use_case_columns:
            col_letter = col_idx_to_letter(uc_col)
            uc_name = row_3.get(uc_col, f'UseCase_{col_letter}')

            print(f"\n{uc_name} (Column {col_letter}):")
            print("-" * 60)

            # Print all rows for this column
            for row_idx in sorted(data.keys()):
                if row_idx < 2:  # Skip header rows
                    continue

                cell_val = data.get(row_idx, {}).get(uc_col, '')
                row_label = data.get(row_idx, {}).get(1, '')  # Column B usually has labels

                if cell_val and str(cell_val).strip():
                    print(f"  Row {row_idx + 1} ({row_label}): {cell_val}")

if __name__ == "__main__":
    main()
