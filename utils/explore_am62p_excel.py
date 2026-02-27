#!/usr/bin/env python3
"""
Explore the AM62P Excel file structure to understand the layout
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
    f = cell.find('main:f', NS)  # formula

    # Check if it has a formula
    formula = None
    if f is not None and f.text:
        formula = f.text

    if v is None or v.text is None:
        return None if formula is None else f"[Formula: {formula}]"

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
    """Convert column index to Excel letter (0='A', 25='Z', 26='AA')"""
    result = ""
    idx += 1  # Make it 1-indexed for the calculation
    while idx > 0:
        idx -= 1
        result = chr(ord('A') + (idx % 26)) + result
        idx //= 26
    return result

def explore_sheet(zip_ref, sheet_name, shared_strings, max_rows=30, max_cols=30):
    """Explore and dump the first few rows/cols of a sheet"""
    # Find sheet file
    with zip_ref.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = root.find('.//main:sheets', NS)

        sheet_id = None
        for sheet in sheets.findall('.//main:sheet', NS):
            if sheet.get('name') == sheet_name:
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

    # Parse sheet
    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        data = {}
        sheet_data = root.find('.//main:sheetData', NS)
        if sheet_data is None:
            return {}

        for row_elem in sheet_data.findall('.//main:row', NS):
            row_idx = int(row_elem.get('r')) - 1

            if row_idx >= max_rows:
                continue

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                if col_idx >= max_cols:
                    continue

                value = get_cell_value(cell, shared_strings)

                if row_idx not in data:
                    data[row_idx] = {}
                data[row_idx][col_idx] = value

        return data

def print_sheet_grid(data, max_rows=30, max_cols=15):
    """Print sheet data as a grid"""
    if not data:
        print("  (empty)")
        return

    # Find max row and col
    max_row = max(data.keys()) if data else 0
    max_col = max(max(row.keys()) for row in data.values() if row) if data else 0

    max_row = min(max_row, max_rows - 1)
    max_col = min(max_col, max_cols - 1)

    # Print header
    print("     ", end="")
    for col in range(max_col + 1):
        col_letter = col_idx_to_letter(col)
        print(f"{col_letter:>12}", end=" ")
    print()

    # Print rows
    for row in range(max_row + 1):
        print(f"{row + 1:>4} ", end="")
        for col in range(max_col + 1):
            value = data.get(row, {}).get(col, '')
            if value is None:
                value = ''

            # Truncate long values
            value_str = str(value)
            if len(value_str) > 12:
                value_str = value_str[:9] + '...'

            print(f"{value_str:>12}", end=" ")
        print()

def main():
    print(f"Exploring {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)

        # Explore key sheets
        for sheet_name in ['PWRCALC', 'Use Case', 'Results', 'MDB']:
            print("=" * 100)
            print(f"Sheet: {sheet_name}")
            print("=" * 100)

            data = explore_sheet(zip_ref, sheet_name, shared_strings, max_rows=50, max_cols=25)

            if data:
                print_sheet_grid(data, max_rows=30, max_cols=15)
            else:
                print("(Sheet not found or empty)")

            print("\n")

if __name__ == "__main__":
    main()
