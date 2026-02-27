#!/usr/bin/env python3
"""
Extract dropdown options from cell D3 in the Use Case sheet
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

def find_use_case_sheet_file(zip_ref):
    """Find the sheet file for Use Case"""
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

        return sheet_file

def extract_dropdown_validation(zip_ref, sheet_file, shared_strings):
    """Extract data validation (dropdown) for cell D3"""
    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        # Look for dataValidations element
        data_validations = root.find('.//main:dataValidations', NS)

        if data_validations is None:
            print("No data validations found in sheet")
            return None

        print("Found data validations:")
        print("-" * 80)

        # Find validation for D3
        for dv in data_validations.findall('.//main:dataValidation', NS):
            sqref = dv.get('sqref', '')
            print(f"\nValidation for cells: {sqref}")

            # Get the formula
            formula1 = dv.find('.//main:formula1', NS)
            if formula1 is not None and formula1.text:
                print(f"  Formula: {formula1.text}")

                # Check if this is for D3
                if 'D3' in sqref:
                    print(f"  ✓ This is the D3 dropdown!")

                    # Parse the formula to extract options
                    formula_text = formula1.text.strip()

                    # Check if it's a list formula (like "Option1,Option2,Option3")
                    if ',' in formula_text and not formula_text.startswith('='):
                        options = [opt.strip().strip('"') for opt in formula_text.split(',')]
                        print(f"  Options: {options}")
                        return options

                    # Check if it's a range reference (like "Sheet1!A1:A10")
                    elif formula_text.startswith('='):
                        print(f"  This is a range reference: {formula_text}")
                        print(f"  Need to resolve the range to get values")
                        return formula_text

                    else:
                        print(f"  Unknown formula type")
                        return formula_text

        return None

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

def get_cell_value(cell, shared_strings):
    """Extract value from a cell element"""
    cell_type = cell.get('t', 'n')
    v = cell.find('main:v', NS)

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

def resolve_range_reference(zip_ref, range_formula, shared_strings):
    """Resolve a range reference like ='Use Case'!$D$3:$D$8 to get the values"""
    # Parse the formula
    match = re.search(r"'([^']+)'!\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)", range_formula)
    if not match:
        # Try without sheet name
        match = re.search(r"\$?([A-Z]+)\$?(\d+):\$?([A-Z]+)\$?(\d+)", range_formula)
        if not match:
            print(f"Could not parse range formula: {range_formula}")
            return []

        sheet_name = 'Use Case'  # Default to current sheet
        start_col, start_row, end_col, end_row = match.groups()
    else:
        sheet_name, start_col, start_row, end_col, end_row = match.groups()

    print(f"\nResolving range: {sheet_name} from {start_col}{start_row} to {end_col}{end_row}")

    # Find the sheet
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

    with zip_ref.open('xl/_rels/workbook.xml.rels') as f:
        tree = ET.parse(f)
        root = tree.getroot()

        sheet_file = None
        for rel in root.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
            if rel.get('Id') == sheet_id:
                sheet_file = 'xl/' + rel.get('Target')
                break

    # Parse sheet and extract values
    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        values = []
        sheet_data = root.find('.//main:sheetData', NS)

        start_row_idx = int(start_row) - 1
        end_row_idx = int(end_row) - 1

        for row_elem in sheet_data.findall('.//main:row', NS):
            row_idx = int(row_elem.get('r')) - 1

            if row_idx < start_row_idx or row_idx > end_row_idx:
                continue

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                # Check if this cell is in our range
                col_letter = ref[0]
                if col_letter == start_col or col_letter == end_col:
                    value = get_cell_value(cell, shared_strings)
                    if value and str(value).strip():
                        values.append(str(value).strip())

        return values

def main():
    print(f"Extracting dropdown from cell D3 in {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        sheet_file = find_use_case_sheet_file(zip_ref)

        if not sheet_file:
            print("ERROR: Could not find Use Case sheet")
            return

        print(f"Found sheet file: {sheet_file}\n")

        result = extract_dropdown_validation(zip_ref, sheet_file, shared_strings)

        if result and isinstance(result, str) and result.startswith('='):
            # It's a range reference, need to resolve it
            options = resolve_range_reference(zip_ref, result, shared_strings)
            print(f"\n✓ Found {len(options)} use case options:")
            for i, opt in enumerate(options, 1):
                print(f"  {i}. {opt}")
        elif result:
            print(f"\n✓ Found {len(result)} use case options:")
            for i, opt in enumerate(result, 1):
                print(f"  {i}. {opt}")
        else:
            print("\nNo dropdown found for D3")

if __name__ == "__main__":
    main()
