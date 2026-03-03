import { useEffect, useState } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { getDoctors } from '@/api/doctors';
import type { Doctor } from '@/types';

interface Props {
    value: number | null;
    onChange: (id: number | null) => void;
    error?: string;
    required?: boolean;
}

export default function DoctorSelect({ value, onChange, error, required }: Props) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getDoctors()
            .then(setDoctors)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const selected = doctors.find((d) => d.id === value) ?? null;

    return (
        <Autocomplete
            options={doctors}
            value={selected}
            loading={loading}
            getOptionLabel={(d) => `${d.fullName}${d.specialty ? ` — ${d.specialty}` : ''}`}
            onChange={(_, v) => onChange(v ? v.id : null)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Bác sĩ"
                    required={required}
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
