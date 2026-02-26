// Device Tree Validator - Comprehensive DTS/DTSI validation tool

// DOM Elements
const dtsInput = document.getElementById('dtsInput');
const validateBtn = document.getElementById('validateBtn');
const clearBtn = document.getElementById('clearBtn');
const templateBtn = document.getElementById('templateBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const templateSelector = document.getElementById('templateSelector');
const templateSelect = document.getElementById('templateSelect');
const loadTemplateBtn = document.getElementById('loadTemplateBtn');
const cancelTemplateBtn = document.getElementById('cancelTemplateBtn');
const resultsSection = document.getElementById('resultsSection');
const summaryContainer = document.getElementById('summaryContainer');
const issuesContainer = document.getElementById('issuesContainer');
const treeViewSection = document.getElementById('treeViewSection');
const treeViewContainer = document.getElementById('treeViewContainer');

// Known vendor prefixes
const VENDOR_PREFIXES = [
    'ti', 'arm', 'st', 'nxp', 'atmel', 'microchip', 'samsung', 'qcom',
    'rockchip', 'allwinner', 'amlogic', 'broadcom', 'marvell', 'mediatek',
    'nvidia', 'renesas', 'xilinx', 'intel', 'amd', 'raspberrypi', 'beagle',
    'dallas', 'maxim', 'adi', 'bosch', 'infineon', 'onsemi', 'jedec'
];

// Standard/generic compatible strings that don't require vendor prefix
const STANDARD_COMPATIBLES = [
    'regulator-fixed', 'regulator-gpio', 'shared-dma-pool', 'fixed-partitions',
    'gpio-leds', 'gpio-keys', 'simple-bus', 'simple-mfd', 'syscon',
    'mmio-sram', 'fixed-clock', 'gpio-reset', 'leds-gpio', 'keys-gpio'
];

// Standard property names and their expected formats
const STANDARD_PROPERTIES = {
    'compatible': { type: 'stringlist', required: false },
    'reg': { type: 'cells', required: false },
    'interrupts': { type: 'cells', required: false },
    'interrupt-parent': { type: 'phandle', required: false },
    'clocks': { type: 'phandles', required: false },
    'clock-names': { type: 'stringlist', required: false },
    'status': { type: 'string', values: ['okay', 'disabled', 'reserved', 'fail'] },
    '#address-cells': { type: 'cell', required: false },
    '#size-cells': { type: 'cell', required: false },
    '#interrupt-cells': { type: 'cell', required: false },
    '#clock-cells': { type: 'cell', required: false },
    '#gpio-cells': { type: 'cell', required: false },
    'device_type': { type: 'string', required: false },
    'model': { type: 'string', required: false },
    'phandle': { type: 'cell', required: false },
    'ranges': { type: 'ranges', required: false },
    'dma-ranges': { type: 'ranges', required: false }
};

// Templates
const TEMPLATES = {
    basic: `/ {
    model = "Example Board";
    compatible = "vendor,board";

    #address-cells = <1>;
    #size-cells = <1>;

    chosen {
        stdout-path = "serial0:115200n8";
    };

    memory@80000000 {
        device_type = "memory";
        reg = <0x80000000 0x40000000>;
    };

    aliases {
        serial0 = &uart0;
    };
};`,

    i2c: `&i2c0 {
    status = "okay";
    clock-frequency = <400000>;

    sensor@48 {
        compatible = "ti,tmp102";
        reg = <0x48>;
        interrupt-parent = <&gpio1>;
        interrupts = <10 IRQ_TYPE_LEVEL_LOW>;
    };
};`,

    spi: `&spi0 {
    status = "okay";
    #address-cells = <1>;
    #size-cells = <0>;

    flash@0 {
        compatible = "jedec,spi-nor";
        reg = <0>;
        spi-max-frequency = <25000000>;

        partitions {
            compatible = "fixed-partitions";
            #address-cells = <1>;
            #size-cells = <1>;

            partition@0 {
                label = "boot";
                reg = <0x0 0x100000>;
            };
        };
    };
};`,

    gpio: `&gpio1 {
    status = "okay";

    led-pins {
        gpio-hog;
        gpios = <10 GPIO_ACTIVE_HIGH>;
        output-high;
        line-name = "led0";
    };
};`,

    pinmux: `&main_pmx0 {
    uart0_pins_default: uart0-pins-default {
        pinctrl-single,pins = <
            0x1c0 (PIN_INPUT | MUX_MODE0)  /* UART0_RXD */
            0x1c4 (PIN_OUTPUT | MUX_MODE0) /* UART0_TXD */
        >;
    };
};`,

    interrupt: `intc: interrupt-controller@1000 {
    compatible = "vendor,intc";
    reg = <0x1000 0x1000>;
    interrupt-controller;
    #interrupt-cells = <2>;
};`,

    clock: `pll0: pll@2000 {
    compatible = "vendor,pll";
    reg = <0x2000 0x100>;
    #clock-cells = <1>;
    clocks = <&ref_clk>;
    clock-output-names = "pll0_out0", "pll0_out1";
};`,

    'ti-am62': `// TI AM62x Device Tree Example
/ {
    model = "Texas Instruments AM625 SK";
    compatible = "ti,am625-sk", "ti,am625";

    #address-cells = <2>;
    #size-cells = <2>;

    chosen {
        stdout-path = "serial2:115200n8";
        bootargs = "console=ttyS2,115200n8";
    };

    memory@80000000 {
        device_type = "memory";
        reg = <0x00 0x80000000 0x00 0x80000000>;
    };
};

&main_uart0 {
    status = "okay";
    pinctrl-names = "default";
    pinctrl-0 = <&main_uart0_pins_default>;
};

&main_i2c0 {
    status = "okay";
    clock-frequency = <400000>;
    pinctrl-names = "default";
    pinctrl-0 = <&main_i2c0_pins_default>;
};`
};

// Initialize
function init() {
    validateBtn.addEventListener('click', validateDeviceTree);
    clearBtn.addEventListener('click', clearAll);
    templateBtn.addEventListener('click', showTemplateSelector);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    loadTemplateBtn.addEventListener('click', loadSelectedTemplate);
    cancelTemplateBtn.addEventListener('click', hideTemplateSelector);

    dtsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            e.target.value = e.target.value.substring(0, start) + '    ' + e.target.value.substring(end);
            e.target.selectionStart = e.target.selectionEnd = start + 4;
        }
    });
}

function showTemplateSelector() {
    templateSelector.style.display = 'block';
    templateSelect.focus();
}

function hideTemplateSelector() {
    templateSelector.style.display = 'none';
    templateSelect.value = '';
}

function loadSelectedTemplate() {
    const template = templateSelect.value;
    if (template && TEMPLATES[template]) {
        dtsInput.value = TEMPLATES[template];
        hideTemplateSelector();
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            dtsInput.value = event.target.result;
        };
        reader.readAsText(file);
    }
    fileInput.value = '';
}

function clearAll() {
    dtsInput.value = '';
    resultsSection.style.display = 'none';
    treeViewSection.style.display = 'none';
    summaryContainer.innerHTML = '';
    issuesContainer.innerHTML = '';
    treeViewContainer.innerHTML = '';
    dtsInput.focus();
}

// Main validation function
function validateDeviceTree() {
    const content = dtsInput.value.trim();

    if (!content) {
        displayError('Please enter device tree source code to validate.');
        return;
    }

    try {
        // Remove C-style comments
        const cleaned = removeComments(content);

        // Tokenize
        const tokens = tokenize(cleaned);

        // Parse into nodes
        const tree = parse(tokens);

        // Collect all issues
        const issues = [];

        // Validate structure
        validateStructure(tree, issues);

        // Validate properties
        validateProperties(tree, issues);

        // Validate references
        validateReferences(tree, issues);

        // Check best practices
        checkBestPractices(tree, issues);

        // Display results
        displayResults(issues, tree);

    } catch (error) {
        displayError(`Parse error: ${error.message}`);
    }
}

// Remove C-style and C++ style comments, but preserve preprocessor directives
function removeComments(text) {
    // Remove C++ style comments (but not preprocessor directives starting with #)
    text = text.replace(/^(?!#).*\/\/.*$/gm, (match) => {
        // Keep the line but remove the comment part
        const commentIndex = match.indexOf('//');
        return match.substring(0, commentIndex);
    });
    // Remove C style comments
    text = text.replace(/\/\*[\s\S]*?\*\//g, '');
    return text;
}

// Tokenizer
function tokenize(text) {
    const tokens = [];
    let line = 1;
    let col = 1;
    let i = 0;

    while (i < text.length) {
        const char = text[i];

        // Skip whitespace
        if (/\s/.test(char)) {
            if (char === '\n') {
                line++;
                col = 1;
            } else {
                col++;
            }
            i++;
            continue;
        }

        // Preprocessor directives (#include, #define, /dts-v1/, etc.)
        if (char === '#') {
            const start = i;
            const startCol = col;
            const startLine = line;

            // Read until end of line (handle line continuations with \)
            while (i < text.length) {
                if (text[i] === '\\' && i + 1 < text.length && text[i + 1] === '\n') {
                    // Line continuation
                    i += 2;
                    line++;
                    col = 1;
                } else if (text[i] === '\n') {
                    break;
                } else {
                    i++;
                    col++;
                }
            }

            const value = text.substring(start, i).trim();
            tokens.push({ type: 'preprocessor', value, line: startLine, col: startCol });

            // Skip the newline
            if (i < text.length && text[i] === '\n') {
                line++;
                col = 1;
                i++;
            }
            continue;
        }

        // DTS version directive (/dts-v1/)
        if (char === '/' && text.substring(i, i + 8) === '/dts-v1/') {
            const startCol = col;
            const startLine = line;
            tokens.push({ type: 'preprocessor', value: '/dts-v1/', line: startLine, col: startCol });
            i += 8;
            col += 8;
            continue;
        }

        // Node start/end
        if (char === '{' || char === '}') {
            tokens.push({ type: char, value: char, line, col });
            i++;
            col++;
            continue;
        }

        // Statement end
        if (char === ';') {
            tokens.push({ type: 'semicolon', value: char, line, col });
            i++;
            col++;
            continue;
        }

        // Assignment
        if (char === '=') {
            tokens.push({ type: 'equals', value: char, line, col });
            i++;
            col++;
            continue;
        }

        // Array/cell values
        if (char === '<') {
            const start = i;
            const startCol = col;
            i++;
            col++;
            while (i < text.length && text[i] !== '>') {
                if (text[i] === '\n') {
                    line++;
                    col = 1;
                } else {
                    col++;
                }
                i++;
            }
            if (i >= text.length) {
                throw new Error(`Unclosed angle bracket at line ${line}`);
            }
            i++; // Skip '>'
            col++;
            const value = text.substring(start + 1, i - 1).trim();
            tokens.push({ type: 'cells', value, line, col: startCol });
            continue;
        }

        // Strings
        if (char === '"') {
            const start = i;
            const startCol = col;
            i++;
            col++;
            while (i < text.length && text[i] !== '"') {
                if (text[i] === '\\' && i + 1 < text.length) {
                    i += 2;
                    col += 2;
                } else {
                    if (text[i] === '\n') {
                        line++;
                        col = 1;
                    } else {
                        col++;
                    }
                    i++;
                }
            }
            if (i >= text.length) {
                throw new Error(`Unclosed string at line ${line}`);
            }
            i++; // Skip closing '"'
            col++;
            const value = text.substring(start + 1, i - 1);
            tokens.push({ type: 'string', value, line, col: startCol });
            continue;
        }

        // Phandle reference
        if (char === '&') {
            const start = i;
            const startCol = col;
            i++;
            col++;
            while (i < text.length && /[a-zA-Z0-9_]/.test(text[i])) {
                i++;
                col++;
            }
            const value = text.substring(start + 1, i);
            tokens.push({ type: 'phandle', value, line, col: startCol });
            continue;
        }

        // Labels (name followed by :)
        if (/[a-zA-Z_]/.test(char)) {
            const start = i;
            const startCol = col;
            while (i < text.length && /[a-zA-Z0-9_@-]/.test(text[i])) {
                i++;
                col++;
            }
            const value = text.substring(start, i);

            // Check if it's a label (followed by :)
            let j = i;
            while (j < text.length && /\s/.test(text[j])) j++;

            if (j < text.length && text[j] === ':') {
                tokens.push({ type: 'label', value, line, col: startCol });
                i = j + 1;
                col += (j - i) + 1;
            } else {
                tokens.push({ type: 'identifier', value, line, col: startCol });
            }
            continue;
        }

        // Hex numbers or other identifiers
        if (/[0-9]/.test(char) || char === '/') {
            const start = i;
            const startCol = col;
            while (i < text.length && /[a-zA-Z0-9x,@/_-]/.test(text[i])) {
                i++;
                col++;
            }
            const value = text.substring(start, i);
            tokens.push({ type: 'identifier', value, line, col: startCol });
            continue;
        }

        // Comma
        if (char === ',') {
            tokens.push({ type: 'comma', value: char, line, col });
            i++;
            col++;
            continue;
        }

        // Unknown character
        throw new Error(`Unexpected character '${char}' at line ${line}, column ${col}`);
    }

    return tokens;
}

// Parser
function parse(tokens) {
    const root = { type: 'root', name: '/', properties: {}, children: [], labels: [], line: 1, preprocessor: [] };
    const stack = [root];
    let i = 0;

    while (i < tokens.length) {
        const token = tokens[i];

        // Skip preprocessor directives (handle them separately)
        if (token.type === 'preprocessor') {
            root.preprocessor.push(token.value);
            i++;
            continue;
        }

        if (token.type === 'label') {
            // Label definition
            const current = stack[stack.length - 1];
            if (!current.labels) current.labels = [];
            current.labels.push(token.value);
            i++;
            continue;
        }

        if (token.type === 'identifier') {
            const current = stack[stack.length - 1];

            // Check if it's a property or node
            if (i + 1 < tokens.length && tokens[i + 1].type === 'equals') {
                // It's a property
                const propName = token.value;
                i += 2; // Skip name and '='

                const values = [];
                while (i < tokens.length && tokens[i].type !== 'semicolon') {
                    if (tokens[i].type === 'string') {
                        values.push({ type: 'string', value: tokens[i].value, line: tokens[i].line });
                    } else if (tokens[i].type === 'cells') {
                        values.push({ type: 'cells', value: tokens[i].value, line: tokens[i].line });
                    } else if (tokens[i].type === 'phandle') {
                        values.push({ type: 'phandle', value: tokens[i].value, line: tokens[i].line });
                    } else if (tokens[i].type === 'identifier') {
                        values.push({ type: 'identifier', value: tokens[i].value, line: tokens[i].line });
                    } else if (tokens[i].type === 'comma') {
                        // Skip commas
                    } else {
                        break;
                    }
                    i++;
                }

                if (i < tokens.length && tokens[i].type === 'semicolon') {
                    i++; // Skip semicolon
                }

                current.properties[propName] = {
                    values,
                    line: token.line
                };
                continue;
            }

            if (i + 1 < tokens.length && tokens[i + 1].type === '{') {
                // It's a node
                const nodeName = token.value;
                const node = {
                    type: 'node',
                    name: nodeName,
                    properties: {},
                    children: [],
                    labels: [],
                    line: token.line,
                    parent: current
                };
                current.children.push(node);
                stack.push(node);
                i += 2; // Skip name and '{'
                continue;
            }

            if (i + 1 < tokens.length && tokens[i + 1].type === 'semicolon') {
                // Property with no value (like gpio-hog;)
                current.properties[token.value] = {
                    values: [],
                    line: token.line
                };
                i += 2; // Skip name and semicolon
                continue;
            }
        }

        if (token.type === '}') {
            if (stack.length <= 1) {
                throw new Error(`Unexpected '}' at line ${token.line}`);
            }

            // Check for semicolon after }
            if (i + 1 < tokens.length && tokens[i + 1].type === 'semicolon') {
                i++;
            }

            stack.pop();
            i++;
            continue;
        }

        if (token.type === 'phandle') {
            // Reference to existing node (like &uart0 { ... })
            const refName = token.value;
            if (i + 1 < tokens.length && tokens[i + 1].type === '{') {
                const node = {
                    type: 'reference',
                    name: '&' + refName,
                    reference: refName,
                    properties: {},
                    children: [],
                    line: token.line,
                    parent: stack[stack.length - 1]
                };
                stack[stack.length - 1].children.push(node);
                stack.push(node);
                i += 2; // Skip phandle and '{'
                continue;
            }
        }

        i++;
    }

    if (stack.length > 1) {
        throw new Error('Unclosed node braces');
    }

    return root;
}

// Validation functions
function validateStructure(node, issues, path = '/') {
    // Check node name format
    if (node.name && node.name !== '/' && node.type === 'node') {
        if (!node.name.startsWith('&')) {
            // Check for valid node name
            const nameMatch = node.name.match(/^([a-zA-Z0-9,._+-]+)(@([0-9a-fA-Fx,]+))?$/);
            if (!nameMatch) {
                issues.push({
                    severity: 'error',
                    line: node.line,
                    message: `Invalid node name format: "${node.name}"`,
                    suggestion: 'Node names should be lowercase, alphanumeric with hyphens/underscores, optionally with @address'
                });
            }

            // If node has @ address, check for reg property
            if (nameMatch && nameMatch[3]) {
                if (!node.properties['reg']) {
                    issues.push({
                        severity: 'warning',
                        line: node.line,
                        message: `Node "${node.name}" has unit address but no "reg" property`,
                        suggestion: 'Add a "reg" property or remove the @address from the node name'
                    });
                }
            }
        }
    }

    // Check for #address-cells and #size-cells if node has children with reg
    if (node.children && node.children.length > 0) {
        const childrenWithReg = node.children.some(child => child.properties && child.properties['reg']);
        if (childrenWithReg) {
            if (!node.properties['#address-cells']) {
                issues.push({
                    severity: 'warning',
                    line: node.line,
                    message: `Node "${path}" has children with "reg" but no "#address-cells"`,
                    suggestion: 'Add #address-cells = <1> or <2> depending on address size'
                });
            }
            if (!node.properties['#size-cells']) {
                issues.push({
                    severity: 'warning',
                    line: node.line,
                    message: `Node "${path}" has children with "reg" but no "#size-cells"`,
                    suggestion: 'Add #size-cells = <1> or <2> depending on size representation'
                });
            }
        }
    }

    // Recurse into children
    if (node.children) {
        node.children.forEach(child => {
            const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
            validateStructure(child, issues, childPath);
        });
    }
}

function validateProperties(node, issues, path = '/') {
    if (node.properties) {
        for (const [propName, propData] of Object.entries(node.properties)) {
            // Check compatible strings
            if (propName === 'compatible') {
                propData.values.forEach(val => {
                    if (val.type === 'string') {
                        // Skip standard/generic compatible strings
                        if (STANDARD_COMPATIBLES.includes(val.value)) {
                            return;
                        }

                        const parts = val.value.split(',');
                        if (parts.length < 2) {
                            issues.push({
                                severity: 'warning',
                                line: propData.line,
                                message: `Compatible string "${val.value}" should have vendor prefix`,
                                suggestion: 'Format: "vendor,device" (e.g., "ti,am625-uart")'
                            });
                        } else if (!VENDOR_PREFIXES.includes(parts[0])) {
                            issues.push({
                                severity: 'info',
                                line: propData.line,
                                message: `Unknown vendor prefix "${parts[0]}" in compatible string`,
                                suggestion: 'Verify this is a valid vendor prefix'
                            });
                        }
                    }
                });
            }

            // Check status property
            if (propName === 'status') {
                if (propData.values.length > 0 && propData.values[0].type === 'string') {
                    const status = propData.values[0].value;
                    if (!['okay', 'disabled', 'reserved', 'fail'].includes(status)) {
                        issues.push({
                            severity: 'error',
                            line: propData.line,
                            message: `Invalid status value: "${status}"`,
                            suggestion: 'Valid values are: "okay", "disabled", "reserved", "fail"'
                        });
                    }
                }
            }

            // Check reg property format
            if (propName === 'reg') {
                if (propData.values.length === 0 || propData.values[0].type !== 'cells') {
                    issues.push({
                        severity: 'error',
                        line: propData.line,
                        message: '"reg" property must use cell format <address size>',
                        suggestion: 'Example: reg = <0x4a100000 0x1000>;'
                    });
                }
            }

            // Check interrupt-related properties
            if (propName === 'interrupts') {
                if (propData.values.length === 0 || propData.values[0].type !== 'cells') {
                    issues.push({
                        severity: 'error',
                        line: propData.line,
                        message: '"interrupts" property must use cell format',
                        suggestion: 'Example: interrupts = <10 IRQ_TYPE_LEVEL_HIGH>;'
                    });
                }

                // Check for interrupt-parent
                if (!node.properties['interrupt-parent'] && !hasAncestorProperty(node, 'interrupt-parent')) {
                    issues.push({
                        severity: 'warning',
                        line: propData.line,
                        message: 'Node has "interrupts" but no "interrupt-parent" found',
                        suggestion: 'Specify interrupt-parent = <&intc>; or define it in a parent node'
                    });
                }
            }

            // Check clock properties
            if (propName === 'clocks') {
                if (node.properties['clock-names']) {
                    const clockCount = propData.values.filter(v => v.type === 'phandle' || v.type === 'cells').length;
                    const nameCount = node.properties['clock-names'].values.filter(v => v.type === 'string').length;
                    if (clockCount !== nameCount) {
                        issues.push({
                            severity: 'warning',
                            line: propData.line,
                            message: 'Number of clocks does not match number of clock-names',
                            suggestion: 'Ensure each clock has a corresponding name'
                        });
                    }
                }
            }

            // Check for deprecated properties
            const deprecated = ['device-type', 'linux,phandle'];
            if (deprecated.includes(propName) && propName !== 'device-type') {
                issues.push({
                    severity: 'warning',
                    line: propData.line,
                    message: `Property "${propName}" is deprecated`,
                    suggestion: 'Remove this property unless required for legacy compatibility'
                });
            }
        }
    }

    // Recurse into children
    if (node.children) {
        node.children.forEach(child => {
            const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
            validateProperties(child, issues, childPath);
        });
    }
}

function hasAncestorProperty(node, propName) {
    let current = node.parent;
    while (current) {
        if (current.properties && current.properties[propName]) {
            return true;
        }
        current = current.parent;
    }
    return false;
}

function validateReferences(tree, issues) {
    // Collect all labels
    const labels = new Map();
    collectLabels(tree, labels);

    // Check all phandle references
    checkPhandles(tree, labels, issues);
}

function collectLabels(node, labels, path = '/') {
    if (node.labels) {
        node.labels.forEach(label => {
            if (labels.has(label)) {
                // Duplicate label - will be caught later
            } else {
                labels.set(label, { node, path });
            }
        });
    }

    if (node.children) {
        node.children.forEach(child => {
            const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
            collectLabels(child, labels, childPath);
        });
    }
}

function checkPhandles(node, labels, issues) {
    // Check node references (like &uart0 { ... })
    if (node.type === 'reference') {
        if (!labels.has(node.reference)) {
            issues.push({
                severity: 'error',
                line: node.line,
                message: `Reference to undefined label: "&${node.reference}"`,
                suggestion: `Define label "${node.reference}:" on a node before referencing it`
            });
        }
    }

    // Check property phandle references
    if (node.properties) {
        for (const [propName, propData] of Object.entries(node.properties)) {
            propData.values.forEach(val => {
                if (val.type === 'phandle') {
                    if (!labels.has(val.value)) {
                        issues.push({
                            severity: 'error',
                            line: val.line || propData.line,
                            message: `Reference to undefined label: "&${val.value}" in property "${propName}"`,
                            suggestion: `Define label "${val.value}:" on a node before referencing it`
                        });
                    }
                }
            });
        }
    }

    // Recurse
    if (node.children) {
        node.children.forEach(child => checkPhandles(child, labels, issues));
    }
}

function checkBestPractices(tree, issues) {
    // Check for TI-specific best practices
    checkTIBestPractices(tree, issues);

    // Check for common patterns
    checkCommonPatterns(tree, issues);
}

function checkTIBestPractices(node, issues, path = '/') {
    if (node.properties) {
        const compatible = node.properties['compatible'];

        if (compatible) {
            const compatStrings = compatible.values
                .filter(v => v.type === 'string')
                .map(v => v.value);

            const isTIDevice = compatStrings.some(s => s.startsWith('ti,'));

            if (isTIDevice) {
                // Check for pinmux on TI peripherals
                const peripheralTypes = ['uart', 'i2c', 'spi', 'mmc', 'usb', 'eth'];
                const isPeripheral = peripheralTypes.some(type =>
                    compatStrings.some(s => s.includes(type))
                );

                if (isPeripheral && !node.properties['pinctrl-0'] && !hasAncestorProperty(node, 'pinctrl-0')) {
                    issues.push({
                        severity: 'info',
                        line: node.line,
                        message: 'TI peripheral node may need pinmux configuration',
                        suggestion: 'Add pinctrl-names and pinctrl-0 properties for pin configuration'
                    });
                }

                // Check for power domains on TI devices
                if (isPeripheral && !node.properties['power-domains'] && !hasAncestorProperty(node, 'power-domains')) {
                    issues.push({
                        severity: 'info',
                        line: node.line,
                        message: 'TI device may need power domain specification',
                        suggestion: 'Consider adding power-domains property if device requires power management'
                    });
                }
            }
        }
    }

    if (node.children) {
        node.children.forEach(child => {
            const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
            checkTIBestPractices(child, issues, childPath);
        });
    }
}

function checkCommonPatterns(node, issues, path = '/') {
    // Check memory nodes
    if (node.name && node.name.startsWith('memory')) {
        if (!node.properties['device_type'] ||
            node.properties['device_type'].values[0]?.value !== 'memory') {
            issues.push({
                severity: 'warning',
                line: node.line,
                message: 'Memory node should have device_type = "memory"',
                suggestion: 'Add device_type = "memory"; property'
            });
        }
        if (!node.properties['reg']) {
            issues.push({
                severity: 'error',
                line: node.line,
                message: 'Memory node must have "reg" property',
                suggestion: 'Add reg = <address size>; property'
            });
        }
    }

    // Check for nodes that should have status property
    const shouldHaveStatus = ['i2c', 'spi', 'uart', 'mmc', 'usb', 'ethernet'];
    if (node.name && shouldHaveStatus.some(type => node.name.includes(type))) {
        if (!node.properties['status']) {
            issues.push({
                severity: 'info',
                line: node.line,
                message: `Node "${node.name}" typically should have a "status" property`,
                suggestion: 'Add status = "okay"; or status = "disabled";'
            });
        }
    }

    if (node.children) {
        node.children.forEach(child => {
            const childPath = path === '/' ? '/' + child.name : path + '/' + child.name;
            checkCommonPatterns(child, issues, childPath);
        });
    }
}

// Display functions
function displayResults(issues, tree) {
    // Sort issues by line number
    issues.sort((a, b) => a.line - b.line);

    // Count by severity
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;

    // Display summary
    summaryContainer.innerHTML = '';
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'input-info';

    if (issues.length === 0) {
        summaryDiv.innerHTML = `
            <strong style="color: var(--ti-teal);">✓ Validation Passed</strong><br>
            No issues found. Device tree structure looks good!
        `;
        summaryDiv.style.borderColor = 'var(--ti-teal)';
    } else {
        summaryDiv.innerHTML = `
            <strong>Validation Summary:</strong><br>
            ${errors > 0 ? `<span style="color: var(--ti-red);">● ${errors} Error${errors !== 1 ? 's' : ''}</span>` : ''}
            ${warnings > 0 ? `<span style="color: #FF9800;">● ${warnings} Warning${warnings !== 1 ? 's' : ''}</span>` : ''}
            ${infos > 0 ? `<span style="color: var(--ti-blue-dark);">● ${infos} Info</span>` : ''}
        `;
    }
    summaryContainer.appendChild(summaryDiv);

    // Display issues
    issuesContainer.innerHTML = '';
    if (issues.length > 0) {
        issues.forEach(issue => {
            const issueCard = document.createElement('div');
            issueCard.className = 'error-card';

            let borderColor;
            let severityColor;
            if (issue.severity === 'error') {
                borderColor = 'var(--ti-red)';
                severityColor = 'var(--ti-red)';
            } else if (issue.severity === 'warning') {
                borderColor = '#FF9800';
                severityColor = '#FF9800';
            } else {
                borderColor = 'var(--ti-blue-dark)';
                severityColor = 'var(--ti-blue-dark)';
            }

            issueCard.style.borderLeftColor = borderColor;

            issueCard.innerHTML = `
                <div class="error-header">
                    <div class="error-name" style="color: ${severityColor};">
                        ${issue.severity.toUpperCase()}: Line ${issue.line}
                    </div>
                </div>
                <div class="error-description">
                    <strong>${issue.message}</strong>
                    ${issue.suggestion ? `<br><em style="color: var(--ti-teal);">💡 ${issue.suggestion}</em>` : ''}
                </div>
            `;

            issuesContainer.appendChild(issueCard);
        });

        // Add note about phandle reference errors if present
        const phandleErrors = issues.filter(i => i.message.includes('Reference to undefined label'));
        if (phandleErrors.length > 0) {
            const noteCard = document.createElement('div');
            noteCard.className = 'input-info';
            noteCard.style.marginTop = '1rem';
            noteCard.style.borderColor = 'var(--ti-blue-dark)';
            noteCard.innerHTML = `
                <strong>ℹ️ Note about undefined label errors:</strong><br>
                Many errors about "Reference to undefined label" are expected when validating device tree files that use <code>#include</code> directives.
                Labels defined in included files (like <code>k3-j722s.dtsi</code>) are not evaluated by this validator.
                These errors will not appear when compiling with dtc, which properly processes includes.
            `;
            issuesContainer.appendChild(noteCard);
        }
    }

    resultsSection.style.display = 'block';

    // Display tree view
    displayTreeView(tree);

    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function displayTreeView(tree) {
    treeViewContainer.innerHTML = '';

    // Add helpful info banner
    const infoBanner = document.createElement('div');
    infoBanner.className = 'tree-help-banner';
    infoBanner.innerHTML = `
        <strong>💡 How to use this visualizer:</strong>
        Click the <span style="color: var(--ti-red); font-weight: 700;">▼/▶</span> arrows to expand/collapse nodes •
        Hover over any element for detailed explanations •
        <span style="color: var(--ti-teal); font-weight: 600;">Labels</span> can be referenced with & syntax •
        <span style="color: var(--ti-cyan); font-weight: 600;">Cyan lines</span> show parent-child relationships<br>
        <strong>Color-coded sections:</strong>
        <span style="color: #9C27B0; font-weight: 600;">■</span> Memory •
        <span style="color: #FF9800; font-weight: 600;">■</span> Config •
        <span style="color: #2196F3; font-weight: 600;">■</span> Hardware •
        <span style="color: #4CAF50; font-weight: 600;">■</span> Power •
        <span style="color: var(--ti-teal); font-weight: 600;">■</span> Peripherals •
        <span style="color: #FFC107; font-weight: 600;">■</span> Pin Mux
    `;
    treeViewContainer.appendChild(infoBanner);

    // Add collapse/expand all controls
    const controls = document.createElement('div');
    controls.style.marginBottom = '1rem';
    controls.style.display = 'flex';
    controls.style.gap = '0.5rem';

    const expandAllBtn = document.createElement('button');
    expandAllBtn.textContent = 'Expand All';
    expandAllBtn.className = 'secondary';
    expandAllBtn.style.padding = '0.5rem 1rem';
    expandAllBtn.style.fontSize = '0.875rem';
    expandAllBtn.title = 'Expand all nodes to show their properties and children';
    expandAllBtn.onclick = () => toggleAllNodes(treeViewContainer, false);

    const collapseAllBtn = document.createElement('button');
    collapseAllBtn.textContent = 'Collapse All';
    collapseAllBtn.className = 'secondary';
    collapseAllBtn.style.padding = '0.5rem 1rem';
    collapseAllBtn.style.fontSize = '0.875rem';
    collapseAllBtn.title = 'Collapse deeply nested nodes (shows root and direct children only)';
    collapseAllBtn.onclick = () => toggleAllNodes(treeViewContainer, true);

    controls.appendChild(expandAllBtn);
    controls.appendChild(collapseAllBtn);
    treeViewContainer.appendChild(controls);

    const treeDiv = buildTreeHTML(tree);
    treeViewContainer.appendChild(treeDiv);
    treeViewSection.style.display = 'block';
}

function toggleAllNodes(container, collapse) {
    if (collapse) {
        // Collapse mode: show root (level 0) and level 1, collapse level 2+
        // We need to identify which level each node is at
        const allNodeContainers = container.querySelectorAll('.tree-node-container');

        allNodeContainers.forEach(nodeContainer => {
            // Calculate depth by counting ancestor tree-node-containers
            let depth = 0;
            let parent = nodeContainer.parentElement;
            while (parent && parent !== container) {
                if (parent.classList.contains('tree-node-container')) {
                    depth++;
                }
                parent = parent.parentElement;
            }

            const nodeContent = nodeContainer.querySelector(':scope > .tree-node-box > .tree-node-content');
            const childrenContainer = nodeContainer.querySelector(':scope > .tree-children-container');
            const expandBtn = nodeContainer.querySelector(':scope > .tree-node-box > .tree-node-header > .tree-expand-btn');

            // Collapse if depth is 2 or more (level 2+)
            if (depth >= 2) {
                if (nodeContent) nodeContent.classList.add('collapsed');
                if (childrenContainer) childrenContainer.classList.add('collapsed');
                if (expandBtn) {
                    expandBtn.textContent = '▶';
                    expandBtn.title = 'Click to expand and show properties/children';
                }
            } else {
                // Keep level 0 and 1 expanded
                if (nodeContent) nodeContent.classList.remove('collapsed');
                if (childrenContainer) childrenContainer.classList.remove('collapsed');
                if (expandBtn) {
                    expandBtn.textContent = '▼';
                    expandBtn.title = 'Click to collapse and hide properties/children';
                }
            }
        });
    } else {
        // Expand all - simple case
        const allContents = container.querySelectorAll('.tree-node-content');
        const allChildrenContainers = container.querySelectorAll('.tree-children-container');
        const allExpandBtns = container.querySelectorAll('.tree-expand-btn');

        allContents.forEach(content => content.classList.remove('collapsed'));
        allChildrenContainers.forEach(children => children.classList.remove('collapsed'));
        allExpandBtns.forEach(btn => {
            btn.textContent = '▼';
            btn.title = 'Click to collapse and hide properties/children';
        });
    }
}

function buildTreeHTML(node, level = 0) {
    const container = document.createElement('div');
    container.className = 'tree-node-container';

    // Show preprocessor directives at root level
    if (level === 0 && node.preprocessor && node.preprocessor.length > 0) {
        const preprocDiv = document.createElement('div');
        preprocDiv.className = 'tree-preprocessor';
        preprocDiv.title = 'Preprocessor directives - these are recognized but not evaluated by this web tool. Use dtc for full preprocessing.';

        node.preprocessor.forEach(directive => {
            const directiveLine = document.createElement('div');
            directiveLine.textContent = directive;
            preprocDiv.appendChild(directiveLine);
        });

        container.appendChild(preprocDiv);
    }

    // Main node box
    const nodeBox = document.createElement('div');
    nodeBox.className = 'tree-node-box';

    // Get node name first
    let nameText = node.name || '/';

    // Add section-level context badge for important sections
    let sectionBadge = null;
    let sectionType = null;

    if (nameText === 'reserved-memory' || nameText === 'reserved_memory') {
        sectionType = 'memory';
    } else if (nameText === 'chosen') {
        sectionType = 'config';
    } else if (nameText === 'aliases') {
        sectionType = 'config';
    } else if (nameText === 'cpus') {
        sectionType = 'hardware';
    } else if (nameText.match(/^regulator-/) || node.properties?.compatible?.values?.some(v => v.value?.includes('regulator'))) {
        sectionType = 'power';
    } else if (nameText === 'leds' || nameText.match(/gpio-keys/)) {
        sectionType = 'peripheral';
    } else if (nameText.startsWith('memory@')) {
        sectionType = 'memory';
    } else if (nameText.match(/pinmux|pinctrl/) || nameText.includes('_pins_')) {
        sectionType = 'pinmux';
    } else if (nameText.match(/uart|i2c|spi|mmc|eth|usb/)) {
        sectionType = 'peripheral';
    }

    if (sectionType) {
        nodeBox.setAttribute('data-section-type', sectionType);
    }

    // Calculate children and properties before using them
    const hasChildren = node.children && node.children.length > 0;
    const hasProperties = node.properties && Object.keys(node.properties).length > 0;

    // Node header with expand/collapse control
    const nodeHeader = document.createElement('div');
    nodeHeader.className = 'tree-node-header';

    // Add overall section tooltip based on node characteristics
    let headerTooltip = '';
    if (hasProperties && hasChildren) {
        headerTooltip = `This node has ${Object.keys(node.properties).length} properties and ${node.children.length} child nodes. Click the arrow to expand/collapse.`;
    } else if (hasProperties) {
        headerTooltip = `This node has ${Object.keys(node.properties).length} properties. Click the arrow to view them.`;
    } else if (hasChildren) {
        headerTooltip = `This node contains ${node.children.length} child nodes. Click the arrow to expand/collapse.`;
    }
    if (headerTooltip) {
        nodeHeader.title = headerTooltip;
    }

    // Expand/collapse button
    if (hasChildren || hasProperties) {
        const expandBtn = document.createElement('span');
        expandBtn.className = 'tree-expand-btn';
        // Set initial state based on level
        const isInitiallyExpanded = level < 2;
        expandBtn.textContent = isInitiallyExpanded ? '▼' : '▶';
        expandBtn.title = isInitiallyExpanded ?
            'Click to collapse and hide properties/children' :
            'Click to expand and show properties/children';
        expandBtn.onclick = (e) => {
            e.stopPropagation();
            const nodeContent = nodeBox.querySelector('.tree-node-content');
            const childrenContainer = container.querySelector('.tree-children-container');
            const isExpanded = nodeContent && !nodeContent.classList.contains('collapsed');

            if (nodeContent) {
                nodeContent.classList.toggle('collapsed');
            }
            if (childrenContainer) {
                childrenContainer.classList.toggle('collapsed');
            }

            expandBtn.textContent = isExpanded ? '▶' : '▼';
            expandBtn.title = isExpanded ?
                'Click to expand and show properties/children' :
                'Click to collapse and hide properties/children';
        };
        nodeHeader.appendChild(expandBtn);
    } else {
        const spacer = document.createElement('span');
        spacer.className = 'tree-expand-spacer';
        nodeHeader.appendChild(spacer);
    }

    // Node name
    const nodeName = document.createElement('span');
    nodeName.className = 'tree-node-name';
    // nameText already declared above
    if (node.labels && node.labels.length > 0) {
        const labelSpan = document.createElement('span');
        labelSpan.className = 'tree-node-label';
        labelSpan.textContent = node.labels.join(', ') + ': ';
        labelSpan.title = 'Label(s) that can be referenced using & syntax (e.g., &' + node.labels[0] + ')';
        nodeName.appendChild(labelSpan);
    }
    const nameTextSpan = document.createElement('span');
    nameTextSpan.textContent = nameText;

    // Add intelligent tooltips based on node name patterns
    let tooltip = 'Device tree node representing a hardware component or configuration';

    if (level === 0) {
        tooltip = 'Root node - top level of the device tree hierarchy';
    } else if (nameText.startsWith('memory@')) {
        tooltip = 'Memory Region - defines system RAM address range and size';
    } else if (nameText === 'reserved-memory' || nameText === 'reserved_memory') {
        tooltip = 'Reserved Memory Section - memory regions reserved for specific purposes (firmware, DMA buffers, etc.)';
    } else if (nameText === 'chosen') {
        tooltip = 'Chosen Section - runtime configuration like boot arguments and console output';
    } else if (nameText === 'aliases') {
        tooltip = 'Aliases Section - shortcuts to reference devices by simple names (e.g., serial0, mmc1)';
    } else if (nameText.match(/^regulator-/)) {
        tooltip = 'Voltage Regulator - provides power supply to other components';
    } else if (nameText === 'leds') {
        tooltip = 'LED Configuration - defines system LEDs and their behavior';
    } else if (nameText.match(/^led-\d+/)) {
        tooltip = 'LED Definition - individual LED configuration';
    } else if (nameText.match(/gpio-keys/)) {
        tooltip = 'GPIO Keys/Buttons - hardware buttons mapped to input events';
    } else if (nameText.match(/@[0-9a-f]+$/)) {
        tooltip = 'Hardware Device - address suffix indicates memory-mapped I/O location';
    } else if (nameText.match(/uart\d*/)) {
        tooltip = 'UART/Serial Port - serial communication interface';
    } else if (nameText.match(/i2c\d*/)) {
        tooltip = 'I2C Bus - inter-integrated circuit communication bus';
    } else if (nameText.match(/spi\d*/)) {
        tooltip = 'SPI Bus - serial peripheral interface bus';
    } else if (nameText.match(/gpio\d*/)) {
        tooltip = 'GPIO Controller - general purpose input/output pins';
    } else if (nameText.match(/mmc\d*/)) {
        tooltip = 'MMC/SD Card Controller - multimedia card interface';
    } else if (nameText.match(/eth\d*|ethernet/)) {
        tooltip = 'Ethernet Interface - network connectivity';
    } else if (nameText.match(/usb\d*/)) {
        tooltip = 'USB Controller - universal serial bus interface';
    } else if (nameText.match(/pcie/)) {
        tooltip = 'PCIe Controller - PCI express interface';
    } else if (nameText.match(/dma/)) {
        tooltip = 'DMA Controller - direct memory access for efficient data transfer';
    } else if (nameText.match(/clock/)) {
        tooltip = 'Clock Provider - generates timing signals for system components';
    } else if (nameText.match(/pinmux|pinctrl/)) {
        tooltip = 'Pin Multiplexing - configures how physical pins are used';
    } else if (nameText.match(/interrupt/)) {
        tooltip = 'Interrupt Controller - manages hardware interrupt signals';
    } else if (nameText.match(/timer/)) {
        tooltip = 'Timer Device - provides system timing functionality';
    } else if (nameText.match(/watchdog/)) {
        tooltip = 'Watchdog Timer - monitors system health and can trigger reset';
    } else if (nameText.match(/rtc/)) {
        tooltip = 'Real-Time Clock - keeps track of date and time';
    } else if (nameText.match(/pmic/)) {
        tooltip = 'Power Management IC - manages system power distribution';
    } else if (nameText.match(/adc/)) {
        tooltip = 'Analog-to-Digital Converter - converts analog signals to digital';
    } else if (nameText.match(/pwm/)) {
        tooltip = 'PWM Controller - pulse width modulation for motor control, LEDs, etc.';
    } else if (nameText.match(/can/)) {
        tooltip = 'CAN Bus - controller area network for automotive/industrial communication';
    } else if (nameText.match(/sound|audio|codec/)) {
        tooltip = 'Audio Device - sound input/output hardware';
    } else if (nameText.match(/video|display|lcd|dsi/)) {
        tooltip = 'Display Interface - video output or display controller';
    } else if (nameText.match(/camera|csi/)) {
        tooltip = 'Camera Interface - video input from camera sensors';
    } else if (nameText.match(/crypto/)) {
        tooltip = 'Cryptographic Accelerator - hardware encryption/decryption';
    } else if (nameText.match(/power-domain/)) {
        tooltip = 'Power Domain - group of devices that can be powered on/off together';
    } else if (nameText.match(/cpu\d*/)) {
        tooltip = 'CPU Core - processor definition with frequency, cache, etc.';
    } else if (nameText === 'cpus') {
        tooltip = 'CPU Section - contains definitions for all processor cores';
    } else if (nameText.match(/thermal/)) {
        tooltip = 'Thermal Zone - temperature monitoring and thermal management';
    } else if (nameText.match(/firmware/)) {
        tooltip = 'Firmware Node - configuration for loading firmware blobs';
    } else if (nameText.match(/sram/)) {
        tooltip = 'SRAM - static RAM, often used for low-latency buffers';
    } else if (nameText.match(/flash|nor|nand|qspi/)) {
        tooltip = 'Flash Memory - non-volatile storage device';
    } else if (nameText.match(/partition/)) {
        tooltip = 'Storage Partition - logical division of flash/storage device';
    } else if (nameText.match(/mdio/)) {
        tooltip = 'MDIO Bus - management interface for Ethernet PHYs';
    } else if (nameText.match(/phy/)) {
        tooltip = 'PHY - physical layer transceiver (Ethernet, USB, etc.)';
    } else if (nameText.match(/regulator/)) {
        tooltip = 'Voltage Regulator - provides stable voltage supply to components';
    } else if (nameText.match(/eeprom/)) {
        tooltip = 'EEPROM - electrically erasable programmable read-only memory';
    }

    nameTextSpan.title = tooltip;
    nodeName.appendChild(nameTextSpan);
    nodeHeader.appendChild(nodeName);

    // Child count badge
    if (hasChildren) {
        const badge = document.createElement('span');
        badge.className = 'tree-child-badge';
        badge.textContent = `${node.children.length} child${node.children.length !== 1 ? 'ren' : ''}`;
        badge.title = `This node contains ${node.children.length} child node${node.children.length !== 1 ? 's' : ''}`;
        nodeHeader.appendChild(badge);
    }

    nodeBox.appendChild(nodeHeader);

    // Node content (properties)
    if (hasProperties) {
        const nodeContent = document.createElement('div');
        nodeContent.className = 'tree-node-content';

        // Start collapsed for level 2+ nodes
        if (level >= 2) {
            nodeContent.classList.add('collapsed');
        }

        for (const [propName, propData] of Object.entries(node.properties)) {
            const propLine = document.createElement('div');
            propLine.className = 'tree-property';

            const propNameSpan = document.createElement('span');
            propNameSpan.className = 'tree-prop-name';
            propNameSpan.textContent = propName;

            // Add property-specific tooltips
            const propTooltips = {
                'compatible': 'Device compatibility string - identifies the hardware type',
                'reg': 'Register address and size - defines memory-mapped I/O location',
                'interrupts': 'Interrupt configuration - specifies interrupt line and flags',
                'status': 'Node status - "okay" (enabled), "disabled", or "reserved"',
                'phandle': 'Unique identifier for this node that can be referenced by other nodes',
                'clocks': 'Clock references - specifies which clocks this device uses',
                'clock-names': 'Names for the clocks specified in the clocks property',
                'pinctrl-0': 'Pin control configuration - defines pin multiplexing settings',
                'pinctrl-names': 'Names for pin control states (e.g., "default")',
                'interrupt-parent': 'Reference to the interrupt controller for this device',
                'power-domains': 'Power domain this device belongs to',
                '#address-cells': 'Number of cells used to encode addresses in child nodes',
                '#size-cells': 'Number of cells used to encode sizes in child nodes',
                'device_type': 'Device type classification (e.g., "memory", "cpu")',
                'model': 'Human-readable device model name',
                'label': 'Reference label for this node'
            };

            propNameSpan.title = propTooltips[propName] || 'Device tree property';
            propLine.appendChild(propNameSpan);

            if (propData.values && propData.values.length > 0) {
                const propValueSpan = document.createElement('span');
                propValueSpan.className = 'tree-prop-value';

                let valueStr = propData.values.map(v => {
                    if (v.type === 'string') return `"${v.value}"`;
                    if (v.type === 'cells') return `<${v.value}>`;
                    if (v.type === 'phandle') return `&${v.value}`;
                    return v.value;
                }).join(', ');

                propValueSpan.textContent = ' = ' + valueStr;

                // Add value type tooltip
                const valueTypes = propData.values.map(v => v.type).filter((v, i, a) => a.indexOf(v) === i);
                if (valueTypes.includes('phandle')) {
                    propValueSpan.title = 'Phandle reference - points to another node in the tree';
                } else if (valueTypes.includes('cells')) {
                    propValueSpan.title = 'Cell array - numeric values in angle brackets';
                } else if (valueTypes.includes('string')) {
                    propValueSpan.title = 'String value(s)';
                }

                propLine.appendChild(propValueSpan);
            } else {
                // Boolean property (no value)
                propLine.title = 'Boolean property - presence indicates true';
            }

            nodeContent.appendChild(propLine);
        }

        nodeBox.appendChild(nodeContent);
    }

    container.appendChild(nodeBox);

    // Children
    if (hasChildren) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children-container';
        childrenContainer.title = `Container for ${node.children.length} child node${node.children.length !== 1 ? 's' : ''} of ${nameText}`;

        // Start collapsed for level 2+ nodes
        if (level >= 2) {
            childrenContainer.classList.add('collapsed');
        }

        node.children.forEach((child, index) => {
            const childWrapper = document.createElement('div');
            childWrapper.className = 'tree-child-wrapper';

            // Connecting line
            const connector = document.createElement('div');
            connector.className = 'tree-connector';
            connector.title = `Child node of ${nameText} - shows parent-child relationship in device tree hierarchy`;
            childWrapper.appendChild(connector);

            // Child node
            const childNode = buildTreeHTML(child, level + 1);
            childWrapper.appendChild(childNode);

            childrenContainer.appendChild(childWrapper);
        });

        container.appendChild(childrenContainer);
    }

    return container;
}

function displayError(message) {
    summaryContainer.innerHTML = '';
    issuesContainer.innerHTML = '';
    treeViewSection.style.display = 'none';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    issuesContainer.appendChild(errorDiv);

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
