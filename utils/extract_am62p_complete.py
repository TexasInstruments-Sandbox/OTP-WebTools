#!/usr/bin/env python3
"""
Complete AM62P data extraction from Excel
Based on actual sheet structure discovered from exploration
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

def safe_float(val, default=0.0):
    if val is None or val == '' or str(val).strip() == '' or val == '#N/A':
        return default
    try:
        return float(val)
    except:
        return default

def safe_str(val, default=''):
    if val is None or val == '' or val == '#N/A':
        return default
    return str(val).strip()

def extract_socdb(data):
    """Extract SoC database from PWRCALC sheet"""
    print("Extracting SoCDB from PWRCALC sheet...")

    # Headers are in row 3 (index 2)
    headers = {}
    for col_idx, value in data.get(2, {}).items():
        if value:
            headers[col_idx] = str(value).strip()

    print(f"Found headers: {list(headers.values())[:10]}")

    socdb = {}

    # Process data rows (starting from row 4, index 3)
    for row_idx in range(3, 200):  # Reasonable limit
        if row_idx not in data:
            continue

        row = data[row_idx]

        # Get physical name and instance name
        phys_name = None
        inst_name = None

        for col_idx, header in headers.items():
            if 'Physical' in header and 'Name' in header:
                phys_name = safe_str(row.get(col_idx))
            elif 'Insance' in header or 'Instance' in header:
                inst_name = safe_str(row.get(col_idx))

        # Skip if no physical name or if it's #N/A
        if not phys_name or phys_name == '#N/A' or phys_name == 'nan':
            continue

        # Create key
        key = f"{phys_name}_{inst_name}"

        # Extract all relevant columns
        entry = {
            "physical_name": phys_name,
            "instance_name": inst_name,
        }

        for col_idx, header in headers.items():
            value = row.get(col_idx)

            # Map header names to fields
            if header == 'qty':
                entry['qty'] = safe_float(value, 1.0)
            elif header == 'vdd':
                entry['vdd_domain'] = safe_str(value, 'VDD_CORE')
            elif header == 'type':
                entry['type'] = safe_str(value)
            elif header == 'function':
                entry['function'] = safe_str(value)
            elif 'Total mW' in header:
                entry['total_mw'] = safe_float(value)

        socdb[key] = entry

    print(f"Extracted {len(socdb)} components")
    return socdb

def extract_usecase_config(data):
    """Extract use case configuration from Use Case sheet"""
    print("Extracting use case configuration...")

    config = {}

    # Temperature is in row 7, column C (index 2)
    if 6 in data and 2 in data[6]:
        config['temperature'] = safe_float(data[6][2], 38)

    # SRAM voltage in row 8
    if 7 in data and 2 in data[7]:
        config['sram_voltage'] = safe_float(data[7][2], 0.85)

    # CORE voltage in row 9
    if 8 in data and 2 in data[8]:
        config['core_voltage'] = safe_float(data[8][2], 0.75)

    # Process corner in row 10
    if 9 in data and 2 in data[9]:
        config['process_corner'] = safe_str(data[9][2], 'nominal')

    # OPP in row 11
    if 10 in data and 2 in data[10]:
        config['opp'] = safe_str(data[10][2], 'high')

    print(f"Configuration: {config}")
    return config

def extract_mdb_lookups(data):
    """Extract mode lookup tables from MDB sheet"""
    print("Extracting MDB lookup tables...")

    # Headers are in row 3 (index 2)
    headers = {}
    for col_idx, value in data.get(2, {}).items():
        if value:
            headers[col_idx] = str(value).strip()

    print(f"MDB Headers: {list(headers.values())}")

    lookups = {}

    # Process data rows
    for row_idx in range(3, 500):  # MDB can be large
        if row_idx not in data:
            continue

        row = data[row_idx]

        lookup_str = safe_str(row.get(0))  # Column A
        cell_name = safe_str(row.get(1))   # Column B
        attribute = safe_str(row.get(2))   # Column C
        mode = safe_str(row.get(3))        # Column D
        value = safe_float(row.get(4))     # Column E

        if not lookup_str or not cell_name:
            continue

        key = f"{cell_name}_{attribute}_{mode}"
        lookups[key] = {
            "lookup_string": lookup_str,
            "cell_name": cell_name,
            "attribute": attribute,
            "mode": mode,
            "value": value
        }

    print(f"Extracted {len(lookups)} MDB entries")
    return lookups

def main():
    print(f"Extracting data from {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        print(f"Loaded {len(shared_strings)} shared strings\n")

        # Extract PWRCALC -> SoCDB
        print("="*60)
        pwrcalc_data = get_sheet_data(zip_ref, 'PWRCALC', shared_strings)
        socdb = extract_socdb(pwrcalc_data)

        with open(f"{OUTPUT_DIR}/am62p_socdb.js", "w") as f:
            f.write("/**\n")
            f.write(" * AM62P SoC Component Database\n")
            f.write(" * Extracted from SPRUJD9_AM62P_PET_1_1.xlsm - PWRCALC sheet\n")
            f.write(" */\n\n")
            f.write("window.TI_AM62P_SOCDB = ")
            f.write(json.dumps(socdb, indent=4))
            f.write(";\n\n")
            f.write(f"console.log('AM62P SoCDB loaded: {len(socdb)} components');\n")

        print(f"✓ Saved to {OUTPUT_DIR}/am62p_socdb.js\n")

        # Extract Use Case sheet -> Configuration
        print("="*60)
        usecase_data = get_sheet_data(zip_ref, 'Use Case', shared_strings)
        config = extract_usecase_config(usecase_data)

        with open(f"{OUTPUT_DIR}/am62p_usecase_config.json", "w") as f:
            json.dump(config, f, indent=2)

        print(f"✓ Saved to {OUTPUT_DIR}/am62p_usecase_config.json\n")

        # Extract MDB sheet -> Lookup tables
        print("="*60)
        mdb_data = get_sheet_data(zip_ref, 'MDB', shared_strings)
        mdb_lookups = extract_mdb_lookups(mdb_data)

        with open(f"{OUTPUT_DIR}/am62p_mdb_lookups.json", "w") as f:
            json.dump(mdb_lookups, f, indent=2)

        print(f"✓ Saved to {OUTPUT_DIR}/am62p_mdb_lookups.json\n")

        print("="*60)
        print("Extraction complete!")
        print("\nGenerated files:")
        print(f"  - {OUTPUT_DIR}/am62p_socdb.js ({len(socdb)} components)")
        print(f"  - {OUTPUT_DIR}/am62p_usecase_config.json")
        print(f"  - {OUTPUT_DIR}/am62p_mdb_lookups.json ({len(mdb_lookups)} lookups)")

if __name__ == "__main__":
    main()
