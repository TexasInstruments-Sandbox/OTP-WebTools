#!/usr/bin/env python3
"""
Extract column B (Modifiable Field) to see if there are predefined use cases there
"""

import zipfile
import xml.etree.ElementTree as ET
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

def explore_use_case_sheet(zip_ref, shared_strings):
    """Explore the Use Case sheet"""
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

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                value = get_cell_value(cell, shared_strings)

                if row_idx not in data:
                    data[row_idx] = {}
                data[row_idx][col_idx] = value

        return data

def main():
    print(f"Extracting Modifiable Field column (B) and Starting Use Case column (D) from {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        data = explore_use_case_sheet(zip_ref, shared_strings)

        if not data:
            print("ERROR: Could not load Use Case sheet")
            return

        # Column B = index 1 (Modifiable Field)
        # Column D = index 3 (Starting Use Case)

        print("Row-by-row comparison of Column B (Modifiable) vs Column D (Starting Use Case):")
        print("="*100)
        print(f"{'Row':>4} | {'Column B (Modifiable Field)':<40} | {'Column D (Starting Use Case)':<40}")
        print("="*100)

        for row_idx in sorted(data.keys()):
            col_b_val = data.get(row_idx, {}).get(1, '')
            col_d_val = data.get(row_idx, {}).get(3, '')

            # Only print rows that have content in either column
            if col_b_val or col_d_val:
                col_b_str = str(col_b_val)[:40] if col_b_val else ''
                col_d_str = str(col_d_val)[:40] if col_d_val else ''
                print(f"{row_idx + 1:>4} | {col_b_str:<40} | {col_d_str:<40}")

if __name__ == "__main__":
    main()
