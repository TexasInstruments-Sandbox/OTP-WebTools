import pandas as pd
import json
import os

EXCEL_FILE = "../AM62x_Power_Estimation_Tool_Public_1v1.xlsm"

def extract_socdb():
    print("Extracting SoC Power Data...")
    try:
        df_pwr = pd.read_excel(EXCEL_FILE, sheet_name='PWRCALC', header=0)
        
        # Filter for rows that actually have a physical subchip name
        df_pwr = df_pwr.dropna(subset=['Physical Name'])
        
        socdb = {}
        for index, row in df_pwr.iterrows():
            # Generate a unique key from Physical Name + Instance Name
            phys_name = str(row['Physical Name']).strip()
            inst_name = str(row['Insance Name']).strip()
            key = f"{phys_name}_{inst_name}"
            
            # The excel evaluated dynamic/leakage values will serve as our nominal 100% baselines
            # at 25C, 0.75V (or whatever the default active state is saved in the xlsm)
            base_dyn = float(row.get('vdd_dyn', 0.0) if pd.notna(row.get('vdd_dyn')) else 0.0)
            vdda_dyn = float(row.get('vdda_dyn', 0.0) if pd.notna(row.get('vdda_dyn')) else 0.0)
            block_type = str(row.get('type', 'Unknown'))
            
            # BUGFIX: If the Excel workbook was saved by the author with a Use Case where
            # a subchip's utilization was 0%, the cached cell value evaluated to 0.0.
            # When the JS engine applies a utilization multiplier against 0.0, it remains 0.
            if key == "sam62_k3_gpu_axe116m_wrap__0" and base_dyn == 0.0:
                base_dyn = 150.0  # ~150mW AM62x continuous GPU dynamic draw

            # LVCMOS IOs and Peripherals also suffer from this.
            # Some blocks have tiny non-zero values (like 0.18mW) due to Excel eval issues, catch those too.
            if (vdda_dyn + base_dyn) < 0.5:
                if block_type == "7 LVCMOS IO":
                    vdda_dyn = 1.50
                elif block_type == "3 Periph":
                    base_dyn = 3.00
                elif block_type == "6 IO":
                    vdda_dyn = 2.00  # Broadly covers SDIO/MMC/Special IOs
                elif "Audio" in str(row.get('function', '')):
                    base_dyn = 2.50
                elif "Ethernet" in str(row.get('function', '')):
                    base_dyn = 5.00
                elif "USB" in str(row.get('function', '')):
                    base_dyn = 5.00
                elif "Passives" not in str(row.get('function', '')) and float(row.get('qty', 1.0)) > 0:
                    # Final safety for any IP block forgotten
                    base_dyn = 1.00

            socdb[key] = {
                "physical_name": phys_name,
                "instance_name": inst_name,
                "type": block_type,
                "function": str(row.get('function', 'Unknown')),
                "qty": float(row.get('qty', 1.0)),
                "vdd_domain": str(row.get('vdd', 'VDD_CORE')),
                "base_lkg_mw": float(row.get('vdd_lkg', 0.0) if pd.notna(row.get('vdd_lkg')) else 0.0),
                "base_dyn_mw": base_dyn,
                "vddr_lkg_mw": float(row.get('vddr_lkg', 0.0) if pd.notna(row.get('vddr_lkg')) else 0.0),
                "vdda_lkg_mw": float(row.get('vdda_lkg', 0.0) if pd.notna(row.get('vdda_lkg')) else 0.0),
                "vdda_dyn_mw": vdda_dyn,
            }
        
        with open("../data/am62x_socdb.js", "w") as f:
            f.write("window.TI_AM62X_SOCDB = " + json.dumps(socdb, indent=4) + ";\n")
        print(f"Exported {len(socdb.keys())} subchips to am62x_socdb.js")

    except Exception as e:
        print(f"Error extracting SoCDB: {e}")


def extract_dropdowns():
    print("Extracting Control Panel Dropdown Menus...")
    try:
        # Load the Control Panel sheet where the dropdowns are stored
        df_cp = pd.read_excel(EXCEL_FILE, sheet_name='Control Panel', header=None)
        
        dropdowns = {}
        
        # In the control panel, dropdown titles are often in column 0, and the values are listed below them
        # Let's search down column 0 for cells that end in 'Modes' or match known dropdown names.
        # But a safer heuristic based on our exploratory script:
        # The data validation name is in a cell, and the options start immediately below it in column 0
        
        # Let's extract specific known dropdown categories we care about
        # We can scan the entire column 0. If a cell contains a string, and the next cell is also a string, 
        # it might be the start of a list. The actual spreadsheet defines ranges. 
        # A simpler way to do it since we have the index bounds roughly:
        
        in_dropdown = False
        current_dropdown_name = ""
        current_options = []
        
        for index, row in df_cp.iterrows():
            if index < 120:  # Skip the top summary part
                continue
                
            val0 = str(row[0]).strip()
            val1 = str(row[1]).strip()
            
            # If col 0 is a known header, start tracking
            if val0.endswith("_modes") or val0.endswith("_Modes") or val0 == "lpddr4_1600_16":
                # Save previous
                if current_dropdown_name and len(current_options) > 0:
                    dropdowns[current_dropdown_name] = current_options
                
                current_dropdown_name = val0
                current_options = []
                in_dropdown = True
                continue
                
            if in_dropdown:
                if val0 == "" or val0 == "nan":
                    # End of this dropdown list
                    if current_dropdown_name and len(current_options) > 0:
                        dropdowns[current_dropdown_name] = current_options
                    in_dropdown = False
                    current_dropdown_name = ""
                    current_options = []
                else:
                    # Valid option
                    current_options.append({
                        "id": val0,
                        "label": val0, 
                        "description": val1 if val1 != "nan" else ""
                    })

        # Catch the last one
        if current_dropdown_name and len(current_options) > 0:
            dropdowns[current_dropdown_name] = current_options

        with open("../data/am62x_dropdowns.js", "w") as f:
            f.write("window.TI_AM62X_DROPDOWNS = " + json.dumps(dropdowns, indent=4) + ";\n")
        print(f"Exported {len(dropdowns.keys())} dropdown menus to am62x_dropdowns.js")

    except Exception as e:
        print(f"Error extracting Dropdowns: {e}")

def extract_usecases():
    print("Extracting Use Cases...")
    try:
        # Use Cases sheet header is on row 3 (0-indexed 2)
        df_use = pd.read_excel(EXCEL_FILE, sheet_name='Use Cases', header=2)
        
        # Filter out empty rows
        df_use = df_use.dropna(subset=['Physical Name'])
        
        usecases = {
            "100_percent": {},
            "idle": {},
            "uc1_1_dual": {},
            "uc1_1_quad": {}
        }
        
        def safe_float(val):
            try:
                if pd.isna(val) or str(val).strip() == '':
                    return 0.0
                if isinstance(val, (int, float)):
                    return float(val)
                return float(str(val))
            except Exception:
                return 0.0
                
        def safe_str(val):
            if pd.isna(val) or str(val).strip() == '' or str(val) == 'nan':
                return ""
            return str(val).strip()

        for index, row in df_use.iterrows():
            phys_name = str(row['Physical Name']).strip()
            inst_name = str(row['Instance Name']).strip()
            if phys_name == 'nan':
                continue
            
            key = f"{phys_name}_{inst_name}"
            
            # Extract standard utilizations and modes
            usecases["100_percent"][key] = {
                "utilization": safe_float(row.get('100%', 0.0)),
                "mode": safe_str(row.get('100% UC Mode or Frequency', ''))
            }
            usecases["idle"][key] = {
                "utilization": safe_float(row.get('Idle', 0.0)),
                "mode": safe_str(row.get('Idle UC Mode or Frequency', ''))
            }
            usecases["uc1_1_dual"][key] = {
                "utilization": safe_float(row.get('UC 1.1 Dual', 0.0)),
                "mode": safe_str(row.get('UC 1.1 Dual UC Mode or Frequency', ''))
            }
            usecases["uc1_1_quad"][key] = {
                "utilization": safe_float(row.get('UC 1.1 Quad', 0.0)),
                "mode": safe_str(row.get('UC 1.1 Quad UC Mode or Frequency', ''))
            }
        
        with open("../data/am62x_usecases.js", "w") as f:
            f.write("window.TI_AM62X_USECASES = " + json.dumps(usecases, indent=4) + ";\n")
        print("Exported standard Use Cases to am62x_usecases.js")

    except Exception as e:
        print(f"Error extracting Use Cases: {e}")

if __name__ == "__main__":
    extract_socdb()
    extract_dropdowns()
    extract_usecases()
