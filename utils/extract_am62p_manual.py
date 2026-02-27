#!/usr/bin/env python3
"""
Manual Excel extraction using only Python built-in libraries (zipfile + xml)
This avoids the need for openpyxl or pandas which have network dependency issues.
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re
from pathlib import Path

EXCEL_FILE = "../SPRUJD9_AM62P_PET_1_1.xlsm"
OUTPUT_DIR = "../data"

# Excel XML namespaces
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
    cell_type = cell.get('t', 'n')  # n=number, s=shared string, str=inline string
    v = cell.find('main:v', NS)

    if v is None or v.text is None:
        return None

    if cell_type == 's':  # Shared string
        idx = int(v.text)
        if 0 <= idx < len(shared_strings):
            return shared_strings[idx]
        return None
    elif cell_type == 'str':  # Inline string
        return v.text
    elif cell_type == 'b':  # Boolean
        return v.text == '1'
    else:  # Number
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

    # Convert column letters to index (A=0, B=1, ..., Z=25, AA=26, etc.)
    col_idx = 0
    for char in col_str:
        col_idx = col_idx * 26 + (ord(char) - ord('A') + 1)
    col_idx -= 1  # Make it 0-indexed

    row_idx = int(row_str) - 1  # Make it 0-indexed

    return col_idx, row_idx

def get_sheet_data(zip_ref, sheet_name, shared_strings):
    """Extract data from a specific sheet"""
    # First, find the sheet ID from workbook.xml
    with zip_ref.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = root.find('.//main:sheets', NS)

        sheet_id = None
        for sheet in sheets.findall('.//main:sheet', NS):
            if sheet.get('name') == sheet_name:
                # Get the r:id attribute
                rid = sheet.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
                sheet_id = rid
                break

        if not sheet_id:
            return None

    # Now find the actual sheet file using workbook.xml.rels
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

    # Parse the sheet
    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        # Create a 2D array to store the data
        data = {}

        sheet_data = root.find('.//main:sheetData', NS)
        if sheet_data is None:
            return {}

        for row_elem in sheet_data.findall('.//main:row', NS):
            row_idx = int(row_elem.get('r')) - 1  # Convert to 0-indexed

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                value = get_cell_value(cell, shared_strings)

                if row_idx not in data:
                    data[row_idx] = {}
                data[row_idx][col_idx] = value

        return data

def extract_sheet_as_table(sheet_data, header_row=0):
    """Convert sheet data to a list of dicts with column headers"""
    if not sheet_data or header_row not in sheet_data:
        return []

    # Get headers
    headers = {}
    for col_idx, value in sheet_data[header_row].items():
        if value:
            headers[col_idx] = str(value).strip()

    # Extract rows
    rows = []
    for row_idx in sorted(sheet_data.keys()):
        if row_idx <= header_row:
            continue

        row_data = {}
        for col_idx, header in headers.items():
            value = sheet_data[row_idx].get(col_idx)
            row_data[header] = value

        # Only add rows with at least one non-None value
        if any(v is not None for v in row_data.values()):
            rows.append(row_data)

    return rows

def extract_am62p_data():
    """Main extraction function"""
    print(f"Opening {EXCEL_FILE}...")

    try:
        with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
            print("Extracting shared strings...")
            shared_strings = get_shared_strings(zip_ref)
            print(f"Found {len(shared_strings)} shared strings")

            # List available sheets
            with zip_ref.open('xl/workbook.xml') as f:
                tree = ET.parse(f)
                root = tree.getroot()
                sheets_elem = root.find('.//main:sheets', NS)

                print("\nAvailable sheets:")
                sheet_names = []
                for sheet in sheets_elem.findall('.//main:sheet', NS):
                    sheet_name = sheet.get('name')
                    sheet_names.append(sheet_name)
                    print(f"  - {sheet_name}")

            # Extract PWRCALC sheet (SoCDB)
            print("\n" + "="*60)
            print("Extracting PWRCALC sheet...")
            pwrcalc_data = get_sheet_data(zip_ref, 'PWRCALC', shared_strings)
            if pwrcalc_data:
                pwrcalc_table = extract_sheet_as_table(pwrcalc_data, header_row=0)
                print(f"Found {len(pwrcalc_table)} rows in PWRCALC")

                # Show first few rows for debugging
                if pwrcalc_table:
                    print("\nFirst row sample:")
                    for key, val in list(pwrcalc_table[0].items())[:5]:
                        print(f"  {key}: {val}")

                # Save raw data for inspection
                with open(f"{OUTPUT_DIR}/am62p_pwrcalc_raw.json", "w") as f:
                    json.dump(pwrcalc_table[:10], f, indent=2)  # Save first 10 rows
                print(f"Saved sample to am62p_pwrcalc_raw.json")

            # Extract Control Panel sheet (Dropdowns)
            print("\n" + "="*60)
            print("Extracting Control Panel sheet...")
            control_panel_data = get_sheet_data(zip_ref, 'Control Panel', shared_strings)
            if control_panel_data:
                print(f"Found {len(control_panel_data)} rows in Control Panel")

                # Save raw data for inspection
                sample_rows = {}
                for row_idx in sorted(control_panel_data.keys())[:50]:
                    sample_rows[row_idx] = {col_idx: control_panel_data[row_idx].get(col_idx)
                                           for col_idx in range(10)}  # First 10 columns

                with open(f"{OUTPUT_DIR}/am62p_control_panel_raw.json", "w") as f:
                    json.dump(sample_rows, f, indent=2)
                print(f"Saved sample to am62p_control_panel_raw.json")

            # Extract Use Cases sheet
            print("\n" + "="*60)
            print("Extracting Use Cases sheet...")
            usecases_data = get_sheet_data(zip_ref, 'Use Cases', shared_strings)
            if usecases_data:
                # Try different header rows
                for header_row in [0, 1, 2]:
                    usecases_table = extract_sheet_as_table(usecases_data, header_row=header_row)
                    if usecases_table:
                        print(f"Found {len(usecases_table)} rows in Use Cases (header row {header_row})")

                        if usecases_table:
                            print(f"\nHeaders found: {list(usecases_table[0].keys())[:5]}")

                        with open(f"{OUTPUT_DIR}/am62p_usecases_raw_h{header_row}.json", "w") as f:
                            json.dump(usecases_table[:10], f, indent=2)
                        print(f"Saved sample to am62p_usecases_raw_h{header_row}.json")

            print("\n" + "="*60)
            print("Raw extraction complete!")
            print("Check the generated JSON files to understand the data structure.")
            print("Next step: Create proper data transformation functions.")

    except FileNotFoundError:
        print(f"Error: Could not find {EXCEL_FILE}")
        print("Make sure the Excel file is in the project root directory.")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    extract_am62p_data()
