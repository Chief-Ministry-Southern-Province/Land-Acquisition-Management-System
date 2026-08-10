<?php

namespace App\Services;

use App\Exports\GenericExport;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Facades\Excel;
use Mpdf\Config\ConfigVariables;
use Mpdf\Config\FontVariables;
use Mpdf\Mpdf;

class ExportService
{
    public function export(
        Collection $data,
        array $headings,
        string $filename,
        string $format,
        ?string $pdfView = null,
        array $pdfData = []
    ) {
        return match ($format) {
            'csv' => $this->toCsv($data, $headings, $filename),
            'excel' => $this->toExcel($data, $headings, $filename),
            'pdf' => $this->toPdf($pdfView, $pdfData, $filename),
            default => abort(400, 'Unsupported export format'),
        };
    }

    protected function toCsv(Collection $data, array $headings, string $filename)
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename.csv\"",
        ];

        $callback = function () use ($data, $headings) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headings);

            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    protected function toExcel(Collection $data, array $headings, string $filename)
    {
        return Excel::download(new GenericExport($data, $headings), "$filename.xlsx");
    }

    protected function toPdf(?string $view, array $data, string $filename)
    {
        if (! $view) {
            abort(500, 'PDF view not specified');
        }

        $paperOrientation = ($view === 'pdf.land_parcels' || $view === 'pdf.projects') ? 'landscape' : 'portrait';
        $html = view($view, $data)->render();

        $defaultConfig = (new ConfigVariables)->getDefaults();
        $fontDirs = $defaultConfig['fontDir'];

        $defaultFontConfig = (new FontVariables)->getDefaults();
        $fontData = $defaultFontConfig['fontdata'];

        $mpdf = new Mpdf([
            'mode' => 'utf-8',
            'format' => 'A4',
            'orientation' => $paperOrientation === 'landscape' ? 'L' : 'P',
            'fontDir' => array_merge($fontDirs, [
                storage_path('fonts'),
            ]),
            'fontdata' => $fontData + [
                'notosanssinhala' => [
                    'R' => 'AbhayaLibre-Regular.ttf',
                    'B' => 'AbhayaLibre-Bold.ttf',
                    'useOTL' => 0xFF,
                ],
            ],
            'tempDir' => storage_path('framework'),
        ]);

        $mpdf->WriteHTML($html);

        return response()->streamDownload(
            fn () => print ($mpdf->Output('', 'S')),
            "$filename.pdf",
            [
                'Content-Type' => 'application/pdf',
            ]
        );
    }
}
