#!/usr/bin/env python3
"""
Find named ranges in the Excel file that might contain use case lists
"""

import zipfile
import xml.etree.ElementTree as ET

EXCEL_FILE = "../SPRUJD9_AM62P_PET_1_1.xlsm"

NS = {
    'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

def find_named_ranges(zip_ref):
    """Find all named ranges in the workbook"""
    try:
        with zip_ref.open('xl/workbook.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()

            # Look for definedNames element
            defined_names = root.find('.//main:definedNames', NS)

            if defined_names is None:
                print("No named ranges found")
                return

            print("Named Ranges:")
            print("="*100)

            for name_elem in defined_names.findall('.//main:definedName', NS):
                name = name_elem.get('name', '')
                value = name_elem.text if name_elem.text else ''

                # Only show names that might be related to use cases or modes
                if any(keyword in name.lower() for keyword in ['use', 'case', 'uc', 'mode', 'drop', 'list']):
                    print(f"\n{name}:")
                    print(f"  Value: {value}")

            print("\n" + "="*100)
            print("ALL Named Ranges:")
            print("="*100)

            for name_elem in defined_names.findall('.//main:definedName', NS):
                name = name_elem.get('name', '')
                value = name_elem.text if name_elem.text else ''
                print(f"{name}: {value[:100]}")  # Truncate long values

    except Exception as e:
        print(f"Error: {e}")

def main():
    print(f"Finding named ranges in {EXCEL_FILE}...\n")

    with zipfile.ZipFile(EXCEL_FILE, 'r') as zip_ref:
        find_named_ranges(zip_ref)

if __name__ == "__main__":
    main()
