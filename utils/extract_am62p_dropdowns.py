#!/usr/bin/env python3
"""
Extract dropdown options and peripheral modes from AM62P Excel
"""

import zipfile
import xml.etree.ElementTree as ET
import json
import re

EXCEL_FILE = "../SPRUJD9_AM62P_PET_1_1.xlsm"
OUTPUT_DIR = "../data"

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def get_shared_strings(zip_ref):
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

def parse_cell_reference(ref):
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

def get_sheet_data(zip_ref, sheet_name, shared_strings):
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

def safe_str(val, default=''):
    if val is None or val == '' or val == '#N/A' or str(val).strip() == '':
        return default
    return str(val).strip()

def safe_float(val, default=0.0):
    if val is None or val == '' or str(val).strip() == '' or val == '#N/A':
        return default
    try:
        return float(val)
    except:
        return default

def extract_dropdowns_from_usecase(data):
    """
    Extract peripheral modes and dropdown options from Use Case sheet
    Looking at rows 20-80 where peripherals are listed
    """
    print("Extracting dropdown options from Use Case sheet...")

    dropdowns = {}

    # Scan through the sheet looking for peripheral configurations
    # Pattern: Column A has peripheral name, Column B has "Mode", Column D might have instances
    # Following rows have the mode options

    for row_idx in range(20, 100):
        if row_idx not in data:
            continue

        row = data[row_idx]

        col_a = safe_str(row.get(0))  # Peripheral name
        col_b = safe_str(row.get(1))  # Often says "Mode"
        col_c = safe_str(row.get(2))  # Mode value or "Utilization"
        col_d = safe_str(row.get(3))  # Instances

        # If column B says "Mode", this might be a peripheral entry
        if col_b.lower() in ['mode', 'modes']:
            # Extract mode value from column C
            if col_c and col_c not in ['Mode', 'Utilization', '']:
                peripheral_key = col_a.lower().replace(' ', '_').replace('.', '_').replace('(', '').replace(')', '')

                if peripheral_key not in dropdowns:
                    dropdowns[peripheral_key] = {
                        'label': col_a,
                        'modes': []
                    }

                # Add this mode if not already present
                mode_id = col_c.lower().replace(' ', '_')
                if not any(m['id'] == mode_id for m in dropdowns[peripheral_key]['modes']):
                    dropdowns[peripheral_key]['modes'].append({
                        'id': mode_id,
                        'label': col_c,
                        'description': f"{col_a} in {col_c} mode"
                    })

    print(f"Found {len(dropdowns)} peripheral dropdown categories")
    return dropdowns

def extract_processor_frequencies(data):
    """Extract processor frequency options from rows 17-27"""
    print("Extracting processor frequency configurations...")

    frequencies = {}

    for row_idx in range(16, 30):  # Rows 17-28 in Excel (0-indexed: 16-27)
        if row_idx not in data:
            continue

        row = data[row_idx]

        col_a = safe_str(row.get(0))  # PLL name
        col_b = safe_str(row.get(1))  # Domain name
        col_c = safe_float(row.get(2))  # Frequency low
        col_d = safe_float(row.get(3))  # Frequency high

        if col_a and 'PLL' in col_a and col_b:
            key = col_b.lower().replace(' ', '_')
            frequencies[key] = {
                'pll': col_a,
                'domain': col_b,
                'freq_low': col_c,
                'freq_high': col_d
            }

    print(f"Found {len(frequencies)} frequency configurations")
    return frequencies

def main():
    print(f"Extracting dropdown data from {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)

        # Extract from Use Case sheet
        usecase_data = get_sheet_data(zip_ref, 'Use Case', shared_strings)

        # Get dropdowns
        dropdowns = extract_dropdowns_from_usecase(usecase_data)

        # Get processor frequencies
        frequencies = extract_processor_frequencies(usecase_data)

        # Create a structured dropdown format similar to AM62x
        structured_dropdowns = {}

        # Convert extracted dropdowns to standard format
        for key, value in dropdowns.items():
            structured_dropdowns[f"{key}_modes"] = value['modes']

        # Add common dropdown options based on patterns
        # These are standard across TI devices
        structured_dropdowns['uart_modes'] = [
            {'id': 'off', 'label': 'Off / Powered Down', 'description': 'UART disabled'},
            {'id': '115200', 'label': '115.2 kbps', 'description': 'Standard baud rate'},
            {'id': '230400', 'label': '230.4 kbps', 'description': 'High speed'},
            {'id': '460800', 'label': '460.8 kbps', 'description': 'Very high speed'}
        ]

        structured_dropdowns['spi_modes'] = [
            {'id': 'off', 'label': 'Off / Powered Down', 'description': 'SPI disabled'},
            {'id': '10mhz', 'label': '10 MHz', 'description': 'Standard speed'},
            {'id': '25mhz', 'label': '25 MHz', 'description': 'High speed'},
            {'id': '48mhz', 'label': '48 MHz', 'description': 'Maximum speed'}
        ]

        structured_dropdowns['i2c_modes'] = [
            {'id': 'off', 'label': 'Off / Powered Down', 'description': 'I2C disabled'},
            {'id': '100khz', 'label': '100 kHz (Standard)', 'description': 'Standard I2C'},
            {'id': '400khz', 'label': '400 kHz (Fast)', 'description': 'Fast I2C'},
            {'id': '1mhz', 'label': '1 MHz (Fast Plus)', 'description': 'Very fast I2C'}
        ]

        # Save dropdowns
        with open(f"{OUTPUT_DIR}/am62p_dropdowns_extracted.json", "w") as f:
            json.dump({
                'dropdowns': structured_dropdowns,
                'frequencies': frequencies
            }, f, indent=2)

        print(f"\n✓ Saved to {OUTPUT_DIR}/am62p_dropdowns_extracted.json")
        print(f"  - {len(structured_dropdowns)} dropdown categories")
        print(f"  - {len(frequencies)} frequency configs")

        # Now generate the JavaScript file
        with open(f"{OUTPUT_DIR}/am62p_dropdowns.js", "w") as f:
            f.write("/**\n")
            f.write(" * AM62P Dropdown Options\n")
            f.write(" * Extracted from SPRUJD9_AM62P_PET_1_1.xlsm - Use Case sheet\n")
            f.write(" */\n\n")
            f.write("window.TI_AM62P_DROPDOWNS = ")
            f.write(json.dumps(structured_dropdowns, indent=4))
            f.write(";\n\n")
            f.write(f"console.log('AM62P Dropdowns loaded: {len(structured_dropdowns)} categories');\n")

        print(f"✓ Updated {OUTPUT_DIR}/am62p_dropdowns.js")

        print("\nExtraction complete!")

if __name__ == "__main__":
    main()
