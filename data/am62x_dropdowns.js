window.TI_AM62X_DROPDOWNS = {
    "lpddr4_DDR4_16_1600_Modes": [
        {
            "id": "sleep",
            "label": "sleep",
            "description": "SoC is powered up but the DRAMs are in self refresh.  This is the lowest powered state for this PHY (since it does not have a power domain)."
        }
    ],
    "lpddr4_1600_16": [
        {
            "id": "lpddr4_1333_16",
            "label": "lpddr4_1333_16",
            "description": ""
        },
        {
            "id": "lpddr4_1067_16",
            "label": "lpddr4_1067_16",
            "description": ""
        },
        {
            "id": "lpddr4_800_16",
            "label": "lpddr4_800_16",
            "description": ""
        },
        {
            "id": "lpddr4_533_16",
            "label": "lpddr4_533_16",
            "description": ""
        },
        {
            "id": "lpddr4_100_16",
            "label": "lpddr4_100_16",
            "description": ""
        },
        {
            "id": "lpddr4_50_16",
            "label": "lpddr4_50_16",
            "description": ""
        },
        {
            "id": "ddr4_1600_16",
            "label": "ddr4_1600_16",
            "description": ""
        },
        {
            "id": "ddr4_1333_16",
            "label": "ddr4_1333_16",
            "description": ""
        },
        {
            "id": "ddr4_1067_16",
            "label": "ddr4_1067_16",
            "description": ""
        },
        {
            "id": "ddr4_800_16",
            "label": "ddr4_800_16",
            "description": ""
        },
        {
            "id": "ddr4_533_16",
            "label": "ddr4_533_16",
            "description": ""
        }
    ],
    "serdes_10g_common_modes": [
        {
            "id": "disable",
            "label": "disable",
            "description": "Here the PLL is off"
        },
        {
            "id": "suspend",
            "label": "suspend",
            "description": "Here the PLL is initialized but in it's lowest power state"
        },
        {
            "id": "1pll",
            "label": "1pll",
            "description": "turn on 1 pll and one clock reference"
        },
        {
            "id": "2pll",
            "label": "2pll",
            "description": "turn on 2 plls and two clock raferences (did not include 2 pll 1 ref because that's just plain wasteful)"
        }
    ],
    "serdes_10g_lane_modes": [
        {
            "id": "disable",
            "label": "disable",
            "description": "Lane not used (there are no power switches, so this is the lowest power state)"
        },
        {
            "id": "1g",
            "label": "1g",
            "description": "SGMII and several others - not going to specify every standard."
        },
        {
            "id": "3g",
            "label": "3g",
            "description": "PCIe G1, USB3 lowest rate, 2.5G Ethernet, Dataport\u2026not going to specify every intermediate rate"
        },
        {
            "id": "5g",
            "label": "5g",
            "description": "PCIe G2, USB3 Superspeed, 5G Ethernet, Datapost etc."
        },
        {
            "id": "8g",
            "label": "8g",
            "description": "PCIe G3, USB3.1, eDP"
        },
        {
            "id": "10g",
            "label": "10g",
            "description": "10G Ethernet (10.3G), USB3.2, some others."
        }
    ],
    "dphy_rx_modes": [
        {
            "id": "power_down_reset",
            "label": "power_down_reset",
            "description": "hold in reset - lowest power mode since it does not have power switchews"
        },
        {
            "id": "ulps",
            "label": "ulps",
            "description": "ultra low power mode"
        },
        {
            "id": "lprx",
            "label": "lprx",
            "description": "turns off SerDes and turns on a special low power channel"
        },
        {
            "id": "1p5g4l",
            "label": "1p5g4l",
            "description": ""
        },
        {
            "id": "2p5g4l",
            "label": "2p5g4l",
            "description": ""
        },
        {
            "id": "2p5g4l_5pct",
            "label": "2p5g4l_5pct",
            "description": "on/off mode toggling between ultra low power state and fastest transmission to save power"
        },
        {
            "id": "2p5g4l_15pct",
            "label": "2p5g4l_15pct",
            "description": "on/off mode toggling between ultra low power state and fastest transmission to save power"
        },
        {
            "id": "2p5g4l_25pct",
            "label": "2p5g4l_25pct",
            "description": "on/off mode toggling between ultra low power state and fastest transmission to save power"
        },
        {
            "id": "2p5g4l_50pct",
            "label": "2p5g4l_50pct",
            "description": "on/off mode toggling between ultra low power state and fastest transmission to save power"
        },
        {
            "id": "2p5g4l_75pct",
            "label": "2p5g4l_75pct",
            "description": "on/off mode toggling between ultra low power state and fastest transmission to save power"
        }
    ],
    "emmc8_hs400_phy_modes": [
        {
            "id": "off",
            "label": "off",
            "description": "Lowest power"
        },
        {
            "id": "sdr_25mbs",
            "label": "sdr_25mbs",
            "description": "for built in SDIO modes in the Arasan phy"
        },
        {
            "id": "sdr_50mbs",
            "label": "sdr_50mbs",
            "description": "for built in SDIO modes in the Arasan phy"
        },
        {
            "id": "ddr_100mbs",
            "label": "ddr_100mbs",
            "description": "for built in SDIO modes in the Arasan phy"
        },
        {
            "id": "sdr_100mbs",
            "label": "sdr_100mbs",
            "description": "for built in SDIO modes in the Arasan phy"
        },
        {
            "id": "ddr_200mbs",
            "label": "ddr_200mbs",
            "description": "for built in SDIO modes in the Arasan phy"
        },
        {
            "id": "hs200",
            "label": "hs200",
            "description": "HS200 mode"
        },
        {
            "id": "hs400",
            "label": "hs400",
            "description": "HS400 mode (probably going to be descoped due to silicon findings)."
        }
    ],
    "lvds_io_modes": [
        {
            "id": "disabled",
            "label": "disabled",
            "description": "Power down"
        },
        {
            "id": "aurora",
            "label": "aurora",
            "description": "3 LVDS lanes at 50-150 mbs each (one clock, one data, one sync).  It's DC termination dominated, so we don't offer multiple rates in drop down."
        },
        {
            "id": "mlb",
            "label": "mlb",
            "description": "3 LVDS lanes at 50-150 mbs each (one clock, one data, one sync).  It's DC termination dominated, so we don't offer multiple rates in drop down."
        }
    ],
    "pll_modes": [
        {
            "id": "0",
            "label": "0",
            "description": "The PLL power uses a complex equation with a ratio of frequency to 3200 mhz to the 1.5 power."
        },
        {
            "id": "250",
            "label": "250",
            "description": "Instead of plugging this equation into the power sheet as a unique formula (which is prone to be overwritten), it's calculated separately"
        },
        {
            "id": "500",
            "label": "500",
            "description": "and then a lookup table is used.  To limit the number of values, it's only entered in increments of 250 MHz.  When entering the"
        },
        {
            "id": "750",
            "label": "750",
            "description": "frequency in the use case sheet, the user must enter in 250 increments.  This can be done by an MROUND(freq,250) formula if needed, where FREQ"
        },
        {
            "id": "1000",
            "label": "1000",
            "description": "is pointing to another cell in the use case (e.g. the DDR PHY frequency *4).  However, we encourage users  just to enter it from the drop down provided."
        },
        {
            "id": "1250",
            "label": "1250",
            "description": ""
        },
        {
            "id": "1500",
            "label": "1500",
            "description": ""
        },
        {
            "id": "1750",
            "label": "1750",
            "description": ""
        },
        {
            "id": "2000",
            "label": "2000",
            "description": ""
        },
        {
            "id": "2250",
            "label": "2250",
            "description": ""
        },
        {
            "id": "2500",
            "label": "2500",
            "description": ""
        },
        {
            "id": "2750",
            "label": "2750",
            "description": ""
        },
        {
            "id": "3000",
            "label": "3000",
            "description": ""
        },
        {
            "id": "3250",
            "label": "3250",
            "description": ""
        },
        {
            "id": "3500",
            "label": "3500",
            "description": ""
        },
        {
            "id": "3750",
            "label": "3750",
            "description": ""
        }
    ],
    "hsdiv_modes": [
        {
            "id": "0",
            "label": "0",
            "description": "The HSDIV, similar to PLL, uses a complex formula which is a ratio of frequencies to a reference frequency."
        },
        {
            "id": "25",
            "label": "25",
            "description": "Instead of implementing a unique formula in the power calculation sheet, it's done separately and then entered into the power database as values."
        },
        {
            "id": "50",
            "label": "50",
            "description": "The user then selects an average frequency for all HSDIVs on the device from the drop down. This is highly approximate anyway, since most devices have"
        },
        {
            "id": "100",
            "label": "100",
            "description": "a large number of hsdivs (30-90 of them) at frequencies ranging from 100 mhz to 2000 mhz.  Therefore, it's a swag to guess the average frequency."
        },
        {
            "id": "200",
            "label": "200",
            "description": "The contribution is small relative to the other IP, so that's OK, but in deep sleep and low power modes, it's important to set the average frequency of all"
        },
        {
            "id": "300",
            "label": "300",
            "description": "hsdivs low or you get several mW of power (which obviously is inaccurate in a 5-10 mW total power use case)."
        },
        {
            "id": "400",
            "label": "400",
            "description": ""
        },
        {
            "id": "500",
            "label": "500",
            "description": ""
        },
        {
            "id": "600",
            "label": "600",
            "description": ""
        },
        {
            "id": "700",
            "label": "700",
            "description": ""
        },
        {
            "id": "800",
            "label": "800",
            "description": ""
        },
        {
            "id": "900",
            "label": "900",
            "description": ""
        },
        {
            "id": "1000",
            "label": "1000",
            "description": ""
        }
    ],
    "icssm_modes": [
        {
            "id": "rmii_rmii_3p3v",
            "label": "rmii_rmii_3p3v",
            "description": "ICSSM also has many bit banging modes and data capture modes.  We'll need to augment these drop downs to show them later"
        },
        {
            "id": "rmii_3p3v",
            "label": "rmii_3p3v",
            "description": "In fact, in Sitara MPU these eQEP/PWM and other modes might be the primary use cases for industrial applications."
        },
        {
            "id": "mii_mii_3p3v",
            "label": "mii_mii_3p3v",
            "description": ""
        },
        {
            "id": "mii_3p3v",
            "label": "mii_3p3v",
            "description": ""
        },
        {
            "id": "profinet_3p3v",
            "label": "profinet_3p3v",
            "description": ""
        },
        {
            "id": "ethercat_3p3v",
            "label": "ethercat_3p3v",
            "description": ""
        },
        {
            "id": "rmii_rmii_1p8v",
            "label": "rmii_rmii_1p8v",
            "description": ""
        },
        {
            "id": "rmii_1p8v",
            "label": "rmii_1p8v",
            "description": ""
        },
        {
            "id": "mii_mii_1p8v",
            "label": "mii_mii_1p8v",
            "description": ""
        },
        {
            "id": "mii_1p8v",
            "label": "mii_1p8v",
            "description": ""
        },
        {
            "id": "profinet_1p8v",
            "label": "profinet_1p8v",
            "description": ""
        },
        {
            "id": "ethercat_1p8v",
            "label": "ethercat_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "ethernet_modes": [
        {
            "id": "rgmii_1000_1p8v",
            "label": "rgmii_1000_1p8v",
            "description": ""
        },
        {
            "id": "rgmii_100_1p8v",
            "label": "rgmii_100_1p8v",
            "description": ""
        },
        {
            "id": "rgmii_10_1p8v",
            "label": "rgmii_10_1p8v",
            "description": ""
        },
        {
            "id": "rmii_100_1p8v",
            "label": "rmii_100_1p8v",
            "description": ""
        },
        {
            "id": "rmii_10_1p8v",
            "label": "rmii_10_1p8v",
            "description": ""
        },
        {
            "id": "rgmii_1000_3p3v",
            "label": "rgmii_1000_3p3v",
            "description": ""
        },
        {
            "id": "rgmii_100_3p3v",
            "label": "rgmii_100_3p3v",
            "description": ""
        },
        {
            "id": "rgmii_10_3p3v",
            "label": "rgmii_10_3p3v",
            "description": ""
        },
        {
            "id": "rmii_100_3p3v",
            "label": "rmii_100_3p3v",
            "description": ""
        },
        {
            "id": "rmii_10_3p3v",
            "label": "rmii_10_3p3v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "gpmc_modes": [
        {
            "id": "16b_133_MHz_3p3V",
            "label": "16b_133_MHz_3p3V",
            "description": ""
        },
        {
            "id": "16b_100_MHz_3p3V",
            "label": "16b_100_MHz_3p3V",
            "description": ""
        },
        {
            "id": "16b_80_MHz_3p3V",
            "label": "16b_80_MHz_3p3V",
            "description": ""
        },
        {
            "id": "16b_133_MHz_1p8V",
            "label": "16b_133_MHz_1p8V",
            "description": ""
        },
        {
            "id": "16b_100_MHz_1p8V",
            "label": "16b_100_MHz_1p8V",
            "description": ""
        },
        {
            "id": "16b_80_MHz_1p8V",
            "label": "16b_80_MHz_1p8V",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "sdio_modes": [
        {
            "id": "sdr_25mbs",
            "label": "sdr_25mbs",
            "description": ""
        },
        {
            "id": "sdr_50mbs",
            "label": "sdr_50mbs",
            "description": ""
        },
        {
            "id": "ddr_100mbs",
            "label": "ddr_100mbs",
            "description": ""
        },
        {
            "id": "sdr_100mbs",
            "label": "sdr_100mbs",
            "description": ""
        },
        {
            "id": "ddr_200mbs",
            "label": "ddr_200mbs",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "canfd_modes": [
        {
            "id": "12mbs_3p3v",
            "label": "12mbs_3p3v",
            "description": ""
        },
        {
            "id": "8mbs_3p3v",
            "label": "8mbs_3p3v",
            "description": ""
        },
        {
            "id": "5mbs_3p3v",
            "label": "5mbs_3p3v",
            "description": ""
        },
        {
            "id": "1mbs_3p3v",
            "label": "1mbs_3p3v",
            "description": ""
        },
        {
            "id": "250kbs_3p3v",
            "label": "250kbs_3p3v",
            "description": ""
        },
        {
            "id": "12mbs_1p8v",
            "label": "12mbs_1p8v",
            "description": ""
        },
        {
            "id": "8mbs_1p8v",
            "label": "8mbs_1p8v",
            "description": ""
        },
        {
            "id": "5mbs_1p8v",
            "label": "5mbs_1p8v",
            "description": ""
        },
        {
            "id": "1mbs_1p8v",
            "label": "1mbs_1p8v",
            "description": ""
        },
        {
            "id": "250kbs_1p8v",
            "label": "250kbs_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "fssul_modes": [
        {
            "id": "qspi_ddr_master_160_3p3v",
            "label": "qspi_ddr_master_160_3p3v",
            "description": ""
        },
        {
            "id": "qspi_ddr_master_133_3p3v",
            "label": "qspi_ddr_master_133_3p3v",
            "description": ""
        },
        {
            "id": "qspi_sdr_master_133_3p3v",
            "label": "qspi_sdr_master_133_3p3v",
            "description": ""
        },
        {
            "id": "qspi_sdr_master_108_3p3v",
            "label": "qspi_sdr_master_108_3p3v",
            "description": ""
        },
        {
            "id": "ospi_ddr_master_160_3p3v",
            "label": "ospi_ddr_master_160_3p3v",
            "description": ""
        },
        {
            "id": "ospi_ddr_master_133_3p3v",
            "label": "ospi_ddr_master_133_3p3v",
            "description": ""
        },
        {
            "id": "ospi_sdr_master_133_3p3v",
            "label": "ospi_sdr_master_133_3p3v",
            "description": ""
        },
        {
            "id": "ospi_sdr_master_108_3p3v",
            "label": "ospi_sdr_master_108_3p3v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "dpi_modes": [
        {
            "id": "SD_|_640x480x60_fps_12b_|_1p8V",
            "label": "SD_|_640x480x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_12b_|_3p3V",
            "label": "SD_|_640x480x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_16b_|_1p8V",
            "label": "SD_|_640x480x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_16b_|_3p3V",
            "label": "SD_|_640x480x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_24b_|_1p8V",
            "label": "SD_|_640x480x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_24b_|_3p3V",
            "label": "SD_|_640x480x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_24b_|_1p8V",
            "label": "SD_|_640x480x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SD_|_640x480x60_fps_24b_|_3p3V",
            "label": "SD_|_640x480x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_12b_|_1p8V",
            "label": "SVGA_|_800x600x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_12b_|_3p3V",
            "label": "SVGA_|_800x600x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_16b_|_1p8V",
            "label": "SVGA_|_800x600x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_16b_|_3p3V",
            "label": "SVGA_|_800x600x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_24b_|_1p8V",
            "label": "SVGA_|_800x600x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_24b_|_3p3V",
            "label": "SVGA_|_800x600x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_24b_|_1p8V",
            "label": "SVGA_|_800x600x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SVGA_|_800x600x60_fps_24b_|_3p3V",
            "label": "SVGA_|_800x600x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_12b_|_1p8V",
            "label": "WVGA_|_854x480x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_12b_|_3p3V",
            "label": "WVGA_|_854x480x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_16b_|_1p8V",
            "label": "WVGA_|_854x480x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_16b_|_3p3V",
            "label": "WVGA_|_854x480x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_24b_|_1p8V",
            "label": "WVGA_|_854x480x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_24b_|_3p3V",
            "label": "WVGA_|_854x480x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_24b_|_1p8V",
            "label": "WVGA_|_854x480x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "WVGA_|_854x480x60_fps_24b_|_3p3V",
            "label": "WVGA_|_854x480x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_12b_|_1p8V",
            "label": "XGA_|_1024x768x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_12b_|_3p3V",
            "label": "XGA_|_1024x768x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_16b_|_1p8V",
            "label": "XGA_|_1024x768x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_16b_|_3p3V",
            "label": "XGA_|_1024x768x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_24b_|_1p8V",
            "label": "XGA_|_1024x768x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_24b_|_3p3V",
            "label": "XGA_|_1024x768x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_24b_|_1p8V",
            "label": "XGA_|_1024x768x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "XGA_|_1024x768x60_fps_24b_|_3p3V",
            "label": "XGA_|_1024x768x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_12b_|_1p8V",
            "label": "HD_|_1280x720x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_12b_|_3p3V",
            "label": "HD_|_1280x720x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_16b_|_1p8V",
            "label": "HD_|_1280x720x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_16b_|_3p3V",
            "label": "HD_|_1280x720x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_24b_|_1p8V",
            "label": "HD_|_1280x720x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_24b_|_3p3V",
            "label": "HD_|_1280x720x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_24b_|_1p8V",
            "label": "HD_|_1280x720x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x30_fps_24b_|_3p3V",
            "label": "HD_|_1280x720x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_12b_|_1p8V",
            "label": "HD_|_1280x720x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_12b_|_3p3V",
            "label": "HD_|_1280x720x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_16b_|_1p8V",
            "label": "HD_|_1280x720x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_16b_|_3p3V",
            "label": "HD_|_1280x720x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_24b_|_1p8V",
            "label": "HD_|_1280x720x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_24b_|_3p3V",
            "label": "HD_|_1280x720x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_24b_|_1p8V",
            "label": "HD_|_1280x720x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD_|_1280x720x60_fps_24b_|_3p3V",
            "label": "HD_|_1280x720x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_12b_|_1p8V",
            "label": "WXGA_|_1280x800x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_12b_|_3p3V",
            "label": "WXGA_|_1280x800x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_16b_|_1p8V",
            "label": "WXGA_|_1280x800x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_16b_|_3p3V",
            "label": "WXGA_|_1280x800x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_24b_|_1p8V",
            "label": "WXGA_|_1280x800x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_24b_|_3p3V",
            "label": "WXGA_|_1280x800x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_24b_|_1p8V",
            "label": "WXGA_|_1280x800x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x30_fps_24b_|_3p3V",
            "label": "WXGA_|_1280x800x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_12b_|_1p8V",
            "label": "WXGA_|_1280x800x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_12b_|_3p3V",
            "label": "WXGA_|_1280x800x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_16b_|_1p8V",
            "label": "WXGA_|_1280x800x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_16b_|_3p3V",
            "label": "WXGA_|_1280x800x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_18b_|_1p8V",
            "label": "WXGA_|_1280x800x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_18b_|_3p3V",
            "label": "WXGA_|_1280x800x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_24b_|_1p8V",
            "label": "WXGA_|_1280x800x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "WXGA_|_1280x800x60_fps_24b_|_3p3V",
            "label": "WXGA_|_1280x800x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_12b_|_1p8V",
            "label": "SXGA_|_1280x1024x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_12b_|_3p3V",
            "label": "SXGA_|_1280x1024x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_16b_|_1p8V",
            "label": "SXGA_|_1280x1024x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_16b_|_3p3V",
            "label": "SXGA_|_1280x1024x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_18b_|_1p8V",
            "label": "SXGA_|_1280x1024x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_18b_|_3p3V",
            "label": "SXGA_|_1280x1024x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_24b_|_1p8V",
            "label": "SXGA_|_1280x1024x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x30_fps_24b_|_3p3V",
            "label": "SXGA_|_1280x1024x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_12b_|_1p8V",
            "label": "SXGA_|_1280x1024x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_12b_|_3p3V",
            "label": "SXGA_|_1280x1024x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_16b_|_1p8V",
            "label": "SXGA_|_1280x1024x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_16b_|_3p3V",
            "label": "SXGA_|_1280x1024x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_18b_|_1p8V",
            "label": "SXGA_|_1280x1024x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_18b_|_3p3V",
            "label": "SXGA_|_1280x1024x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_24b_|_1p8V",
            "label": "SXGA_|_1280x1024x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA_|_1280x1024x60_fps_24b_|_3p3V",
            "label": "SXGA_|_1280x1024x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_12b_|_1p8V",
            "label": "SXGA+_|_1400x1050x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_12b_|_3p3V",
            "label": "SXGA+_|_1400x1050x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_16b_|_1p8V",
            "label": "SXGA+_|_1400x1050x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_16b_|_3p3V",
            "label": "SXGA+_|_1400x1050x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_18b_|_1p8V",
            "label": "SXGA+_|_1400x1050x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_18b_|_3p3V",
            "label": "SXGA+_|_1400x1050x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_24b_|_1p8V",
            "label": "SXGA+_|_1400x1050x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "SXGA+_|_1400x1050x60_fps_24b_|_3p3V",
            "label": "SXGA+_|_1400x1050x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_12b_|_1p8V",
            "label": "HD+_|_1600x900x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_12b_|_3p3V",
            "label": "HD+_|_1600x900x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_16b_|_1p8V",
            "label": "HD+_|_1600x900x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_16b_|_3p3V",
            "label": "HD+_|_1600x900x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_18b_|_1p8V",
            "label": "HD+_|_1600x900x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_18b_|_3p3V",
            "label": "HD+_|_1600x900x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_24b_|_1p8V",
            "label": "HD+_|_1600x900x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x30_fps_24b_|_3p3V",
            "label": "HD+_|_1600x900x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_12b_|_1p8V",
            "label": "HD+_|_1600x900x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_12b_|_3p3V",
            "label": "HD+_|_1600x900x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_16b_|_1p8V",
            "label": "HD+_|_1600x900x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_16b_|_3p3V",
            "label": "HD+_|_1600x900x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_18b_|_1p8V",
            "label": "HD+_|_1600x900x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_18b_|_3p3V",
            "label": "HD+_|_1600x900x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_18b_|_1p8V",
            "label": "HD+_|_1600x900x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "HD+_|_1600x900x60_fps_24b_|_3p3V",
            "label": "HD+_|_1600x900x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_12b_|_1p8V",
            "label": "UXGA_|_1600x1200x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_12b_|_3p3V",
            "label": "UXGA_|_1600x1200x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_16b_|_1p8V",
            "label": "UXGA_|_1600x1200x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_16b_|_3p3V",
            "label": "UXGA_|_1600x1200x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_18b_|_1p8V",
            "label": "UXGA_|_1600x1200x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_18b_|_3p3V",
            "label": "UXGA_|_1600x1200x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_24b_|_1p8V",
            "label": "UXGA_|_1600x1200x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x30_fps_24b_|_3p3V",
            "label": "UXGA_|_1600x1200x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_12b_|_1p8V",
            "label": "UXGA_|_1600x1200x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_12b_|_3p3V",
            "label": "UXGA_|_1600x1200x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_16b_|_1p8V",
            "label": "UXGA_|_1600x1200x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_16b_|_3p3V",
            "label": "UXGA_|_1600x1200x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_18b_|_1p8V",
            "label": "UXGA_|_1600x1200x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_18b_|_3p3V",
            "label": "UXGA_|_1600x1200x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_24b_|_1p8V",
            "label": "UXGA_|_1600x1200x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "UXGA_|_1600x1200x60_fps_24b_|_3p3V",
            "label": "UXGA_|_1600x1200x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_12b_|_1p8V",
            "label": "Full_HD_|_1920x720x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_12b_|_3p3V",
            "label": "Full_HD_|_1920x720x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_16b_|_1p8V",
            "label": "Full_HD_|_1920x720x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_16b_|_3p3V",
            "label": "Full_HD_|_1920x720x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_18b_|_1p8V",
            "label": "Full_HD_|_1920x720x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_18b_|_3p3V",
            "label": "Full_HD_|_1920x720x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_24b_|_1p8V",
            "label": "Full_HD_|_1920x720x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x30_fps_24b_|_3p3V",
            "label": "Full_HD_|_1920x720x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_12b_|_1p8V",
            "label": "Full_HD_|_1920x720x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_12b_|_3p3V",
            "label": "Full_HD_|_1920x720x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_16b_|_1p8V",
            "label": "Full_HD_|_1920x720x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_16b_|_3p3V",
            "label": "Full_HD_|_1920x720x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_18b_|_1p8V",
            "label": "Full_HD_|_1920x720x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_18b_|_3p3V",
            "label": "Full_HD_|_1920x720x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_24b_|_1p8V",
            "label": "Full_HD_|_1920x720x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x720x60_fps_24b_|_3p3V",
            "label": "Full_HD_|_1920x720x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_12b_|_1p8V",
            "label": "Full_HD_|_1920x1080x30_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_12b_|_3p3V",
            "label": "Full_HD_|_1920x1080x30_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_16b_|_1p8V",
            "label": "Full_HD_|_1920x1080x30_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_16b_|_3p3V",
            "label": "Full_HD_|_1920x1080x30_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_18b_|_1p8V",
            "label": "Full_HD_|_1920x1080x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_18b_|_3p3V",
            "label": "Full_HD_|_1920x1080x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_24b_|_1p8V",
            "label": "Full_HD_|_1920x1080x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x30_fps_24b_|_3p3V",
            "label": "Full_HD_|_1920x1080x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_12b_|_1p8V",
            "label": "Full_HD_|_1920x1080x60_fps_12b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_12b_|_3p3V",
            "label": "Full_HD_|_1920x1080x60_fps_12b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_16b_|_1p8V",
            "label": "Full_HD_|_1920x1080x60_fps_16b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_16b_|_3p3V",
            "label": "Full_HD_|_1920x1080x60_fps_16b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_18b_|_1p8V",
            "label": "Full_HD_|_1920x1080x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_18b_|_3p3V",
            "label": "Full_HD_|_1920x1080x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_24b_|_1p8V",
            "label": "Full_HD_|_1920x1080x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "Full_HD_|_1920x1080x60_fps_24b_|_3p3V",
            "label": "Full_HD_|_1920x1080x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x30_fps_18b_|_1p8V",
            "label": "2K_|_2048x1080x30_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x30_fps_18b_|_3p3V",
            "label": "2K_|_2048x1080x30_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x30_fps_24b_|_1p8V",
            "label": "2K_|_2048x1080x30_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x30_fps_24b_|_3p3V",
            "label": "2K_|_2048x1080x30_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x60_fps_18b_|_1p8V",
            "label": "2K_|_2048x1080x60_fps_18b_|_1p8V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x60_fps_18b_|_3p3V",
            "label": "2K_|_2048x1080x60_fps_18b_|_3p3V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x60_fps_24b_|_1p8V",
            "label": "2K_|_2048x1080x60_fps_24b_|_1p8V",
            "description": ""
        },
        {
            "id": "2K_|_2048x1080x60_fps_24b_|_3p3V",
            "label": "2K_|_2048x1080x60_fps_24b_|_3p3V",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "mcasp_modes": [
        {
            "id": "8Ch_RX_48_ksps_24b_3p3v",
            "label": "8Ch_RX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "4Ch_RX_48_ksps_24b_3p3v",
            "label": "4Ch_RX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "2Ch_RX_48_ksps_24b_3p3v",
            "label": "2Ch_RX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "16Ch_TX_48_ksps_24b_3p3v",
            "label": "16Ch_TX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "12Ch_TX_48_ksps_24b_3p3v",
            "label": "12Ch_TX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "8Ch_TX_48_ksps_24b_3p3v",
            "label": "8Ch_TX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "4Ch_TX_48_ksps_24b_3p3v",
            "label": "4Ch_TX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "2Ch_TX_48_ksps_24b_3p3v",
            "label": "2Ch_TX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "16Ch_RXTX_48ksps_24b_3p3v",
            "label": "16Ch_RXTX_48ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "12Ch_RXTX_48_ksps_24b_3p3v",
            "label": "12Ch_RXTX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "8Ch_RXTX_48_ksps_24b_3p3v",
            "label": "8Ch_RXTX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "4Ch_RXTX_48_ksps_24b_3p3v",
            "label": "4Ch_RXTX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "2Ch_RXTX_48_ksps_24b_3p3v",
            "label": "2Ch_RXTX_48_ksps_24b_3p3v",
            "description": ""
        },
        {
            "id": "8Ch_RX_48_ksps_24b_1p8v",
            "label": "8Ch_RX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "4Ch_RX_48_ksps_24b_1p8v",
            "label": "4Ch_RX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "2Ch_RX_48_ksps_24b_1p8v",
            "label": "2Ch_RX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "16Ch_TX_48_ksps_24b_1p8v",
            "label": "16Ch_TX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "12Ch_TX_48_ksps_24b_1p8v",
            "label": "12Ch_TX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "8Ch_TX_48_ksps_24b_1p8v",
            "label": "8Ch_TX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "4Ch_TX_48_ksps_24b_1p8v",
            "label": "4Ch_TX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "2Ch_TX_48_ksps_24b_1p8v",
            "label": "2Ch_TX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "16Ch_RXTX_48ksps_24b_1p8v",
            "label": "16Ch_RXTX_48ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "12Ch_RXTX_48_ksps_24b_1p8v",
            "label": "12Ch_RXTX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "8Ch_RXTX_48_ksps_24b_1p8v",
            "label": "8Ch_RXTX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "4Ch_RXTX_48_ksps_24b_1p8v",
            "label": "4Ch_RXTX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "2Ch_RXTX_48_ksps_24b_1p8v",
            "label": "2Ch_RXTX_48_ksps_24b_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "spi_modes": [
        {
            "id": "Master_25_Mbaud_3p3v",
            "label": "Master_25_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_12.5_Mbaud_3p3v",
            "label": "Master_12.5_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_6.25_Mbaud_3p3v",
            "label": "Master_6.25_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_3.125_Mbaud_3p3v",
            "label": "Master_3.125_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_2.083_Mbaud_3p3v",
            "label": "Master_2.083_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_1.563_Mbaud_3p3v",
            "label": "Master_1.563_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_25_Mbaud_3p3v",
            "label": "Slave_25_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_12.5_Mbaud_3p3v",
            "label": "Slave_12.5_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_6.25_Mbaud_3p3v",
            "label": "Slave_6.25_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_3.125_Mbaud_3p3v",
            "label": "Slave_3.125_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_2.083_Mbaud_3p3v",
            "label": "Slave_2.083_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Slave_2.083_Mbaud_3p3v",
            "label": "Slave_2.083_Mbaud_3p3v",
            "description": ""
        },
        {
            "id": "Master_25_Mbaud_1p8v",
            "label": "Master_25_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Master_12.5_Mbaud_1p8v",
            "label": "Master_12.5_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Master_6.25_Mbaud_1p8v",
            "label": "Master_6.25_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Master_3.125_Mbaud_1p8v",
            "label": "Master_3.125_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Master_2.083_Mbaud_1p8v",
            "label": "Master_2.083_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Master_1.563_Mbaud_1p8v",
            "label": "Master_1.563_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_25_Mbaud_1p8v",
            "label": "Slave_25_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_12.5_Mbaud_1p8v",
            "label": "Slave_12.5_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_6.25_Mbaud_1p8v",
            "label": "Slave_6.25_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_3.125_Mbaud_1p8v",
            "label": "Slave_3.125_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_2.083_Mbaud_1p8v",
            "label": "Slave_2.083_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "Slave_2.083_Mbaud_1p8v",
            "label": "Slave_2.083_Mbaud_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "i2c_od_modes": [
        {
            "id": "i2c_3p4m_1p8v",
            "label": "i2c_3p4m_1p8v",
            "description": "when attached to true open drain buffers (only a few are), i2c can perform up to 3.5 mbs at 1.8v and 400 kbs @ 3.3v.  The other i2c are limited to 400"
        },
        {
            "id": "i2c_1m_1p8v",
            "label": "i2c_1m_1p8v",
            "description": ""
        },
        {
            "id": "i2c_400k_1p8v",
            "label": "i2c_400k_1p8v",
            "description": ""
        },
        {
            "id": "i2c_100k_1p8v",
            "label": "i2c_100k_1p8v",
            "description": ""
        },
        {
            "id": "i2c_400k_3p3v",
            "label": "i2c_400k_3p3v",
            "description": ""
        },
        {
            "id": "i2c_100k_3p3v",
            "label": "i2c_100k_3p3v",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "i2c_modes": [
        {
            "id": "i2c_400k_1p8v",
            "label": "i2c_400k_1p8v",
            "description": ""
        },
        {
            "id": "i2c_100k_1p8v",
            "label": "i2c_100k_1p8v",
            "description": ""
        },
        {
            "id": "i2c_400k_3p3v",
            "label": "i2c_400k_3p3v",
            "description": ""
        },
        {
            "id": "i2c_100k_3p3v",
            "label": "i2c_100k_3p3v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "uart_modes": [
        {
            "id": "3p6m_1p8v",
            "label": "3p6m_1p8v",
            "description": "most of the uarts are only 4 pins (full duplex data in and out, and two control in and out)."
        },
        {
            "id": "1m_1p8v",
            "label": "1m_1p8v",
            "description": "There is one uart (uart 0 in main) which can be configured as a modem (8 total pins) and has 4 more control pins (2 in and 2 out)."
        },
        {
            "id": "112k_1p8v",
            "label": "112k_1p8v",
            "description": "RS485 and IrDA only uses 3 signals (tx, rx, and SD output."
        },
        {
            "id": "3p6m_3p3v",
            "label": "3p6m_3p3v",
            "description": "IrDA limited to 115.2k"
        },
        {
            "id": "1m_3p3v",
            "label": "1m_3p3v",
            "description": "uart and uart_modem both use the same power model\u2026they differ only in the number of total pins (modem has 4 more control pins)"
        },
        {
            "id": "112k_3p3v",
            "label": "112k_3p3v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "ecap_modes": [
        {
            "id": "pwm_out_5m_3p3v",
            "label": "pwm_out_5m_3p3v",
            "description": "single output feeding pulse width modulation asynchronous"
        },
        {
            "id": "pwm_out_1m_3p3v",
            "label": "pwm_out_1m_3p3v",
            "description": "single output feeding pulse width modulation asynchronous"
        },
        {
            "id": "pwm_out_5m_1p8v",
            "label": "pwm_out_5m_1p8v",
            "description": "single output feeding pulse width modulation asynchronous"
        },
        {
            "id": "pwm_out_1m_1p8v",
            "label": "pwm_out_1m_1p8v",
            "description": "single output feeding pulse width modulation asynchronous"
        },
        {
            "id": "capture_in_5m_3p3v",
            "label": "capture_in_5m_3p3v",
            "description": "capture of data coming in (audio, sensor, etc.)"
        },
        {
            "id": "capture_in_1m_3p3v",
            "label": "capture_in_1m_3p3v",
            "description": "capture of data coming in (audio, sensor, etc.)"
        },
        {
            "id": "capture_in_5m_1p8v",
            "label": "capture_in_5m_1p8v",
            "description": "capture of data coming in (audio, sensor, etc.)"
        },
        {
            "id": "capture_in_1m_1p8v",
            "label": "capture_in_1m_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": "not muxed out."
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "pwm_modes": [
        {
            "id": "on_3p3v",
            "label": "on_3p3v",
            "description": ""
        },
        {
            "id": "on_1p8v",
            "label": "on_1p8v",
            "description": ""
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": ""
        }
    ],
    "gpio_modes": [
        {
            "id": "1mbs_3p3v_20pf",
            "label": "1mbs_3p3v_20pf",
            "description": "GPIO are wide open and can't be modeled precisely.  Each GPIO module has 9 banks of 16 GPIO signals."
        },
        {
            "id": "1mbs_1p8v_20pf",
            "label": "1mbs_1p8v_20pf",
            "description": "We model them instead as a single bit at 1 mbs, and users can input 10,000% if they wish to model 10 outputs at 1 mbs."
        },
        {
            "id": "unused",
            "label": "unused",
            "description": ""
        },
        {
            "id": "off",
            "label": "off",
            "description": "We model them instead as a single bit at 1 mbs, and users can input 10,000% if they wish to model 10 outputs at 1 mbs."
        }
    ],
    "vdd_core_modes": [
        {
            "id": "0.85",
            "label": "0.85",
            "description": ""
        },
        {
            "id": "0.75",
            "label": "0.75",
            "description": ""
        }
    ]
};
