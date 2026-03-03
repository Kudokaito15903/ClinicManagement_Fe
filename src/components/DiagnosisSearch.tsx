import { useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getDiagnoses } from '@/api/diagnoses';
import type { Diagnosis } from '@/types';

interface Props {
    value: number | null;
    onChange: (id: number | null) => void;
    error?: string;
}

export default function DiagnosisSearch({ value, onChange, error }: Props) {
    const [options, setOptions] = useState<Diagnosis[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<Diagnosis | null>(null);

    const handleSearch = (keyword: string) => {
        if (!keyword) return;
        setLoading(true);
        getDiagnoses(keyword)
            .then(setOptions)
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    return (
        <Autocomplete
            options={options}
            value={selected}
            loading={loading}
            getOptionLabel={(d) => `[${d.icdCode}] ${d.name}`}
            filterOptions={(x) => x}
            onInputChange={(_, v) => handleSearch(v)}
            onChange={(_, v) => {
                setSelected(v);
                onChange(v ? v.id : null);
                if (v) setOptions([v]);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Chẩn đoán (mã ICD)"
                    placeholder="Tìm mã ICD..."
                    error={!!error}
                    helperText={error}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                            <>
                                {loading ? <CircularProgress size={16} /> : null}
                                {params.InputProps.endAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    );
}
