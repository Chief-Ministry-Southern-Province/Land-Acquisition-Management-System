<?php

namespace App\Imports;

use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\SkipsEmptyRows;
use Maatwebsite\Excel\Concerns\SkipsFailures;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class GenericImport implements SkipsEmptyRows, SkipsOnFailure, ToModel, WithBatchInserts, WithChunkReading, WithHeadingRow, WithValidation
{
    use SkipsFailures;

    protected int $importCount = 0;

    public function __construct(
        protected string $modelClass,
        protected array $columnMap,
        protected array $validationRules = [],
        protected array $staticValues = [],
        protected array $normalizeFields = [],
        protected ?\Closure $transform = null,
    ) {}

    public function model(array $row)
    {
        $mappedData = [];
        foreach ($this->columnMap as $attribute => $excelKey) {
            $value = null;
            if (array_key_exists($excelKey, $row)) {
                $value = $row[$excelKey];
            } else {
                $sluggedKey = Str::slug($excelKey, '_');
                if (array_key_exists($sluggedKey, $row)) {
                    $value = $row[$sluggedKey];
                }
            }
            $mappedData[$attribute] = $value;
        }

        foreach ($this->staticValues as $attribute => $value) {
            $mappedData[$attribute] = $value;
        }

        foreach ($this->normalizeFields as $field => $type) {
            if (! isset($mappedData[$field])) {
                continue;
            }
            $val = $mappedData[$field];
            if (is_string($val)) {
                $val = trim($val);
            }
            if ($type === 'float' || $type === 'double' || $type === 'numeric') {
                $val = (float) $val;
            } elseif ($type === 'int' || $type === 'integer') {
                $val = (int) $val;
            } elseif ($type === 'string') {
                $val = (string) $val;
            } elseif ($type === 'lowercase') {
                $val = strtolower((string) $val);
            }
            $mappedData[$field] = $val;
        }

        if ($this->transform) {
            $result = ($this->transform)($mappedData, $row);
            if ($result === null) {
                $this->importCount++;

                return null;
            }
            if (is_array($result)) {
                $mappedData = $result;
            }
        }

        $modelClass = $this->modelClass;
        $instance = new $modelClass($mappedData);
        $this->importCount++;

        return $instance;
    }

    public function rules(): array
    {
        $mappedRules = [];
        foreach ($this->validationRules as $attribute => $rules) {
            if (isset($this->columnMap[$attribute])) {
                $excelKey = $this->columnMap[$attribute];
                $sluggedKey = Str::slug($excelKey, '_');
                $mappedRules[$sluggedKey] = $rules;
            } else {
                $mappedRules[$attribute] = $rules;
            }
        }

        return $mappedRules;
    }

    public function batchSize(): int
    {
        return 200;
    }

    public function chunkSize(): int
    {
        return 200;
    }

    public function getImportedCount(): int
    {
        return $this->importCount;
    }
}
