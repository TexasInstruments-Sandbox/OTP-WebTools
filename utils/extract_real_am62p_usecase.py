#!/usr/bin/env python3
"""
Extract the REAL UC2 Industrial HMI use case from AM62P Excel Use Case sheet
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

def get_pwrcalc_components(zip_ref, shared_strings):
    """Get list of component names from PWRCALC sheet"""
    # Find PWRCALC sheet
    with zip_ref.open('xl/workbook.xml') as f:
        tree = ET.parse(f)
        root = tree.getroot()
        sheets = root.find('.//main:sheets', NS)

        sheet_id = None
        for sheet in sheets.findall('.//main:sheet', NS):
            if sheet.get('name') == 'PWRCALC':
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

    with zip_ref.open(sheet_file) as f:
        tree = ET.parse(f)
        root = tree.getroot()

        components = []
        sheet_data = root.find('.//main:sheetData', NS)

        for row_elem in sheet_data.findall('.//main:row', NS):
            row_idx = int(row_elem.get('r')) - 1

            if row_idx < 3:  # Skip header rows
                continue

            physical_name = None
            instance_name = None

            for cell in row_elem.findall('.//main:c', NS):
                ref = cell.get('r')
                col_idx, _ = parse_cell_reference(ref)

                value = get_cell_value(cell, shared_strings)

                if col_idx == 0:  # Physical Name
                    physical_name = value
                elif col_idx == 1:  # Instance Name
                    instance_name = value

            if physical_name and str(physical_name) != '#N/A':
                component_key = f"{physical_name}__{instance_name}" if instance_name else str(physical_name)
                components.append((row_idx, component_key))

        return components

def main():
    print(f"Extracting REAL AM62P use case from {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        shared_strings = get_shared_strings(zip_ref)
        use_case_data = explore_use_case_sheet(zip_ref, shared_strings)
        pwrcalc_components = get_pwrcalc_components(zip_ref, shared_strings)

        if not use_case_data:
            print("ERROR: Could not load Use Case sheet")
            return

        # Column D (index 3) contains "UC2 Industrial HMI"
        uc_col = 3
        uc_name = "uc2_industrial_hmi"

        # Get use case name from row 3
        uc_display_name = use_case_data.get(2, {}).get(uc_col, 'UC2 Industrial HMI')

        print(f"Extracting: {uc_display_name}")
        print("="*80)

        usecase_config = {}

        # Extract global settings (rows 7-11)
        # Row 7: Tj (temperature)
        # Row 8: SRAM_Voltage
        # Row 9: CORE_Voltage
        # Row 10: Process_Corner
        # Row 11: OPP

        tj_val = use_case_data.get(6, {}).get(uc_col, None)  # Row 7
        if tj_val is not None:
            usecase_config["Tj"] = {"utilization": tj_val, "mode": ""}

        sram_voltage = use_case_data.get(7, {}).get(uc_col, None)  # Row 8
        if sram_voltage is not None:
            usecase_config["VDD_CORE_SRAM_Voltage"] = {"utilization": sram_voltage, "mode": ""}

        core_voltage = use_case_data.get(8, {}).get(uc_col, None)  # Row 9
        if core_voltage is not None:
            usecase_config["VDD_CORE_Voltage"] = {"utilization": core_voltage, "mode": ""}

        process_corner = use_case_data.get(9, {}).get(uc_col, None)  # Row 10
        if process_corner is not None:
            usecase_config["Process_Corner"] = {"utilization": 0.0, "mode": str(process_corner)}

        print(f"\nGlobal Settings:")
        print(f"  Temperature (Tj): {tj_val}")
        print(f"  SRAM Voltage: {sram_voltage}")
        print(f"  CORE Voltage: {core_voltage}")
        print(f"  Process Corner: {process_corner}")

        # Extract component utilization and modes
        # Need to map Use Case sheet rows to PWRCALC component names

        # For now, output as JSON
        output = {
            uc_name: usecase_config
        }

        output_file = "../data/am62p_usecases_real.json"
        with open(output_file, 'w') as f:
            json.dump(output, f, indent=2)

        print(f"\n✓ Extracted use case saved to {output_file}")

if __name__ == "__main__":
    main()
