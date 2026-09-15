<?php

require __DIR__ . '/../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

$spreadsheet = new Spreadsheet();

// ---------------------------------------------------------
// Sheet 1: Land Parcels Import (Data Sheet)
// ---------------------------------------------------------
$sheet1 = $spreadsheet->getActiveSheet();
$sheet1->setTitle('Land Parcels Import');

$headers = [
    'Land Number',
    'Associated Project',
    'Land Name',
    'Province',
    'District',
    'Division',
    'GN Division',
    'Village',
    'Land Type',
    'Extent',
    'Estimated Value',
    'Current Status',
    'Remarks',
    'Owner Name',
    'Owner NIC',
    'Owner Address',
    'Owner Contact',
    'Resident Name',
    'Resident NIC',
    'Resident Address',
    'Resident Contact',
    'Resident Relationship',
    'Has Plan',
    'Plan Number',
    'Parcel Numbers',
    'North Boundary',
    'South Boundary',
    'East Boundary',
    'West Boundary',
    'Has Residential Houses',
    'Is Resident Owner',
    'Is Cultivated',
    'Cultivation',
    'Cultivation Status',
    'Annual Income',
    'Casehold',
    'Case Number',
    'Case Status',
    'Donated',
    'Latitude',
    'Longitude',
];

// Write Header Row
foreach ($headers as $colIndex => $header) {
    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
    $sheet1->setCellValue("{$colLetter}1", $header);
}

// Style Header Row
$headerStyle = [
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
        'name' => 'Calibri',
        'size' => 11,
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '1E3A8A'], // Deep Navy
    ],
    'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
        'wrapText' => true,
    ],
    'borders' => [
        'bottom' => [
            'borderStyle' => Border::BORDER_MEDIUM,
            'color' => ['rgb' => '0F172A'],
        ],
    ],
];
$lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($headers));
$sheet1->getStyle("A1:{$lastColLetter}1")->applyFromArray($headerStyle);
$sheet1->getRowDimension(1)->setRowHeight(30);

// Sample Data Rows
$sampleData = [
    [
        'PAR-GAL-2026-001',
        'Southern Expressway Extension',
        'Mahawatta Lot 10',
        'Southern',
        'Galle',
        'Four Gravets',
        '528A Fort',
        'Galle Fort',
        'Residential',
        '2 ac 1 rd 15 per',
        '8500000',
        'Available',
        'Located near main road junction',
        'Sunil Perera',
        '198012345678',
        'No 45, Main Street, Galle',
        '+94771234567',
        'Sunil Perera',
        '198012345678',
        'No 45, Main Street, Galle',
        '+94771234567',
        'owner',
        'Yes',
        'P-2025-104',
        'Lot 1, Lot 2',
        'Main Road',
        'Lot 11',
        'Public Canal',
        'Reservation',
        'Yes',
        'Yes',
        'No',
        'N/A',
        'unspecified',
        '0',
        'No',
        '',
        '',
        'No',
        '6.0367',
        '80.2170',
    ],
    [
        'PAR-MAT-2026-002',
        'Matara Railway Coastal Line Upgrade',
        'Coconut Garden Parcel B',
        'Southern',
        'Matara',
        'Weligama',
        '342 Mirissa South',
        'Mirissa',
        'Agricultural',
        '1 ac 20 per',
        '4200000',
        'Pending',
        'Fertile coconut & pepper land',
        'K. A. Jayasinghe; M. B. Wickramasinghe',
        '197587654321; 198299887766',
        '12 Beach Road, Mirissa; 88 Station Road, Matara',
        '+94719876543; +94754443322',
        'N. C. Wijesinghe',
        '199011223344',
        '12 Beach Road, Mirissa',
        '+94726665544',
        'tenant',
        'Yes',
        'P-2024-889',
        'Lot 5A',
        'Beach Road',
        'Coconut Plantation',
        'Footpath',
        'Stream',
        'No',
        'No',
        'Yes',
        'Coconut, Pepper',
        'fertile',
        '450000',
        'No',
        '',
        '',
        'No',
        '5.9483',
        '80.4716',
    ],
    [
        'PAR-HAM-2026-003',
        'Beliatta Bypass Project',
        'Tangalle Commercial Parcel 3',
        'Southern',
        'Hambantota',
        'Tangalle',
        '112 Tangalle Town',
        'Tangalle',
        'Commercial',
        '35 per',
        '12500000',
        'Available',
        'Ownership court case pending in District Court',
        'Nimal Rajapaksha',
        '196811224455',
        'Court Road, Tangalle',
        '+94773332211',
        'Nimal Rajapaksha',
        '196811224455',
        'Court Road, Tangalle',
        '+94773332211',
        'owner',
        'No',
        '',
        '',
        'Court Road',
        'Commercial Building',
        'Lane',
        'Drainage Canal',
        'Yes',
        'Yes',
        'No',
        'N/A',
        'unspecified',
        '1200000',
        'Yes',
        'DSP/104/2025',
        'In Progress',
        'No',
        '6.0244',
        '80.7941',
    ],
    [
        'PAR-GAL-2026-004',
        'Southern Highway Expansion',
        'Godakanda Paddy Field',
        'Southern',
        'Galle',
        'Four Gravets',
        '512 Godakanda',
        'Godakanda',
        'Agricultural',
        '3 ac 0 rd 10 per',
        '6800000',
        'Acquired',
        'Land donated for highway construction project',
        'S. P. Hewage',
        '198855443322',
        'Godakanda, Galle',
        '+94778899000',
        '',
        '',
        '',
        '',
        'owner',
        'Yes',
        'P-2023-772',
        'Lot 12',
        'Agrarian Path',
        'Godakanda Road',
        'Irrigation Canal',
        'Paddy Field Lot 13',
        'No',
        'No',
        'Yes',
        'Paddy',
        'fertile',
        '380000',
        'No',
        '',
        '',
        'Yes',
        '6.0612',
        '80.2315',
    ]
];

// Populate Data
foreach ($sampleData as $rowIndex => $row) {
    $rowNum = $rowIndex + 2;
    foreach ($row as $colIndex => $val) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
        $sheet1->setCellValue("{$colLetter}{$rowNum}", $val);
    }
    
    // Alternating background colors
    $rowBg = ($rowNum % 2 === 0) ? 'FFFFFF' : 'F8FAFC';
    $sheet1->getStyle("A{$rowNum}:{$lastColLetter}{$rowNum}")->applyFromArray([
        'fill' => [
            'fillType' => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $rowBg],
        ],
        'borders' => [
            'bottom' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E2E8F0'],
            ],
            'left' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E2E8F0'],
            ],
            'right' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['rgb' => 'E2E8F0'],
            ],
        ],
        'alignment' => [
            'vertical' => Alignment::VERTICAL_CENTER,
        ],
    ]);
    $sheet1->getRowDimension($rowNum)->setRowHeight(22);
}

// Auto-fit column widths
foreach (range(1, count($headers)) as $colIndex) {
    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
    $sheet1->getColumnDimension($colLetter)->setAutoSize(true);
}


// ---------------------------------------------------------
// Sheet 2: Instructions & Field Specifications
// ---------------------------------------------------------
$sheet2 = $spreadsheet->createSheet();
$sheet2->setTitle('Instructions & Specifications');

// Title Banner
$sheet2->setCellValue('A1', 'Land Acquisition Management System - Land Parcel Import Specification');
$sheet2->getStyle('A1')->applyFromArray([
    'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '1E3A8A']],
]);
$sheet2->getRowDimension(1)->setRowHeight(28);

$sheet2->setCellValue('A2', 'Please review the field definitions below before preparing your import data. Mandatory fields are highlighted.');
$sheet2->getStyle('A2')->applyFromArray([
    'font' => ['italic' => true, 'size' => 10, 'color' => ['rgb' => '475569']],
]);

$instHeaders = ['Column Name', 'Required?', 'Data Type / Format', 'Description & Accepted Values', 'Sample Value'];
foreach ($instHeaders as $colIndex => $h) {
    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex + 1);
    $sheet2->setCellValue("{$colLetter}4", $h);
}

$sheet2->getStyle('A4:E4')->applyFromArray([
    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 10],
    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E3A8A']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
]);
$sheet2->getRowDimension(4)->setRowHeight(26);

$fieldGuide = [
    ['Land Number', 'REQUIRED', 'Text', 'Unique identifier for the land parcel (parcel_id). Must be unique in the system.', 'PAR-GAL-2026-001'],
    ['Associated Project', 'Optional', 'Text', 'Title or Code of an existing project in the system. Link parcel to a project.', 'Southern Expressway Extension'],
    ['Land Name', 'Optional', 'Text', 'Local lot name or name of the land parcel.', 'Mahawatta Lot 10'],
    ['Province', 'Optional', 'Text', 'Province name. Defaults to "Southern" if left blank.', 'Southern'],
    ['District', 'REQUIRED', 'Text', 'District name (e.g. Galle, Matara, Hambantota).', 'Galle'],
    ['Division', 'Optional', 'Text', 'Divisional Secretariat Division (DS Division).', 'Four Gravets'],
    ['GN Division', 'Optional', 'Text', 'Grama Niladhari Division name or code.', '528A Fort'],
    ['Village', 'REQUIRED', 'Text', 'Village, Town, or locality name.', 'Galle Fort'],
    ['Land Type', 'Optional', 'Text', 'Classification of land (e.g. Standard, Residential, Agricultural, Commercial).', 'Residential'],
    ['Extent', 'Optional', 'Text', 'Combined area string (e.g. "2 ac 1 rd 15 per", "1.5 ac", "25 per").', '2 ac 1 rd 15 per'],
    ['Estimated Value', 'Optional', 'Number', 'Estimated parcel value in LKR without symbols.', '8500000'],
    ['Current Status', 'Optional', 'Text', 'Status of parcel. Allowed: Available, Pending, Acquired.', 'Available'],
    ['Remarks', 'Optional', 'Text', 'Additional comments or background notes.', 'Located near main road junction'],
    ['Owner Name', 'Optional', 'Text', 'Name of property owner(s). Separate multiple owners with semicolon (;).', 'Sunil Perera; M. B. Silva'],
    ['Owner NIC', 'Optional', 'Text', 'NIC number of owner(s). Semicolon separated if multiple owners.', '198012345678; 199087654321'],
    ['Owner Address', 'Optional', 'Text', 'Address of owner(s). Semicolon separated if multiple owners.', 'No 45, Main Street, Galle'],
    ['Owner Contact', 'Optional', 'Text', 'Contact phone number(s). Semicolon separated if multiple owners.', '+94771234567'],
    ['Resident Name', 'Optional', 'Text', 'Name of resident(s) living on the land parcel.', 'Sunil Perera'],
    ['Resident NIC', 'Optional', 'Text', 'NIC of resident(s). Semicolon separated if multiple residents.', '198012345678'],
    ['Resident Address', 'Optional', 'Text', 'Resident address.', 'No 45, Main Street, Galle'],
    ['Resident Contact', 'Optional', 'Text', 'Resident phone number.', '+94771234567'],
    ['Resident Relationship', 'Optional', 'Text', 'Resident relationship: owner, tenant, family_member.', 'owner'],
    ['Has Plan', 'Optional', 'Text / Boolean', 'Whether survey plan exists: Yes / No (or True / False).', 'Yes'],
    ['Plan Number', 'Optional', 'Text', 'Survey plan reference number.', 'P-2025-104'],
    ['Parcel Numbers', 'Optional', 'Text', 'Specific lot/parcel numbers separated by comma or semicolon.', 'Lot 1, Lot 2'],
    ['North Boundary', 'Optional', 'Text', 'Boundary on the North side.', 'Main Road'],
    ['South Boundary', 'Optional', 'Text', 'Boundary on the South side.', 'Lot 11'],
    ['East Boundary', 'Optional', 'Text', 'Boundary on the East side.', 'Public Canal'],
    ['West Boundary', 'Optional', 'Text', 'Boundary on the West side.', 'Reservation'],
    ['Has Residential Houses', 'Optional', 'Text / Boolean', 'Yes / No if there are residential structures on the land.', 'Yes'],
    ['Is Resident Owner', 'Optional', 'Text / Boolean', 'Yes / No if owner lives on the parcel.', 'Yes'],
    ['Is Cultivated', 'Optional', 'Text / Boolean', 'Yes / No if land is actively cultivated.', 'No'],
    ['Cultivation', 'Optional', 'Text', 'Crop types (e.g. Coconut, Tea, Paddy, Cinnamon).', 'Coconut, Pepper'],
    ['Cultivation Status', 'Optional', 'Text', 'Soil fertility status: fertile, mid, infertile, unspecified.', 'fertile'],
    ['Annual Income', 'Optional', 'Number', 'Annual land/agricultural income in LKR.', '450000'],
    ['Casehold', 'Optional', 'Text / Boolean', 'Yes / No if land is subject to court case/litigation.', 'No'],
    ['Case Number', 'Optional', 'Text', 'Court case reference number if casehold is Yes.', 'DSP/104/2025'],
    ['Case Status', 'Optional', 'Text', 'Status of court case (e.g. In Progress, Pending).', 'In Progress'],
    ['Donated', 'Optional', 'Text / Boolean', 'Yes / No if land was voluntarily donated for project.', 'No'],
    ['Latitude', 'Optional', 'Decimal', 'GPS Latitude coordinate (Range: 5.7 to 10.0 for Sri Lanka).', '6.0367'],
    ['Longitude', 'Optional', 'Decimal', 'GPS Longitude coordinate (Range: 79.3 to 82.0 for Sri Lanka).', '80.2170'],
];

foreach ($fieldGuide as $idx => $row) {
    $rowNum = $idx + 5;
    foreach ($row as $colIdx => $v) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx + 1);
        $sheet2->setCellValue("{$colLetter}{$rowNum}", $v);
    }
    
    $isReq = ($row[1] === 'REQUIRED');
    $sheet2->getStyle("B{$rowNum}")->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => $isReq ? 'DC2626' : '475569']],
    ]);
    
    $sheet2->getStyle("A{$rowNum}:E{$rowNum}")->applyFromArray([
        'borders' => [
            'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'E2E8F0']],
        ],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER],
    ]);
    $sheet2->getRowDimension($rowNum)->setRowHeight(20);
}

foreach (range(1, 5) as $colIdx) {
    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
    $sheet2->getColumnDimension($colLetter)->setAutoSize(true);
}

// ---------------------------------------------------------
// Save Files
// ---------------------------------------------------------
$baseDir = __DIR__ . '/..';
$storageDir = $baseDir . '/storage/app/public/templates';
if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}

$xlsxPath1 = $baseDir . '/land_parcels_import_template.xlsx';
$xlsxPath2 = $storageDir . '/land_parcels_import_template.xlsx';

$csvPath1 = $baseDir . '/land_parcels_import_template.csv';
$csvPath2 = $storageDir . '/land_parcels_import_template.csv';

// Save XLSX
$writerXlsx = new Xlsx($spreadsheet);
$writerXlsx->save($xlsxPath1);
$writerXlsx->save($xlsxPath2);

// Save CSV (Data sheet only)
$spreadsheet->setActiveSheetIndex(0);
$writerCsv = new Csv($spreadsheet);
$writerCsv->setDelimiter(',');
$writerCsv->setEnclosure('"');
$writerCsv->setLineEnding("\n");
$writerCsv->setSheetIndex(0);
$writerCsv->save($csvPath1);
$writerCsv->save($csvPath2);

echo "Successfully generated Excel and CSV import templates:\n";
echo "1. Excel: {$xlsxPath1}\n";
echo "2. Excel Storage: {$xlsxPath2}\n";
echo "3. CSV: {$csvPath1}\n";
echo "4. CSV Storage: {$csvPath2}\n";
